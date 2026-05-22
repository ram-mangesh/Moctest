import 'package:flutter/material.dart';
import '../../../../core/api/dio_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class QuestionList extends ConsumerWidget {
  final List<dynamic> questions;
  final ValueChanged<Map<String, dynamic>> onEdit;
  final VoidCallback refresh;

  const QuestionList({super.key, required this.questions, required this.onEdit, required this.refresh});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('❓ Questions', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
              decoration: BoxDecoration(color: const Color(0xFFF59E0B).withOpacity(0.12), borderRadius: BorderRadius.circular(20)),
              child: Text('${questions.length} questions', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFD97706))),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (questions.isEmpty)
          const Center(child: Padding(padding: EdgeInsets.all(40), child: Text('📋 No questions yet — add some above!', style: TextStyle(color: Colors.grey))))
        else
          ...List.generate(questions.length, (i) => _QuestionItem(index: i, question: questions[i], onEdit: onEdit, refresh: refresh)),
      ],
    );
  }
}

class _QuestionItem extends ConsumerWidget {
  final int index;
  final Map<String, dynamic> question;
  final ValueChanged<Map<String, dynamic>> onEdit;
  final VoidCallback refresh;

  const _QuestionItem({required this.index, required this.question, required this.onEdit, required this.refresh});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final type = question['type'] ?? 'MCQ';
    final diff = question['difficulty'] ?? 'EASY';

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.14)),
        boxShadow: [BoxShadow(color: const Color(0xFFF59E0B).withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  _badge(type, _getTypeColor(type)),
                  const SizedBox(width: 6),
                  _badge(diff, _getDiffColor(diff)),
                ],
              ),
              Text('#${index + 1}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
            ],
          ),
          const SizedBox(height: 10),
          Text(question['question'] ?? '', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, height: 1.5)),
          const SizedBox(height: 10),
          if (type != 'NAQ') ...[
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              childAspectRatio: 4,
              mainAxisSpacing: 6,
              crossAxisSpacing: 6,
              children: List.generate((question['options'] as List?)?.length ?? 0, (oi) {
                final isCorrect = (type == 'MCQ' && question['correct'] == oi) || (type == 'MULTI' && (question['correctMultiple'] as List?)?.contains(oi) == true);
                return _optionItem(String.fromCharCode(65 + oi), question['options'][oi].toString(), isCorrect);
              }),
            ),
          ] else ...[
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: const Color(0xFFF59E0B).withOpacity(0.06), borderRadius: BorderRadius.circular(8)),
              child: Text('Answer: ${question['correctNumeric']} ${question['tolerance'] > 0 ? "± ${question['tolerance']}" : ""}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF78350F))),
            ),
          ],
          const SizedBox(height: 10),
          const Divider(),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('📁 ${question['topic']?['name'] ?? ''}', style: const TextStyle(fontSize: 11.5, color: Colors.grey)),
              Row(
                children: [
                  TextButton(onPressed: () => onEdit(question), child: const Text('✏️ Edit')),
                  TextButton(
                    onPressed: () async {
                      final conf = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(title: const Text('Delete?'), actions: [TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('No')), TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Yes'))]));
                      if (conf == true) {
                        await ref.read(dioClientProvider).delete('/admin/questions/${question['id']}');
                        refresh();
                      }
                    },
                    child: const Text('🗑️ Delete', style: TextStyle(color: Colors.red)),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _badge(String l, Color c) => Container(padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3), decoration: BoxDecoration(color: c.withOpacity(0.15), borderRadius: BorderRadius.circular(20)), child: Text(l, style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: c)));

  Widget _optionItem(String letter, String text, bool correct) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
    decoration: BoxDecoration(color: correct ? const Color(0xFF10B981).withOpacity(0.1) : Colors.grey.shade50, borderRadius: BorderRadius.circular(8)),
    child: Row(
      children: [
        Container(
          width: 20, height: 20,
          decoration: BoxDecoration(color: correct ? const Color(0xFF10B981).withOpacity(0.2) : const Color(0xFF6366F1).withOpacity(0.12), borderRadius: BorderRadius.circular(6)),
          child: Center(child: Text(letter, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: correct ? const Color(0xFF34D399) : const Color(0xFF818CF8)))),
        ),
        const SizedBox(width: 8),
        Expanded(child: Text(text, style: TextStyle(fontSize: 12.5, fontWeight: correct ? FontWeight.bold : FontWeight.normal, color: correct ? const Color(0xFF10B981) : Colors.black))),
      ],
    ),
  );

  Color _getTypeColor(String t) {
    if (t == 'MCQ') return const Color(0xFF6366F1);
    if (t == 'MULTI') return const Color(0xFFA855F7);
    return const Color(0xFFF59E0B);
  }

  Color _getDiffColor(String d) {
    if (d == 'DIFFICULT') return const Color(0xFFEF4444);
    if (d == 'MEDIUM') return const Color(0xFFF59E0B);
    return const Color(0xFF10B981);
  }
}
