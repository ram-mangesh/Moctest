import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:examprep_app/core/api/dio_client.dart';
import '../user/widgets/exam_card.dart';

class RealExamsPage extends ConsumerStatefulWidget {
  const RealExamsPage({super.key});
  @override
  ConsumerState<RealExamsPage> createState() => _RealExamsPageState();
}

class _RealExamsPageState extends ConsumerState<RealExamsPage> {
  List<dynamic> _exams = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final res = await ref.read(dioClientProvider).get('/user/exams');
      setState(() { _exams = res.data ?? []; _loading = false; });
    } catch (_) { setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0, title: Text('Real Exams', style: GoogleFonts.plusJakartaSans(color: Colors.black, fontWeight: FontWeight.bold))),
      body: _loading ? const Center(child: CircularProgressIndicator()) : GridView.builder(
        padding: const EdgeInsets.all(24),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 16, mainAxisSpacing: 16, childAspectRatio: 0.8),
        itemCount: _exams.length,
        itemBuilder: (context, index) => ExamCard(exam: _exams[index], isRealExam: true),
      ),
    );
  }
}

class RealExamPreviewPage extends ConsumerStatefulWidget {
  final String examId;
  const RealExamPreviewPage({super.key, required this.examId});
  @override
  ConsumerState<RealExamPreviewPage> createState() => _RealExamPreviewPageState();
}

class _RealExamPreviewPageState extends ConsumerState<RealExamPreviewPage> {
  Map<String, dynamic>? _data;
  int _duration = 1800;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final res = await ref.read(dioClientProvider).get('/real-exam/preview?examId=${widget.examId}');
    setState(() => _data = res.data);
  }

  @override
  Widget build(BuildContext context) {
    if (_data == null) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    return Scaffold(
      backgroundColor: const Color(0xFFF5F3EE),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.arrow_back)),
              const SizedBox(height: 20),
              _buildCard(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCard() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.grey.withOpacity(0.2))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('REAL EXAM', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 10, letterSpacing: 1)),
          const SizedBox(height: 8),
          Text(_data!['title'] ?? 'Exam Preview', style: GoogleFonts.lora(fontSize: 28, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(child: _stat('Total', _data!['totalQuestions']?.toString() ?? '0')),
              const SizedBox(width: 12),
              Expanded(child: _stat('Remaining', _data!['remainingQuestions']?.toString() ?? '0')),
            ],
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {}, // Navigate to RealExam Engine
              style: ElevatedButton.styleFrom(backgroundColor: Colors.black, foregroundColor: Colors.white, padding: const EdgeInsets.all(16)),
              child: const Text('START EXAM →'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _stat(String lbl, String val) => Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.grey.withOpacity(0.05), borderRadius: BorderRadius.circular(12)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(val, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)), Text(lbl.toUpperCase(), style: const TextStyle(color: Colors.grey, fontSize: 10))]));
}
