import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:examprep_app/core/api/dio_client.dart';

class AdaptiveLearning extends ConsumerStatefulWidget {
  const AdaptiveLearning({super.key});

  @override
  ConsumerState<AdaptiveLearning> createState() => _AdaptiveLearningState();
}

class _AdaptiveLearningState extends ConsumerState<AdaptiveLearning> {
  List<dynamic> _topicData = [];
  Map<String, String> _overrides = {};
  Map<String, bool> _saving = {};
  bool _loading = true;

  final Map<String, Map<String, Color>> _difficultyColors = {
    'EASY': {'bg': const Color(0xFFDCFCE7), 'text': const Color(0xFF16A34A), 'border': const Color(0xFF86EFAC)},
    'MEDIUM': {'bg': const Color(0xFFFEF9C3), 'text': const Color(0xFFCA8A04), 'border': const Color(0xFFFDE047)},
    'DIFFICULT': {'bg': const Color(0xFFFEE2E2), 'text': const Color(0xFFDC2626), 'border': const Color(0xFFFCA5A5)},
  };

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final dio = ref.read(dioClientProvider);
      final res = await dio.get("/user/test/attempts");
      final attempts = res.data ?? [];

      // Build per-topic stats
      final map = <String, Map<String, dynamic>>{};
      for (var a in attempts) {
        final key = a['topicId']?.toString() ?? a['topic']?.toString() ?? "unknown";
        final label = a['topicName']?.toString() ?? a['topic']?.toString() ?? "Unknown Topic";
        map.putIfAbsent(key, () => {'topicId': key, 'topicName': label, 'total': 0, 'correct': 0, 'dates': []});
        map[key]!['total']++;
        if ((a['scorePercent'] ?? 0) >= 60) map[key]!['correct']++;
        map[key]!['dates'].add(a['attemptedAt']);
      }

      final topics = map.values.map((t) {
        final acc = (t['total'] as int) > 0 ? ((t['correct'] as int) / (t['total'] as int) * 100).round() : 0;
        return {
          ...t,
          'accuracy': acc,
          'classification': acc < 50 ? "Weak" : acc < 75 ? "Average" : "Strong",
        };
      }).toList()..sort((a, b) => (a['accuracy'] as int).compareTo(b['accuracy'] as int));

      // Load overrides
      final logsRes = await dio.get("/api/user/difficulty/logs");
      final logs = logsRes.data ?? [];
      final overrideMap = <String, String>{};
      for (var l in logs) {
        overrideMap[l['topicId'].toString()] = l['selectedDifficulty'];
      }

      if (mounted) {
        setState(() {
          _topicData = topics;
          _overrides = overrideMap;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _handleDifficulty(String topicId, String diff) async {
    setState(() => _saving[topicId] = true);
    try {
      await ref.read(dioClientProvider).post("/api/user/difficulty/override", data: {
        'topicId': topicId,
        'difficulty': diff,
      });
      setState(() => _overrides[topicId] = diff);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('✓ Difficulty set to $diff for selected topic.')));
      }
    } catch (_) {}
    setState(() => _saving[topicId] = false);
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    final weak = _topicData.where((t) => t['classification'] == "Weak").toList();
    final average = _topicData.where((t) => t['classification'] == "Average").toList();
    final strong = _topicData.where((t) => t['classification'] == "Strong").toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text('Adaptive Learning', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _eyebrow("🧠 BRAIN UPGRADE"),
            const SizedBox(height: 8),
            Text("Personalised Learning Path", style: GoogleFonts.plusJakartaSans(fontSize: 26, fontWeight: FontWeight.w900)),
            Text("Ranked by performance — focus on weak areas first", style: TextStyle(color: Colors.purple.withOpacity(0.5))),
            const SizedBox(height: 24),

            _summaryRow(weak.length, average.length, strong.length),
            const SizedBox(height: 32),

            _sectionHeader("🗺️ Recommended Study Order", Colors.deepPurple),
            ..._topicData.take(5).toList().asMap().entries.map((e) => _roadmapTile(e.key + 1, e.value)),

            const SizedBox(height: 32),
            if (weak.isNotEmpty) ...[
              _sectionHeader("🔴 Weak Topics — Focus Here First", Colors.red),
              ...weak.map((t) => _topicCard(t)),
            ],

            if (average.isNotEmpty) ...[
              const SizedBox(height: 24),
              _sectionHeader("🟡 Average Topics — Keep Improving", Colors.orange),
              ...average.map((t) => _topicCard(t)),
            ],

            if (strong.isNotEmpty) ...[
              const SizedBox(height: 24),
              _sectionHeader("🟢 Strong Topics — Maintain & Challenge", Colors.green),
              ...strong.map((t) => _topicCard(t)),
            ],
          ],
        ),
      ),
    );
  }

  Widget _eyebrow(String text) => Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4), decoration: BoxDecoration(color: Colors.purple.withOpacity(0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.purple.withOpacity(0.2))), child: Text(text, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.purple, letterSpacing: 1.2)));

  Widget _summaryRow(int w, int a, int s) => Row(children: [
    _sumBox("Weak", w, Colors.red),
    const SizedBox(width: 8),
    _sumBox("Avg", a, Colors.orange),
    const SizedBox(width: 8),
    _sumBox("Strong", s, Colors.green),
  ]);

  Widget _sumBox(String lbl, int val, Color c) => Expanded(child: Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: c.withOpacity(0.05), borderRadius: BorderRadius.circular(14), border: Border.all(color: c.withOpacity(0.1))), child: Column(crossAxisAlignment: CrossAxisAlignment.center, children: [Text("$val", style: TextStyle(fontSize: 22, fontWeight: FontWeight.black, color: c)), Text(lbl.toUpperCase(), style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: c.withOpacity(0.6)))])));

  Widget _sectionHeader(String title, Color color) => Padding(padding: const EdgeInsets.only(bottom: 16), child: Row(children: [Text(title.toUpperCase(), style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: color, letterSpacing: 1))]));

  Widget _roadmapTile(int step, Map<String, dynamic> t) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.purple.withOpacity(0.1))),
      child: Row(
        children: [
          Container(width: 30, height: 30, decoration: BoxDecoration(color: Colors.purple.withOpacity(0.1), shape: BoxShape.circle), child: Center(child: Text("$step", style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.purple)))),
          const SizedBox(width: 14),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(t['topicName'], style: const TextStyle(fontWeight: FontWeight.bold)), Text("${t['accuracy']}% accuracy", style: const TextStyle(fontSize: 12, color: Colors.grey))])),
          IconButton(onPressed: () => _launchYT(t['topicName']), icon: const Icon(LucideIcons.youtube, color: Colors.red)),
        ],
      ),
    );
  }

  Widget _topicCard(Map<String, dynamic> t) {
    final cur = _overrides[t['topicId'].toString()] ?? "MEDIUM";
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: Colors.indigo.withOpacity(0.08)), boxShadow: [BoxShadow(color: Colors.indigo.withOpacity(0.03), blurRadius: 10)]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Expanded(child: Text(t['topicName'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15))), Text("${t['accuracy']}%", style: TextStyle(fontWeight: FontWeight.w900, color: t['accuracy'] < 50 ? Colors.red : Colors.green))]),
          const SizedBox(height: 8),
          ClipRRect(borderRadius: BorderRadius.circular(10), child: LinearProgressIndicator(value: t['accuracy'] / 100, minHeight: 6, backgroundColor: Colors.indigo.withOpacity(0.05), valueColor: AlwaysStoppedAnimation(t['accuracy'] < 50 ? Colors.red : Colors.green))),
          const SizedBox(height: 16),
          Row(children: ["EASY", "MEDIUM", "DIFFICULT"].map((d) {
            bool active = cur == d;
            final dc = _difficultyColors[d]!;
            return Padding(
              padding: const EdgeInsets.only(right: 6),
              child: GestureDetector(
                onTap: () => _handleDifficulty(t['topicId'].toString(), d),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: active ? dc['text'] : dc['bg'], borderRadius: BorderRadius.circular(20)),
                  child: Text(d, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: active ? Colors.white : dc['text'])),
                ),
              ),
            );
          }).toList()),
        ],
      ),
    );
  }

  Future<void> _launchYT(String topic) async {
    final url = Uri.parse("https://www.youtube.com/results?search_query=${Uri.encodeComponent(topic + ' lesson')}");
    if (await canLaunchUrl(url)) await launchUrl(url);
  }
}
