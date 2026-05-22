import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:examprep_app/core/api/dio_client.dart';
import 'package:intl/intl.dart';

class HistoryPage extends ConsumerStatefulWidget {
  const HistoryPage({super.key});

  @override
  ConsumerState<HistoryPage> createState() => _HistoryPageState();
}

class _HistoryPageState extends ConsumerState<HistoryPage> {
  List<dynamic> _attempts = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final res = await ref.read(dioClientProvider).get('/user/test/attempts');
      if (mounted) setState(() { 
        _attempts = res.data ?? []; 
        _loading = false; 
      });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(30),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF6366f1).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF6366f1).withOpacity(0.2)),
                    ),
                    child: const Text('HISTORY', style: TextStyle(color: Color(0xFF6366f1), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1)),
                  ),
                  const SizedBox(height: 10),
                  Text('Attempt History', style: GoogleFonts.plusJakartaSans(fontSize: 28, fontWeight: FontWeight.w900, color: const Color(0xFF1E1B4B))),
                  const Text('Review your past quizzes and see how you\'ve improved over time', style: TextStyle(color: Colors.grey, fontSize: 14)),
                  const SizedBox(height: 30),
                  if (_attempts.isEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(40),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.indigo.withOpacity(0.1))),
                      child: const Column(children: [Icon(Icons.history, size: 40, color: Colors.grey), SizedBox(height: 10), Text('No attempts found', style: TextStyle(fontWeight: FontWeight.bold))]),
                    )
                  else
                    ..._attempts.map((a) => _buildRow(a)),
                ],
              ),
            ),
    );
  }

  Widget _buildRow(dynamic attempt) {
    final dt = DateTime.tryParse(attempt['attemptedAt'] ?? '') ?? DateTime.now();
    final dStr = DateFormat('MMM d, yyyy h:mm a').format(dt.toLocal());
    final s = (attempt['scorePercent'] as num?)?.round() ?? 0;
    final c = s >= 80 ? Colors.green : (s >= 50 ? Colors.orange : Colors.red);
    final badgeInfo = s >= 80 ? ('Excellent', '🏅') : (s >= 50 ? ('Good', '👍') : ('Needs Work', '⚠️'));

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.indigo.withOpacity(0.1)),
        boxShadow: [BoxShadow(color: Colors.indigo.withOpacity(0.03), blurRadius: 4, offset: const Offset(0, 2))],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: c.withOpacity(0.1), borderRadius: BorderRadius.circular(12)), child: Text(badgeInfo.$2, style: const TextStyle(fontSize: 22))),
              const SizedBox(width: 16),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(attempt['topicName'] ?? attempt['topic'] ?? 'Unknown Topic', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF1E1B4B))),
                  const SizedBox(height: 4),
                  Text(dStr, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                  const SizedBox(height: 4),
                  Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2), decoration: BoxDecoration(color: c.withOpacity(0.1), borderRadius: BorderRadius.circular(8)), child: Text(badgeInfo.$1, style: TextStyle(color: c, fontSize: 10, fontWeight: FontWeight.bold))),
                ],
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('$s%', style: GoogleFonts.plusJakartaSans(fontSize: 22, fontWeight: FontWeight.w900, color: c)),
              ElevatedButton(
                onPressed: () {
                  context.go('/result', extra: attempt);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.indigo.withOpacity(0.1),
                  foregroundColor: Colors.indigo,
                  elevation: 0,
                  minimumSize: const Size(60, 30),
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: const Text('View', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
