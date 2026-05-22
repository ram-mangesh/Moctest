import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:examprep_app/core/api/dio_client.dart';
import 'package:examprep_app/core/theme/app_theme.dart';
import 'package:examprep_app/shared/widgets/user_layout.dart';

class ResultScreen extends ConsumerStatefulWidget {
  final Map<String, dynamic>? resultData;
  const ResultScreen({super.key, this.resultData});

  @override
  ConsumerState<ResultScreen> createState() => _ResultScreenState();
}

class _ResultScreenState extends ConsumerState<ResultScreen> {
  String? _aiRecommendation;
  Timer? _aiTimer;

  @override
  void initState() {
    super.initState();
    _aiRecommendation = widget.resultData?['aiRecommendation'];
    if (widget.resultData?['attemptId'] != null) {
      _startAiPolling(widget.resultData!['attemptId']);
    }
  }

  @override
  void dispose() {
    _aiTimer?.cancel();
    super.dispose();
  }

  void _startAiPolling(dynamic attemptId) {
    _aiTimer = Timer.periodic(const Duration(seconds: 4), (timer) async {
      try {
        final res = await ref.read(dioClientProvider).get('/user/test/ai-result', queryParameters: {'attemptId': attemptId});
        final rec = res.data['aiRecommendation']?.toString() ?? '';
        if (rec.isNotEmpty && rec != "AI is generating recommendations...") {
          if (mounted) setState(() => _aiRecommendation = rec);
          timer.cancel();
        }
      } catch (_) {}
    });
  }

  @override
  Widget build(BuildContext context) {
    final data = widget.resultData ?? {};
    final total = (data['total'] as num?)?.toInt() ?? 0;
    final correct = (data['correct'] as num?)?.toInt() ?? 0;
    final wrong = (data['wrong'] as num?)?.toInt() ?? 0;
    final skipped = total - correct - wrong;
    final pct = total > 0 ? (correct * 100 / total).round() : 0;
    final questions = (data['questions'] as List?) ?? [];
    final attemptId = data['attemptId'];

    final isPass = pct >= 40;
    final scoreColor = pct >= 80 ? Colors.green : pct >= 60 ? Colors.orange : pct >= 40 ? Colors.indigo : Colors.red;

    return UserLayout(
      title: 'Result Analysis',
      child: Stack(
        children: [
          // Background Orbs
          Positioned(top: -100, left: -100, child: Container(width: 300, height: 300, decoration: BoxDecoration(color: Colors.indigo.withOpacity(0.05), shape: BoxShape.circle))),
          Positioned(bottom: -100, right: -100, child: Container(width: 300, height: 300, decoration: BoxDecoration(color: Colors.purple.withOpacity(0.05), shape: BoxShape.circle))),
          
          SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHero(pct, isPass, scoreColor),
                const SizedBox(height: 24),
                
                // Stat Cards Row
                Row(
                  children: [
                    Expanded(child: _statCard('TOTAL', '$total', Colors.grey.shade700)),
                    const SizedBox(width: 10),
                    Expanded(child: _statCard('CORRECT', '$correct', Colors.green)),
                    const SizedBox(width: 10),
                    Expanded(child: _statCard('WRONG', '$wrong', Colors.red)),
                  ],
                ),
                const SizedBox(height: 32),

                // Weak Topics
                if (data['weakTopics'] != null && (data['weakTopics'] as List).isNotEmpty) ...[
                  _sectionLabel('WEAK TOPICS'),
                  const SizedBox(height: 12),
                  ...(data['weakTopics'] as List).map((wt) => _weakTopicListTile(wt.toString())),
                  const SizedBox(height: 32),
                ],

                // AI RECOMMENDATION
                _sectionLabel('AI RECOMMENDATION'),
                const SizedBox(height: 12),
                _aiCard(attemptId),
                const SizedBox(height: 32),

                // DETAILED REVIEW
                if (questions.isNotEmpty) ...[
                  _sectionLabel('DETAILED REVIEW'),
                  const SizedBox(height: 12),
                  ...questions.asMap().entries.map((e) => _QReview(idx: e.key, q: e.value as Map<String, dynamic>)),
                ],
                
                const SizedBox(height: 40),
                
                // Actions
                Row(
                  children: [
                    Expanded(child: OutlinedButton(onPressed: () => context.go('/home'), style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))), child: const Text('Back to Home', style: TextStyle(fontWeight: FontWeight.bold)))),
                    const SizedBox(width: 16),
                    Expanded(child: ElevatedButton(onPressed: () => context.go('/home'), style: ElevatedButton.styleFrom(backgroundColor: Colors.indigo, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)), elevation: 2), child: const Text('Try Again', style: TextStyle(fontWeight: FontWeight.bold)))),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHero(int pct, bool isPass, Color scoreColor) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white.withOpacity(0.8), borderRadius: BorderRadius.circular(24), border: Border.all(color: Colors.indigo.withOpacity(0.1)), boxShadow: [BoxShadow(color: Colors.indigo.withOpacity(0.05), blurRadius: 20)]),
      child: Row(
        children: [
          // Circular Progress
          SizedBox(
            width: 100, height: 100,
            child: Stack(
              alignment: Alignment.center,
              children: [
                SizedBox(width: 100, height: 100, child: CircularProgressIndicator(value: pct / 100, strokeWidth: 8, strokeCap: StrokeCap.round, backgroundColor: scoreColor.withOpacity(0.1), color: scoreColor)),
                Column(mainAxisSize: MainAxisSize.min, children: [Text('$pct%', style: GoogleFonts.plusJakartaSans(fontSize: 24, fontWeight: FontWeight.w900, color: scoreColor)), const Text('Score', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey))]),
              ],
            ),
          ),
          const SizedBox(width: 24),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('YOUR RESULT', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.grey, letterSpacing: 1.2)),
                const SizedBox(height: 4),
                Text(isPass ? 'Well done! 🎉' : 'Keep practicing 💪', style: GoogleFonts.plusJakartaSans(fontSize: 22, fontWeight: FontWeight.w900, color: const Color(0xFF1E1B4B))),
                const SizedBox(height: 8),
                Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: (isPass ? Colors.green : Colors.red).withOpacity(0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: (isPass ? Colors.green : Colors.red).withOpacity(0.2))), child: Text(isPass ? '✓ Passed' : '✗ Failed', style: TextStyle(color: isPass ? Colors.green : Colors.red, fontWeight: FontWeight.bold, fontSize: 12))),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _statCard(String label, String val, Color c) => Container(padding: const EdgeInsets.symmetric(vertical: 16), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.indigo.withOpacity(0.08))), child: Column(children: [Text(val, style: GoogleFonts.plusJakartaSans(fontSize: 24, fontWeight: FontWeight.w900, color: c)), const SizedBox(height: 4), Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 0.5))]));

  Widget _sectionLabel(String text) => Text(text, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 1.2));

  Widget _weakTopicListTile(String topic) => Container(margin: const EdgeInsets.only(bottom: 8), padding: const EdgeInsets.all(14), decoration: BoxDecoration(color: Colors.red.withOpacity(0.04), borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.red.withOpacity(0.12))), child: Row(children: [const Icon(Icons.warning_amber_rounded, color: Colors.red, size: 18), const SizedBox(width: 12), Expanded(child: Text(topic, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(0xFF1E1B4B))))]));

  Widget _aiCard(dynamic attemptId) {
    final isLoading = _aiRecommendation == null || _aiRecommendation == "" || _aiRecommendation == "AI is generating recommendations...";
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(gradient: LinearGradient(colors: [Colors.indigo.shade50, Colors.purple.shade50]), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.indigo.withOpacity(0.1))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: Colors.indigo, borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.psychology, color: Colors.white, size: 20)),
              const SizedBox(width: 12),
              const Text('AI Performance Insights', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: Color(0xFF1E1B4B))),
              if (isLoading) const Padding(padding: EdgeInsets.only(left: 12), child: SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2))),
            ],
          ),
          const SizedBox(height: 16),
          Text(isLoading ? 'Personalising recommendations based on your behavior...' : _aiRecommendation!, style: TextStyle(fontSize: 14, color: Colors.indigo.shade900, height: 1.6, fontStyle: isLoading ? FontStyle.italic : FontStyle.normal)),
        ],
      ),
    );
  }
}

class _QReview extends StatelessWidget {
  final int idx;
  final Map<String, dynamic> q;
  const _QReview({required this.idx, required this.q});

  @override
  Widget build(BuildContext context) {
    final selected = q['selectedAnswer']?.toString() ?? '';
    final correct = q['correctAnswer']?.toString() ?? '';
    final isCorrect = selected == correct && selected.isNotEmpty;
    final isSkipped = selected.isEmpty;
    final color = isSkipped ? Colors.grey : (isCorrect ? Colors.green : Colors.red);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(color: color.withOpacity(0.05), borderRadius: BorderRadius.circular(18), border: Border.all(color: color.withOpacity(0.15))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(6)), child: Text('Q${idx + 1}', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: color))),
              const SizedBox(width: 12),
              if (isCorrect) const Icon(Icons.check_circle, color: Colors.green, size: 16)
              else if (isSkipped) const Icon(Icons.help_outline, color: Colors.grey, size: 16)
              else const Icon(Icons.cancel, color: Colors.red, size: 16),
              const SizedBox(width: 8),
              Text(isCorrect ? 'Correct' : (isSkipped ? 'Skipped' : 'Incorrect'), style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: color)),
            ],
          ),
          const SizedBox(height: 12),
          Text(q['question']?.toString() ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF1E1B4B))),
          const SizedBox(height: 16),
          Row(
            children: [
              _answerBadge('YOU', selected.isEmpty ? '—' : selected, isCorrect || isSkipped ? Colors.grey : Colors.red),
              const SizedBox(width: 8),
              _answerBadge('CORRECT', correct, Colors.green),
            ],
          ),
          if (q['explanation'] != null && q['explanation'].toString().isNotEmpty) ...[
            const SizedBox(height: 16),
            const Divider(height: 1),
            const SizedBox(height: 12),
            Text('Explanation:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Colors.indigo.shade300)),
            const SizedBox(height: 4),
            Text(q['explanation'], style: TextStyle(fontSize: 13, color: Colors.grey.shade700, height: 1.5, fontStyle: FontStyle.italic)),
          ]
        ],
      ),
    );
  }

  Widget _answerBadge(String label, String val, Color c) => Expanded(child: Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10), border: Border.all(color: c.withOpacity(0.1))), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(label, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.grey)), Text(val, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: c))])));
}
