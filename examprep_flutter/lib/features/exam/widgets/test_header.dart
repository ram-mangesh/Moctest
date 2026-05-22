import 'package:flutter/material.dart';

class TestHeader extends StatelessWidget {
  final int secondsRemaining;
  final int totalSeconds;
  final int violations;

  const TestHeader({
    super.key,
    required this.secondsRemaining,
    required this.totalSeconds,
    required this.violations,
  });

  String _formatTime(int seconds) {
    final h = seconds ~/ 3600;
    final m = (seconds % 3600) ~/ 60;
    final s = seconds % 60;
    return '${h > 0 ? '${h.toString().padLeft(2, '0')}:' : ''}${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    double progress = totalSeconds > 0 ? (totalSeconds - secondsRemaining) / totalSeconds : 0;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
        boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 4)],
      ),
      child: Row(
        children: [
          const Text('ExamPrep', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20, color: Color(0xFF1E1B4B))),
          const Spacer(),
          Column(
            children: [
              Text(_formatTime(secondsRemaining), style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 24, color: Color(0xFF1E1B4B))),
              const Text('REMAINING', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
            ],
          ),
          const SizedBox(width: 40),
          Expanded(
            flex: 2,
            child: LinearProgressIndicator(
              value: progress,
              backgroundColor: Colors.grey.shade100,
              color: const Color(0xFF6366F1),
              minHeight: 8,
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(color: violations > 0 ? Colors.red.withOpacity(0.1) : Colors.green.withOpacity(0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: violations > 0 ? Colors.red.withOpacity(0.3) : Colors.green.withOpacity(0.3))),
            child: Row(
              children: [
                Icon(Icons.security, size: 16, color: violations > 0 ? Colors.red : Colors.green),
                const SizedBox(width: 8),
                Text('VIOLATIONS: $violations / 3', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: violations > 0 ? Colors.red : Colors.green)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
