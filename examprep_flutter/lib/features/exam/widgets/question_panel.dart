import 'package:flutter/material.dart';
import 'ai_hint_whisperer.dart';

class QuestionPanel extends StatelessWidget {
  final Map<String, dynamic> question;
  final int index;
  final ValueChanged<dynamic> onAnswer;

  const QuestionPanel({
    super.key,
    required this.question,
    required this.index,
    required this.onAnswer,
  });

  @override
  Widget build(BuildContext context) {
    final type = question['type'] ?? 'MCQ';
    final options = question['options'] as List? ?? [];

    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.indigo.withOpacity(0.1)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4), decoration: BoxDecoration(color: Colors.indigo.shade50, borderRadius: BorderRadius.circular(20)), child: Text('QUESTION ${index + 1}', style: TextStyle(color: Colors.indigo.shade700, fontWeight: FontWeight.bold, fontSize: 12))),
              const Spacer(),
              _difficultyBadge(question['difficulty'] ?? 'MEDIUM'),
            ],
          ),
          const SizedBox(height: 24),
          Text(question['question'] ?? 'No Question Text', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1E1B4B), height: 1.5)),
          const SizedBox(height: 40),
          ...options.asMap().entries.map((entry) => _buildOption(entry.key, entry.value)).toList(),
          AiHintWhisperer(
            questionId: question['id'] ?? 0,
            timeSpent: 0, // In a real app, track this via a timer in MockTest
            optionChanges: 0, 
          ),
        ],
      ),
    );
  }

  Widget _buildOption(int i, String text) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: OutlinedButton(
        onPressed: () => onAnswer(text), // Simplified for MCQ
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.all(20),
          alignment: Alignment.centerLeft,
          side: BorderSide(color: Colors.grey.withOpacity(0.2)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        child: Row(
          children: [
            Container(width: 32, height: 32, alignment: Alignment.center, decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(8)), child: Text(String.fromCharCode(65 + i), style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.indigo))),
            const SizedBox(width: 16),
            Expanded(child: Text(text, style: const TextStyle(fontSize: 16, color: Color(0xFF1E1B4B), fontWeight: FontWeight.w500))),
          ],
        ),
      ),
    );
  }

  Widget _difficultyBadge(String diff) {
    Color c = diff == 'EASY' ? Colors.green : (diff == 'DIFFICULT' ? Colors.red : Colors.orange);
    return Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3), decoration: BoxDecoration(color: c.withOpacity(0.1), borderRadius: BorderRadius.circular(10)), child: Text(diff, style: TextStyle(color: c, fontSize: 10, fontWeight: FontWeight.bold)));
  }
}
