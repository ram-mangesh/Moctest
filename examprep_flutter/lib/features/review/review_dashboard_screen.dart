import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:examprep_app/core/api/dio_client.dart';

class ReviewDashboardScreen extends ConsumerStatefulWidget {
  const ReviewDashboardScreen({super.key});

  @override
  ConsumerState<ReviewDashboardScreen> createState() => _ReviewDashboardScreenState();
}

class _ReviewDashboardScreenState extends ConsumerState<ReviewDashboardScreen> {
  List<dynamic> _dueTopics = [];
  List<dynamic> _schedule = [];
  bool _loading = true;
  String _tab = "due"; // or "schedule"

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final dio = ref.read(dioClientProvider);
      final res = await Future.wait([
        dio.get("/user/review/due"),
        dio.get("/user/review/schedule"),
      ]);
      if (mounted) {
        setState(() {
          _dueTopics = res[0].data ?? [];
          _schedule = res[1].data ?? [];
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text('Spaced Repetition', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800)),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: Colors.black87,
      ),
      body: _loading 
        ? const Center(child: CircularProgressIndicator())
        : SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("🔁 Review Center", style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF1E1B4B))),
                const SizedBox(height: 4),
                Text("Based on Ebbinghaus forgetting curve intervals", style: TextStyle(color: Colors.grey.shade500, fontSize: 13)),
                const SizedBox(height: 24),

                _statsRow(),
                const SizedBox(height: 24),

                _tabs(),
                const SizedBox(height: 16),

                if (_tab == "due") _dueList() else _scheduleList(),

                const SizedBox(height: 32),
                _howItWorks(),
              ],
            ),
          ),
    );
  }

  Widget _statsRow() {
    return Row(
      children: [
        _statBox("${_dueTopics.length}", "Due Today", Colors.red),
        const SizedBox(width: 8),
        _statBox("${_dueTopics.where((t) => (t['daysOverdue'] ?? 0) > 0).length}", "Overdue", Colors.orange),
        const SizedBox(width: 8),
        _statBox("${_schedule.length}", "Scheduled", Colors.indigo),
      ],
    );
  }

  Widget _statBox(String val, String lbl, Color c) => Expanded(child: Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: c.withOpacity(0.05), border: Border.all(color: c.withOpacity(0.1)), borderRadius: BorderRadius.circular(16)), child: Column(children: [Text(val, style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: c)), Text(lbl.toUpperCase(), style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: c.withOpacity(0.5)))])));

  Widget _tabs() {
    return Row(
      children: [
        _tabBtn("due", "📬 Due Today (${_dueTopics.length})"),
        const SizedBox(width: 12),
        _tabBtn("schedule", "📅 Schedule (${_schedule.length})"),
      ],
    );
  }

  Widget _tabBtn(String id, String label) {
    bool active = _tab == id;
    return GestureDetector(
      onTap: () => setState(() => _tab = id),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(border: Border(bottom: BorderSide(color: active ? Colors.indigo : Colors.transparent, width: 2))),
        child: Text(label, style: TextStyle(fontWeight: active ? FontWeight.bold : FontWeight.normal, color: active ? Colors.indigo : Colors.grey)),
      ),
    );
  }

  Widget _dueList() {
    if (_dueTopics.isEmpty) return _emptyState("All caught up! 🎉", "No topics due for review today.");
    return Column(
      children: _dueTopics.map((t) {
        int overdue = t['daysOverdue'] ?? 0;
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: overdue > 0 ? Colors.red.withOpacity(0.02) : Colors.indigo.withOpacity(0.02), border: Border.all(color: overdue > 0 ? Colors.red.withOpacity(0.1) : Colors.indigo.withOpacity(0.1)), borderRadius: BorderRadius.circular(16)),
          child: Row(
            children: [
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2), decoration: BoxDecoration(color: (overdue > 0 ? Colors.red : Colors.blue).withOpacity(0.1), borderRadius: BorderRadius.circular(20)), child: Text(overdue > 0 ? "🚨 OVERDUE" : "📅 TODAY", style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: overdue > 0 ? Colors.red : Colors.blue))),
                  if (overdue > 0) Padding(padding: const EdgeInsets.only(left: 8), child: Text("$overdue days overdue", style: const TextStyle(fontSize: 10, color: Colors.grey))),
                ]),
                const SizedBox(height: 6),
                Text(t['topicName'] ?? "Unknown", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                Text("${t['subjectName']} · Last: ${t['lastScore']}%", style: const TextStyle(fontSize: 11, color: Colors.grey)),
              ])),
              ElevatedButton(onPressed: () => context.go('/topic/${t['topicId']}'), style: ElevatedButton.styleFrom(backgroundColor: Colors.indigo, foregroundColor: Colors.white, elevation: 0, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))), child: const Text("Review →"))
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _scheduleList() {
    if (_schedule.isEmpty) return _emptyState("📭 Nothing scheduled", "Complete tests to start your review queue.");
    return Column(
      children: _schedule.map((t) => Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: Colors.white, border: Border.all(color: Colors.black.withOpacity(0.04)), borderRadius: BorderRadius.circular(14)),
        child: Row(
          children: [
            Container(width: 60, padding: const EdgeInsets.symmetric(vertical: 4), decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(8)), child: Text(_fmtDate(t['reviewDate']), textAlign: TextAlign.center, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold))),
            const SizedBox(width: 14),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(t['topicName'] ?? "", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)), Text("${t['subjectName']} · ${t['lastScore']}% last", style: const TextStyle(fontSize: 10, color: Colors.grey))])),
            SizedBox(width: 60, child: LinearProgressIndicator(value: (t['lastScore'] ?? 0) / 100, backgroundColor: Colors.black.withOpacity(0.1), valueColor: AlwaysStoppedAnimation((t['lastScore'] ?? 0) >= 75 ? Colors.green : Colors.red))),
          ],
        ),
      )).toList(),
    );
  }

  Widget _emptyState(String t, String s) => Padding(padding: const EdgeInsets.symmetric(vertical: 60), child: Center(child: Column(children: [Text(t, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)), const SizedBox(height: 8), Text(s, style: const TextStyle(color: Colors.grey))])));

  Widget _howItWorks() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.grey.shade50, borderRadius: BorderRadius.circular(16)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("HOW SPACED REPETITION WORKS", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _step("Fail 1x", "1 day", Colors.red),
              _step("Fail 2x", "3 days", Colors.orange),
              _step("Fail 3x", "7 days", Colors.amber),
              _step("Mastered", "30 days", Colors.green),
            ],
          ),
          const SizedBox(height: 16),
          const Text("Topics scored below 60% are automatically scheduled for review.", textAlign: TextAlign.center, style: TextStyle(fontSize: 11, color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _step(String a, String d, Color c) => Column(children: [Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: c.withOpacity(0.1), borderRadius: BorderRadius.circular(8)), child: Text(a, style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: c))), const SizedBox(height: 4), Text("→ $d", style: const TextStyle(fontSize: 10, color: Colors.grey))]);

  String _fmtDate(String? s) {
    if (s == null) return "—";
    final d = DateTime.parse(s);
    final today = DateTime.now();
    final diff = d.difference(DateTime(today.year, today.month, today.day)).inDays;
    if (diff == 0) return "Today";
    if (diff == 1) return "Tmr";
    if (diff < 0) return "${diff.abs()}d ago";
    return DateFormat('d MMM').format(d);
  }
}
