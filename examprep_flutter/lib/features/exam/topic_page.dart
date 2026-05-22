import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import 'package:examprep_app/core/api/dio_client.dart';
import 'widgets/difficulty_slider.dart';

class TopicPage extends ConsumerStatefulWidget {
  final String subjectId;
  const TopicPage({super.key, required this.subjectId});

  @override
  ConsumerState<TopicPage> createState() => _TopicPageState();
}

class _TopicPageState extends ConsumerState<TopicPage> {
  List<dynamic> _topics = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ref.read(dioClientProvider).get('/user/topics?subjectId=${widget.subjectId}');
      if (mounted) setState(() { _topics = res.data ?? []; _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  void _showDifficultyModal(Map<String, dynamic> topic) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.all(28),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(22), boxShadow: [BoxShadow(color: Colors.indigo.withOpacity(0.2), blurRadius: 40)]),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(topic['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
                  IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close, size: 20)),
                ],
              ),
              Text('${topic['questionCount'] ?? "—"} questions available', style: const TextStyle(color: Colors.grey, fontSize: 13)),
              const SizedBox(height: 24),
              DifficultySlider(
                onConfirm: (diff) {
                  Navigator.pop(context);
                  context.push('/test/${topic['id']}', extra: {'difficulty': diff});
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0, leading: const BackButton(color: Colors.black)),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _eyebrow('Topics'),
            const SizedBox(height: 12),
            Text('Topics', style: GoogleFonts.plusJakartaSans(fontSize: 32, fontWeight: FontWeight.w900, color: const Color(0xFF1E1B4B))),
            const Text('Pick a topic and choose your difficulty level', style: TextStyle(color: Colors.grey, fontSize: 13)),
            const SizedBox(height: 32),
            _loading ? const Center(child: CircularProgressIndicator()) : (_topics.isEmpty ? _empty() : _grid()),
          ],
        ),
      ),
    );
  }

  Widget _eyebrow(String text) {
    return Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4), decoration: BoxDecoration(color: Colors.green.withOpacity(0.08), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.green.withOpacity(0.2))), child: Row(mainAxisSize: MainAxisSize.min, children: [Container(width: 5, height: 5, decoration: const BoxDecoration(color: Colors.green, shape: BoxShape.circle)), const SizedBox(width: 6), Text(text.toUpperCase(), style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 10, letterSpacing: 1))]));
  }

  Widget _grid() => GridView.builder(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), itemCount: _topics.length, gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 16, mainAxisSpacing: 16, childAspectRatio: 1.5), itemBuilder: (c, i) => _topicCard(_topics[i]));

  Widget _topicCard(Map<String, dynamic> t) {
    return InkWell(
      onTap: () => _showDifficultyModal(t),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.indigo.withOpacity(0.05)), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)]),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(width: 40, height: 40, decoration: BoxDecoration(color: Colors.green.withOpacity(0.1), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.topic, color: Colors.green, size: 20)),
            const SizedBox(height: 16),
            Text(t['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16), maxLines: 1, overflow: TextOverflow.ellipsis),
            Text('Question based practice', style: const TextStyle(color: Colors.grey, fontSize: 12)),
          ],
        ),
      ),
    );
  }

  Widget _empty() => const Center(child: Text('No topics found'));
}
