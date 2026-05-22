import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import 'package:examprep_app/core/api/dio_client.dart';

class SubjectPage extends ConsumerStatefulWidget {
  final String examId;
  const SubjectPage({super.key, required this.examId});

  @override
  ConsumerState<SubjectPage> createState() => _SubjectPageState();
}

class _SubjectPageState extends ConsumerState<SubjectPage> {
  List<dynamic> _subjects = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ref.read(dioClientProvider).get('/user/subjects?examId=${widget.examId}');
      if (mounted) setState(() { _subjects = res.data ?? []; _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
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
            _eyebrow('Subjects'),
            const SizedBox(height: 12),
            Text('Subjects', style: GoogleFonts.plusJakartaSans(fontSize: 32, fontWeight: FontWeight.w900, color: const Color(0xFF1E1B4B))),
            const Text('Choose a subject to start practicing', style: TextStyle(color: Colors.grey, fontSize: 13)),
            const SizedBox(height: 32),
            _loading ? const Center(child: CircularProgressIndicator()) : (_subjects.isEmpty ? _empty() : _grid()),
          ],
        ),
      ),
    );
  }

  Widget _eyebrow(String text) {
    return Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4), decoration: BoxDecoration(color: Colors.purple.withOpacity(0.08), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.purple.withOpacity(0.2))), child: Row(mainAxisSize: MainAxisSize.min, children: [Container(width: 5, height: 5, decoration: const BoxDecoration(color: Colors.purple, shape: BoxShape.circle)), const SizedBox(width: 6), Text(text.toUpperCase(), style: const TextStyle(color: Colors.purple, fontWeight: FontWeight.bold, fontSize: 10, letterSpacing: 1))]));
  }

  Widget _grid() => GridView.builder(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), itemCount: _subjects.length, gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 16, mainAxisSpacing: 16, childAspectRatio: 1.5), itemBuilder: (c, i) => _subjectCard(_subjects[i]));

  Widget _subjectCard(Map<String, dynamic> s) {
    return InkWell(
      onTap: () => context.push('/subject/${s['id']}'),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.indigo.withOpacity(0.05)), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)]),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(width: 40, height: 40, decoration: BoxDecoration(color: Colors.purple.withOpacity(0.1), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.menu_book, color: Colors.purple, size: 20)),
            const SizedBox(height: 16),
            Text(s['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            Text('${s['topicCount'] ?? 0} topics', style: const TextStyle(color: Colors.grey, fontSize: 12)),
          ],
        ),
      ),
    );
  }

  Widget _empty() => const Center(child: Text('No subjects found'));
}
