import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import 'package:examprep_app/core/api/dio_client.dart';
import 'widgets/roadmap_pdf_button.dart';

class ResultPage extends ConsumerStatefulWidget {
  final Map<String, dynamic> data;
  const ResultPage({super.key, required this.data});

  @override
  ConsumerState<ResultPage> createState() => _ResultPageState();
}

class _ResultPageState extends ConsumerState<ResultPage> {
  late String _aiText;
  Timer? _pollTimer;

  @override
  void initState() {
    super.initState();
    _aiText = widget.data['aiRecommendation'] ?? "";
    if (_aiText.isEmpty && widget.data['attemptId'] != null) {
      _startPolling();
    }
  }

  void _startPolling() {
    _pollTimer = Timer.periodic(const Duration(seconds: 3), (timer) async {
      try {
        final res = await ref.read(dioClientProvider).get('/user/test/ai-result?attemptId=${widget.data['attemptId']}');
        if (mounted && res.data?['aiRecommendation'] != null && res.data['aiRecommendation'].toString().isNotEmpty) {
          setState(() { _aiText = res.data['aiRecommendation']; });
          timer.cancel();
        }
      } catch (_) {}
    });
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final total = widget.data['total'] ?? 0;
    final correct = widget.data['correct'] ?? 0;
    final wrong = widget.data['wrong'] ?? 0;
    final percentage = total > 0 ? (correct / total * 100) : 0;
    final isPass = percentage >= 40;
    final weakTopics = widget.data['weakTopics'] as List? ?? [];

    final scoreColor = percentage >= 80 ? Colors.green : percentage >= 60 ? Colors.orange : percentage >= 40 ? Colors.indigo : Colors.red;

    return Scaffold(
      body: Stack(
        children: [
          _buildBackground(),
          SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 60),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 560),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TextButton.icon(onPressed: () => context.pop(), icon: const Icon(Icons.arrow_back, size: 16), label: const Text('Back')),
                    const SizedBox(height: 16),
                    _mainCard(percentage, isPass, scoreColor, total, correct, wrong, weakTopics),
                    const SizedBox(height: 16),
                    _aiCard(),
                    const SizedBox(height: 24),
                    _actions(),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBackground() {
    return Container(
      decoration: const BoxDecoration(gradient: LinearGradient(colors: [Color(0xFFEEF0FF), Color(0xFFFCE8F3)], begin: Alignment.topLeft, end: Alignment.bottomRight)),
      child: Stack(
        children: [
          Positioned(top: -100, left: -100, child: Container(width: 400, height: 400, decoration: BoxDecoration(color: Colors.indigo.withOpacity(0.08), shape: BoxShape.circle))),
          Positioned(bottom: -100, right: -100, child: Container(width: 400, height: 400, decoration: BoxDecoration(color: Colors.purple.withOpacity(0.06), shape: BoxShape.circle))),
        ],
      ),
    );
  }

  Widget _mainCard(num pct, bool isPass, Color c, int total, int correct, int wrong, List weak) {
    return Container(
      decoration: BoxDecoration(color: Colors.white.withOpacity(0.9), borderRadius: BorderRadius.circular(24), border: Border.all(color: Colors.indigo.withOpacity(0.1)), boxShadow: [BoxShadow(color: Colors.indigo.withOpacity(0.05), blurRadius: 20)]),
      child: Column(
        children: [
          Container(height: 6, width: double.infinity, decoration: BoxDecoration(color: c, borderRadius: const BorderRadius.vertical(top: Radius.circular(24)))),
          Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              children: [
                Row(
                  children: [
                    _scoreWheel(pct, c),
                    const SizedBox(width: 24),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('YOUR RESULT', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
                          Text(isPass ? 'Well done!' : 'Keep practicing', style: GoogleFonts.plusJakartaSans(fontSize: 24, fontWeight: FontWeight.w900, color: const Color(0xFF1E1B4B))),
                          const SizedBox(height: 8),
                          _passChip(isPass),
                        ],
                      ),
                    )
                  ],
                ),
                const SizedBox(height: 32),
                Row(
                  children: [
                    _statBlock('TOTAL', '$total', Colors.black87),
                    _statBlock('CORRECT', '$correct', Colors.green),
                    _statBlock('WRONG', '$wrong', Colors.red),
                  ],
                ),
                const SizedBox(height: 32),
                const Divider(),
                const SizedBox(height: 16),
                _weakTopics(weak),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _scoreWheel(num pct, Color c) {
    return Stack(
      alignment: Alignment.center,
      children: [
        SizedBox(width: 100, height: 100, child: CircularProgressIndicator(value: pct / 100, strokeWidth: 10, backgroundColor: c.withOpacity(0.1), color: c, strokeCap: StrokeCap.round)),
        Column(children: [Text('${pct.toStringAsFixed(1)}%', style: TextStyle(fontSize: 20, fontWeight: FontWeight.black, color: c)), const Text('SCORE', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Colors.grey))]),
      ],
    );
  }

  Widget _passChip(bool pass) => Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4), decoration: BoxDecoration(color: (pass ? Colors.green : Colors.red).withOpacity(0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: (pass ? Colors.green : Colors.red).withOpacity(0.2))), child: Text(pass ? '✓ PASSED' : '✗ FAILED', style: TextStyle(color: (pass ? Colors.green : Colors.red), fontWeight: FontWeight.bold, fontSize: 11)));

  Widget _statBlock(String l, String v, Color c) => Expanded(child: Container(padding: const EdgeInsets.symmetric(vertical: 16), decoration: const BoxDecoration(border: Border(right: BorderSide(color: Color(0xFFF1F5F9)))), child: Column(children: [Text(v, style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: c)), Text(l, style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold))])));

  Widget _weakTopics(List weak) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('WEAK TOPICS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
        const SizedBox(height: 12),
        if (weak.isEmpty)
           Container(width: double.infinity, padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: Colors.green.withOpacity(0.1), borderRadius: BorderRadius.circular(12)), child: const Text('✓ No weak topics — great performance!', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 13)))
        else
           ...weak.map((w) => Container(margin: const EdgeInsets.only(bottom: 8), padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: Colors.red.withOpacity(0.05), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.red.withOpacity(0.1))), child: Row(children: [Container(width: 6, height: 6, decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle)), const SizedBox(width: 12), Text(w.toString(), style: const TextStyle(fontWeight: FontWeight.w600))]))).toList(),
      ],
    );
  }

  Widget _aiCard() {
    return Container(
      decoration: BoxDecoration(color: Colors.white.withOpacity(0.9), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.indigo.withOpacity(0.1))),
      child: Column(
        children: [
          Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.indigo.shade50.withOpacity(0.5), borderRadius: const BorderRadius.vertical(top: Radius.circular(20))), child: Row(children: [const Text('🤖', style: TextStyle(fontSize: 18)), const SizedBox(width: 12), const Text('AI RECOMMENDATION', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.indigo)), const Spacer(), if (_aiText.isEmpty) const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2))])),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _aiText.isEmpty ? const Text('Generating personalized recommendations...', style: TextStyle(color: Colors.grey, fontStyle: FontStyle.italic)) : Text(_aiText, style: const TextStyle(fontSize: 14, height: 1.6, color: Color(0xFF4338CA))),
                const SizedBox(height: 16),
                RoadmapPdfButton(attemptId: widget.data['attemptId']?.toString()),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _actions() {
    return Row(
      children: [
        Expanded(child: OutlinedButton(onPressed: () => context.pop(), style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))), child: const Text('BACK'))),
        const SizedBox(width: 12),
        Expanded(child: ElevatedButton(onPressed: () => context.pop(), style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1), foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))), child: const Text('TRY AGAIN'))),
      ],
    );
  }
}
