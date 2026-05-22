import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:examprep_app/core/api/dio_client.dart';

class EngagementAnalytics extends ConsumerStatefulWidget {
  const EngagementAnalytics({super.key});
  @override
  ConsumerState<EngagementAnalytics> createState() => _EngagementAnalyticsState();
}

class _EngagementAnalyticsState extends ConsumerState<EngagementAnalytics> {
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
      setState(() { _attempts = res.data ?? []; _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_attempts.isEmpty) return _empty();

    final avgScore = (_attempts.fold<double>(0, (sum, item) => sum + (item['scorePercent'] ?? 0)) / _attempts.length).round();
    
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0, title: Text('Engagement Hub', style: GoogleFonts.plusJakartaSans(color: Colors.black, fontWeight: FontWeight.bold))),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _eyebrow('📊 Analytics'),
            const SizedBox(height: 8),
            Text('Performance & Engagement', style: GoogleFonts.plusJakartaSans(fontSize: 26, fontWeight: FontWeight.w900)),
            const SizedBox(height: 24),
            _statsRow(avgScore),
            const SizedBox(height: 24),
            _scoreTimeline(),
            const SizedBox(height: 24),
            _heatMap(),
            const SizedBox(height: 24),
            _topicBreakdown(),
          ],
        ),
      ),
    );
  }

  Widget _statsRow(int avgScore) => Row(children: [
    Expanded(child: _stat('Tests', _attempts.length.toString(), Colors.indigo)),
    const SizedBox(width: 12),
    Expanded(child: _stat('Avg Score', '$avgScore%', Colors.purple)),
  ]);

  Widget _stat(String lbl, String val, Color color) => Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: color.withOpacity(0.1)), boxShadow: [BoxShadow(color: color.withOpacity(0.05), blurRadius: 10)]), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(val, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: color)), Text(lbl.toUpperCase(), style: const TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold))]));

  Widget _scoreTimeline() => Container(
    height: 240,
    padding: const EdgeInsets.all(20),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: Colors.indigo.withOpacity(0.1))),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('📈 Performance Timeline', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 24),
        Expanded(
          child: LineChart(
            LineChartData(
              gridData: const FlGridData(show: false),
              titlesData: const FlTitlesData(show: false),
              borderData: FlBorderData(show: false),
              lineBarsData: [
                LineChartBarData(
                  spots: _attempts.asMap().entries.map((e) => FlSpot(e.key.toDouble(), (e.value['scorePercent'] ?? 0).toDouble())).toList(),
                  isCurved: true,
                  color: Colors.indigo,
                  barWidth: 3,
                  dotData: const FlDotData(show: false),
                  belowBarData: BarAreaData(show: true, color: Colors.indigo.withOpacity(0.1)),
                )
              ],
            ),
          ),
        ),
      ],
    ),
  );

  Widget _heatMap() => Container(
    padding: const EdgeInsets.all(20), 
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: Colors.indigo.withOpacity(0.1))), 
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start, 
      children: [
        const Text('📅 Activity History', style: TextStyle(fontWeight: FontWeight.bold)), 
        const SizedBox(height: 16), 
        LayoutBuilder(builder: (context, constraints) {
          double size = (constraints.maxWidth - 30) / 14;
          return Wrap(
            spacing: 2, 
            runSpacing: 2, 
            children: List.generate(84, (i) => Container(
              width: size, 
              height: size, 
              decoration: BoxDecoration(
                color: Colors.indigo.withOpacity(0.05 + (i % 6 == 0 ? 0.6 : (i % 3 == 0 ? 0.3 : 0))), 
                borderRadius: BorderRadius.circular(3)
              )
            ))
          );
        })
      ]
    ),
  );

  Widget _topicBreakdown() => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [const Text('📚 Topic Accuracy', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)), const SizedBox(height: 16), ..._attempts.take(5).map((a) => _topicBar(a['topicName'] ?? 'Topic', a['scorePercent'] ?? 0)).toList()]);

  Widget _topicBar(String name, int score) => Padding(padding: const EdgeInsets.only(bottom: 12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text(name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)), Text('$score%', style: const TextStyle(fontWeight: FontWeight.bold))]), const SizedBox(height: 6), Container(height: 8, width: double.infinity, decoration: BoxDecoration(color: Colors.indigo.withOpacity(0.1), borderRadius: BorderRadius.circular(8)), child: FractionallySizedBox(alignment: Alignment.centerLeft, widthFactor: score / 100, child: Container(decoration: BoxDecoration(color: Colors.indigo, borderRadius: BorderRadius.circular(8)))))]));

  Widget _empty() => const Scaffold(body: Center(child: Text('No attempts yet.')));

  Widget _eyebrow(String text) => Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4), decoration: BoxDecoration(color: Colors.indigo.withOpacity(0.1), borderRadius: BorderRadius.circular(20)), child: Text(text.toUpperCase(), style: const TextStyle(color: Colors.indigo, fontWeight: FontWeight.bold, fontSize: 10)));
}
