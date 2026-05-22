import 'package:flutter/material.dart';

class FooterControls extends StatelessWidget {
  final VoidCallback onSubmit;
  final VoidCallback? onNext;
  final VoidCallback? onPrev;
  final VoidCallback onReview;
  final bool isReviewed;

  const FooterControls({
    super.key,
    required this.onSubmit,
    this.onNext,
    this.onPrev,
    required this.onReview,
    required this.isReviewed,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: const BoxDecoration(color: Colors.white, border: Border(top: BorderSide(color: Color(0xFFE2E8F0)))),
      child: Row(
        children: [
          OutlinedButton.icon(onPressed: onReview, icon: Icon(isReviewed ? Icons.bookmark : Icons.bookmark_border, size: 18), label: Text(isReviewed ? 'MARKED' : 'MARK FOR REVIEW'), style: OutlinedButton.styleFrom(foregroundColor: isReviewed ? Colors.purple : Colors.grey, side: BorderSide(color: isReviewed ? Colors.purple : Colors.grey.shade300))),
          const Spacer(),
          ElevatedButton(onPressed: onPrev, style: ElevatedButton.styleFrom(backgroundColor: Colors.grey.shade100, foregroundColor: Colors.black, elevation: 0), child: const Text('PREVIOUS')),
          const SizedBox(width: 12),
          ElevatedButton(onPressed: onNext, style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1), foregroundColor: Colors.white), child: const Text('SAVE & NEXT')),
          const SizedBox(width: 40),
          ElevatedButton(onPressed: onSubmit, style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12)), child: const Text('FINISH TEST', style: TextStyle(fontWeight: FontWeight.bold))),
        ],
      ),
    );
  }
}
