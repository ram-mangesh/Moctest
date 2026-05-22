import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:examprep_app/core/api/dio_client.dart';
import 'widgets/exam_card.dart';

class ExamsPage extends ConsumerStatefulWidget {
  const ExamsPage({super.key});
  @override
  ConsumerState<ExamsPage> createState() => _ExamsPageState();
}

class _ExamsPageState extends ConsumerState<ExamsPage> {
  List<dynamic> _exams = [];
  bool _loading = true;
  String _search = "";
  String _activeTag = "All";

  final List<String> _tags = ["All", "SSC", "UPSC", "Banking", "Railways"];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ref.read(dioClientProvider).get('/user/exams');
      if (mounted) setState(() { _exams = res.data ?? []; _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _exams.where((e) => e['name'].toString().toLowerCase().contains(_search.toLowerCase())).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _header(),
            const SizedBox(height: 24),
            _searchAndTags(),
            const SizedBox(height: 24),
            _statsRow(),
            const SizedBox(height: 32),
            _loading ? _buildSkeleton() : (filtered.isEmpty ? _buildEmpty() : _buildGrid(filtered)),
            const SizedBox(height: 40),
            _ctaBanner(),
          ],
        ),
      ),
    );
  }

  Widget _header() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4), decoration: BoxDecoration(color: Colors.indigo.withOpacity(0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.indigo.withOpacity(0.2))), child: Row(mainAxisSize: MainAxisSize.min, children: [Container(width: 5, height: 5, decoration: const BoxDecoration(color: Colors.indigo, shape: BoxShape.circle)), const SizedBox(width: 6), const Text('BROWSE', style: TextStyle(color: Colors.indigo, fontWeight: FontWeight.bold, fontSize: 10, letterSpacing: 1))])),
        const SizedBox(height: 10),
        Text('All Exams', style: GoogleFonts.plusJakartaSans(fontSize: 32, fontWeight: FontWeight.w900, color: const Color(0xFF1E1B4B))),
        Text('${_exams.length} exams available · Click any to start practicing', style: const TextStyle(color: Colors.grey, fontSize: 13)),
      ],
    );
  }

  Widget _searchAndTags() {
    return Row(
      children: [
        Expanded(child: Container(padding: const EdgeInsets.symmetric(horizontal: 16), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.indigo.withOpacity(0.1)), boxShadow: [BoxShadow(color: Colors.indigo.withOpacity(0.05), blurRadius: 10)]), child: Row(children: [const Icon(Icons.search, size: 20, color: Colors.grey), const SizedBox(width: 10), Expanded(child: TextField(onChanged: (v) => setState(() => _search = v), decoration: const InputDecoration(hintText: 'Search exams...', border: InputBorder.none, hintStyle: TextStyle(color: Colors.grey, fontSize: 14))))]))),
        const SizedBox(width: 12),
        ElevatedButton.icon(onPressed: () {}, icon: const Icon(Icons.emoji_events, size: 18), label: const Text('🏆 REAL EXAMS'), style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: Colors.indigo, side: const BorderSide(color: Color(0xFFE2E8F0)), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)))),
      ],
    );
  }

  Widget _statsRow() {
    return SingleChildScrollView(scrollDirection: Axis.horizontal, child: Row(children: [
      _statCard('Total Exams', '${_exams.length}', Colors.indigo, Icons.assignment),
      _statCard('Tests Taken', '42', Colors.green, Icons.check_circle),
      _statCard('Avg Score', '78%', Colors.orange, Icons.trending_up),
      _statCard('Streak', '7d', Colors.red, Icons.fireplace),
    ]));
  }

  Widget _statCard(String label, String val, Color c, IconData icon) => Container(width: 140, margin: const EdgeInsets.only(right: 12), padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.indigo.withOpacity(0.1)), boxShadow: [BoxShadow(color: Colors.indigo.withOpacity(0.05), blurRadius: 8)]), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: c.withOpacity(0.1), borderRadius: BorderRadius.circular(8)), child: Icon(icon, color: c, size: 16)), const SizedBox(height: 12), Text(val, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: c)), Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold))]));

  Widget _buildGrid(List filtered) => GridView.builder(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), itemCount: filtered.length, gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 3, crossAxisSpacing: 16, mainAxisSpacing: 16, childAspectRatio: 1.1), itemBuilder: (c, i) => ExamCard(exam: filtered[i]));

  Widget _buildSkeleton() => const Center(child: CircularProgressIndicator());
  Widget _buildEmpty() => Container(width: double.infinity, padding: const EdgeInsets.all(40), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.indigo.withOpacity(0.1), style: BorderStyle.none)), child: const Column(children: [Icon(Icons.search_off, size: 60, color: Colors.grey), SizedBox(height: 16), Text('No exams found', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)), Text('Try a different search term')]));

  Widget _ctaBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)]), borderRadius: BorderRadius.circular(24), boxShadow: [BoxShadow(color: Colors.indigo.withOpacity(0.3), blurRadius: 20)]),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [Text('Ready to challenge yourself? 🚀', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)), Text('Try a real exam or challenge a friend', style: TextStyle(color: Colors.white70, fontSize: 13))]),
          Row(children: [
            ElevatedButton(onPressed: () {}, style: ElevatedButton.styleFrom(backgroundColor: Colors.white.withOpacity(0.2), foregroundColor: Colors.white, elevation: 0, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: Colors.white30))), child: const Text('🏆 REAL EXAMS')),
            const SizedBox(width: 12),
            ElevatedButton(onPressed: () {}, style: ElevatedButton.styleFrom(backgroundColor: Colors.white.withOpacity(0.2), foregroundColor: Colors.white, elevation: 0, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: Colors.white30))), child: const Text('👥 CHALLENGE')),
          ]),
        ],
      ),
    );
  }
}
