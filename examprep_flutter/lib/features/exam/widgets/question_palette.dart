import 'package:flutter/material.dart';

class QuestionPalette extends StatelessWidget {
  final int count;
  final int current;
  final List<dynamic> answers;
  final List<int> review;

  const QuestionPalette({
    super.key,
    required this.count,
    required this.current,
    required this.answers,
    required this.review,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 280,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.indigo.withOpacity(0.1))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Question Palette', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 20),
          Expanded(
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 5, crossAxisSpacing: 8, mainAxisSpacing: 8),
              itemCount: count,
              itemBuilder: (context, i) {
                bool isCurrent = i == current;
                bool isAnswered = answers.contains(i); // Simplified map check
                bool isReview = review.contains(i);

                Color bg = Colors.grey.shade100;
                Color text = Colors.grey.shade700;
                Border? border;

                if (isCurrent) {
                  bg = Colors.white;
                  border = Border.all(color: const Color(0xFF6366F1), width: 2);
                  text = const Color(0xFF6366F1);
                } else if (isReview) {
                  bg = Colors.purple.shade500;
                  text = Colors.white;
                } else if (isAnswered) {
                  bg = Colors.green.shade500;
                  text = Colors.white;
                }

                return Container(
                  decoration: BoxDecoration(color: bg, border: border, borderRadius: BorderRadius.circular(8)),
                  child: Center(child: Text('${i + 1}', style: TextStyle(fontWeight: FontWeight.bold, color: text))),
                );
              },
            ),
          ),
          const SizedBox(height: 20),
          const _Legend(),
        ],
      ),
    );
  }
}

class _Legend extends StatelessWidget {
  const _Legend();
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _legendItem('Current', Colors.white, border: Border.all(color: Colors.indigo)),
        _legendItem('Answered', Colors.green),
        _legendItem('Review', Colors.purple),
        _legendItem('Not Visited', Colors.grey.shade100, text: Colors.grey),
      ],
    );
  }

  Widget _legendItem(String l, Color c, {Border? border, Color text = Colors.black}) => Padding(padding: const EdgeInsets.only(bottom: 6), child: Row(children: [Container(width: 16, height: 16, decoration: BoxDecoration(color: c, border: border, borderRadius: BorderRadius.circular(4))), const SizedBox(width: 8), Text(l, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold))]));
}
