import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ExamCard extends StatelessWidget {
  final Map<String, dynamic> exam;
  final bool isRealExam;

  const ExamCard({
    super.key,
    required this.exam,
    this.isRealExam = false,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => context.push(isRealExam ? '/real-exam/${exam['id']}' : '/exam/${exam['id']}'),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.indigo.withOpacity(0.1)),
          boxShadow: [BoxShadow(color: Colors.indigo.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 4))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(color: Colors.indigo.withOpacity(0.1), borderRadius: BorderRadius.circular(13)),
                  child: const Icon(Icons.book, size: 20, color: Colors.indigo),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(exam['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: Color(0xFF1E1B4B))),
                      Text(isRealExam ? 'Real Exam' : 'Start Test', style: TextStyle(color: Colors.indigo.withOpacity(0.4), fontSize: 12, fontWeight: FontWeight.w500)),
                    ],
                  ),
                )
              ],
            ),
            const Spacer(),
            Container(height: 1, color: Colors.indigo.withOpacity(0.05)),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('${exam['subjectCount'] ?? 0} subjects', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.indigo.withOpacity(0.4))),
                Icon(Icons.arrow_forward, size: 16, color: Colors.indigo.withOpacity(0.4)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
