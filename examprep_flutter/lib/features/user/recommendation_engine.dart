import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import 'package:examprep_app/core/api/dio_client.dart';

class RecommendationEngine extends ConsumerStatefulWidget {
  const RecommendationEngine({super.key});

  @override
  ConsumerState<RecommendationEngine> createState() => _RecommendationEngineState();
}

class _RecommendationEngineState extends ConsumerState<RecommendationEngine> {
  List<dynamic> _attempts = [];
  bool _loading = true;

  final List<Map<String, String>> _mentalResources = [
    { "icon": "🫁", "label": "4-7-8 Breathing Exercise", "desc": "Reduce anxiety in 60 seconds", "link": "/wellbeing" },
    { "icon": "😴", "label": "Sleep Hygiene Tip", "desc": "7–9 hrs sleep = 40% better retention", "link": "/wellbeing" },
    { "icon": "🧘", "label": "Mindfulness Break", "desc": "5-min mindfulness reduces cortisol", "link": "/wellbeing" },
  ];

  final List<String> _studyTips = [
    "Try the Pomodoro method: 25 mins focus, 5 mins break.",
    "Teach the concept to someone else — best way to learn.",
    "Review weak topics in the morning when memory is freshest.",
    "Space your practice over days rather than cramming.",
    "Use active recall — close notes and write what you remember.",
  ];

  @override
  void initState() {
    super.initState();
    _fetchAttempts();
  }

  Future<void> _fetchAttempts() async {
    try {
      final res = await ref.read(dioClientProvider).get("/user/test/attempts");
      if (mounted) setState(() { _attempts = res.data ?? []; _loading = false; });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    // Logic parity: compute metrics
    final topicMap = <String, Map<String, dynamic>>{};
    for (var a in _attempts) {
      final k = a['topicId']?.toString() ?? a['topic']?.toString() ?? "unknown";
      final n = a['topicName']?.toString() ?? a['topic']?.toString() ?? "Unknown Topic";
      topicMap.putIfAbsent(k, () => {'id': k, 'name': n, 'total': 0, 'correct': 0});
      topicMap[k]!['total']++;
      if ((a['scorePercent'] ?? 0) >= 60) topicMap[k]!['correct']++;
    }

    final topics = topicMap.values.map((t) {
      final acc = (t['total'] as int) > 0 ? ((t['correct'] as int) / (t['total'] as int) * 100).round() : 0;
      return {...t, 'acc': acc};
    }).toList();

    final weakTopics = topics.where((t) => (t['acc'] as int) < 60).toList()..sort((a, b) => (a['acc'] as int).compareTo(b['acc'] as int));
    final strongTopics = topics.where((t) => (t['acc'] as int) >= 75).toList();

    final sorted = List.from(_attempts)..sort((a, b) => DateTime.parse(b['attemptedAt']).compareTo(DateTime.parse(a['attemptedAt'])));
    final lastAttemptDaysAgo = sorted.isNotEmpty 
        ? DateTime.now().difference(DateTime.parse(sorted[0]['attemptedAt'])).inDays 
        : 999;
    
    final totalThisWeek = _attempts.where((a) => DateTime.parse(a['attemptedAt']).isAfter(DateTime.now().subtract(const Duration(days: 7)))).length;
    final avgScore = _attempts.isNotEmpty ? (_attempts.fold<num>(0, (s, a) => s + (a['scorePercent'] ?? 0)) / _attempts.length).round() : 0;
    
    final last5 = sorted.take(5).toList();
    final last5Avg = last5.isNotEmpty ? (last5.fold<num>(0, (s, a) => s + (a['scorePercent'] ?? 0)) / last5.length).round() : 0;
    final improving = last5Avg > avgScore + 5;

    final wbScore = (60 + (last5Avg > 70 ? 20 : last5Avg < 40 ? -20 : 0) - (lastAttemptDaysAgo > 7 ? 20 : 0)).clamp(0, 100);
    final needsBreak = wbScore < 40;

    final achievementNudges = <String>[];
    if (totalThisWeek < 3) achievementNudges.add("📅 Complete ${3 - totalThisWeek} more test${3 - totalThisWeek > 1 ? "s" : ""} this week to hit your goal!");
    if (weakTopics.isNotEmpty) achievementNudges.add("🎯 Master \"${weakTopics[0]['name']}\" to unlock the \"Topic Master\" badge.");
    if (improving) achievementNudges.add("📈 You're improving! Keep this streak going for the Rising Star badge.");
    if (avgScore >= 80) achievementNudges.add("🌟 Top performer! Challenge yourself with DIFFICULT difficulty settings.");

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text('Personalised Guidance', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _eyebrow("✨ RECOMMENDATIONS"),
            const SizedBox(height: 8),
            Text("AI-Powered Guidance", style: GoogleFonts.plusJakartaSans(fontSize: 26, fontWeight: FontWeight.w900)),
            Text("Based on your performance and wellbeing", style: TextStyle(color: Colors.indigo.withOpacity(0.5))),
            const SizedBox(height: 24),

            if (lastAttemptDaysAgo > 3) _alertBanner("You haven't practised in $lastAttemptDaysAgo days!", "Consistency is key to retention.", Icons.history),
            if (improving) _successBanner("You're improving!", "Recent average: $last5Avg% (vs $avgScore% overall)", Icons.trending_up),

            const SizedBox(height: 24),
            _buildSectionTitle("📚 Academic Recommendations"),
            if (weakTopics.isEmpty && _attempts.isEmpty) _emptyState("Take some tests to get personalised suggestions!"),
            if (weakTopics.isNotEmpty) ...[
              _subLabel("Focus These Next"),
              ...weakTopics.take(3).map((t) => _recCard(t['name'], "${t['acc']}% accuracy · Set Easy mode", Colors.red)),
            ],
            if (strongTopics.isNotEmpty) ...[
              const SizedBox(height: 16),
              _subLabel("Strengths to Maintain"),
              ...strongTopics.take(3).map((t) => _recCard(t['name'], "${t['acc']}% accuracy · Challenge with Hard mode", Colors.green)),
            ],

            const SizedBox(height: 32),
            _buildSectionTitle("🧘 Wellbeing Suggestions"),
            if (needsBreak) _nudge("⚠️ Recent scores suggest high stress. Please take a break!", Colors.red),
            ..._mentalResources.map((r) => _recCard(r['label']!, r['desc']!, Colors.indigo, icon: Text(r['icon']!, style: const TextStyle(fontSize: 24)))),

            const SizedBox(height: 32),
            _buildSectionTitle("🏆 Achievement Nudges"),
            if (achievementNudges.isEmpty) _emptyState("Keep practising to unlock suggestions!")
            else ...achievementNudges.map((n) => _nudge(n, Colors.indigo)),

            const SizedBox(height: 24),
            _weeklyGoal(totalThisWeek),
          ],
        ),
      ),
    );
  }

  Widget _eyebrow(String text) => Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4), decoration: BoxDecoration(color: Colors.indigo.withOpacity(0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.indigo.withOpacity(0.2))), child: Text(text, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.indigo, letterSpacing: 1.2)));

  Widget _alertBanner(String title, String sub, IconData icon) => Container(margin: const EdgeInsets.only(bottom: 16), padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.red.withOpacity(0.05), borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.red.withOpacity(0.1))), child: Row(children: [Icon(icon, color: Colors.red), const SizedBox(width: 14), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.red)), Text(sub, style: TextStyle(fontSize: 12, color: Colors.red.withOpacity(0.6)))])), ElevatedButton(onPressed: () => context.go('/home'), style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white, elevation: 0), child: const Text('Start Test'))]));

  Widget _successBanner(String title, String sub, IconData icon) => Container(margin: const EdgeInsets.only(bottom: 16), padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.green.withOpacity(0.05), borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.green.withOpacity(0.1))), child: Row(children: [Icon(icon, color: Colors.green), const SizedBox(width: 14), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green)), Text(sub, style: TextStyle(fontSize: 12, color: Colors.green.withOpacity(0.6)))]))]));

  Widget _buildSectionTitle(String title) => Padding(padding: const EdgeInsets.only(bottom: 16), child: Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1E1B4B))));

  Widget _subLabel(String text) => Padding(padding: const EdgeInsets.only(bottom: 8), child: Text(text.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)));

  Widget _recCard(String title, String subtitle, Color color, {Widget? icon}) => Container(margin: const EdgeInsets.only(bottom: 10), padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: color.withOpacity(0.05), borderRadius: BorderRadius.circular(16), border: Border.all(color: color.withOpacity(0.1))), child: Row(children: [Container(width: 40, height: 40, decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(10)), child: Center(child: icon ?? Icon(LucideIcons.target, color: color, size: 20))), const SizedBox(width: 14), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: const TextStyle(fontWeight: FontWeight.bold)), Text(subtitle, style: TextStyle(fontSize: 12, color: color.withOpacity(0.8)))]))]));

  Widget _nudge(String text, Color color) => Container(width: double.infinity, margin: const EdgeInsets.only(bottom: 8), padding: const EdgeInsets.all(14), decoration: BoxDecoration(color: color.withOpacity(0.08), borderRadius: BorderRadius.circular(12), border: Border.all(color: color.withOpacity(0.15))), child: Text(text, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: color)));

  Widget _emptyState(String text) => Padding(padding: const EdgeInsets.all(20), child: Center(child: Text(text, style: const TextStyle(color: Colors.grey, fontSize: 13))));

  Widget _weeklyGoal(int count) {
    double progress = (count / 3).clamp(0, 1.0);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("WEEKLY GOAL", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
        const SizedBox(height: 8),
        ClipRRect(borderRadius: BorderRadius.circular(10), child: LinearProgressIndicator(value: progress, minHeight: 10, backgroundColor: Colors.indigo.withOpacity(0.05), valueColor: const AlwaysStoppedAnimation(Colors.indigo))),
        const SizedBox(height: 4),
        Text("$count/3 tests this week", style: const TextStyle(fontSize: 12, color: Colors.grey)),
      ],
    );
  }
}
