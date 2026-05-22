import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:examprep_app/core/api/dio_client.dart';

class BehavioralAnalyticsCard extends ConsumerStatefulWidget {
  final String sessionId;
  const BehavioralAnalyticsCard({super.key, required this.sessionId});

  @override
  ConsumerState<BehavioralAnalyticsCard> createState() => _BehavioralAnalyticsCardState();
}

class _BehavioralAnalyticsCardState extends ConsumerState<BehavioralAnalyticsCard> {
  Map<String, dynamic>? _chartData;
  Map<String, dynamic>? _summary;
  bool _loading = true;
  bool _noData = false;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    try {
      final dio = ref.read(dioClientProvider);
      final res = await Future.wait([
        dio.get("/api/user/behavior/chart/${widget.sessionId}"),
        dio.get("/api/user/behavior/summary/${widget.sessionId}"),
      ]);
      
      final cd = res[0].data;
      final sd = res[1].data;
      
      if (mounted) {
        if (cd == null || sd == null || (cd['labels'] as List).isEmpty) {
          setState(() { _noData = true; _loading = false; });
        } else {
          setState(() { _chartData = cd; _summary = sd; _loading = false; });
        }
      }
    } catch (_) {
      if (mounted) setState(() { _noData = true; _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_noData) return _emptyState();

    final List<double> timeSpent = (_chartData!['timeSpent'] as List).map((e) => (e as num).toDouble()).toList();
    final List<double> optChanges = (_chartData!['optionChanges'] as List).map((e) => (e as num).toDouble()).toList();
    final labels = (_chartData!['labels'] as List).map((e) => "Q$e").toList();

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white.withOpacity(0.9), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.indigo.withOpacity(0.1)), boxShadow: [BoxShadow(color: Colors.indigo.withOpacity(0.08), blurRadius: 28)]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(width: 36, height: 36, decoration: BoxDecoration(color: Colors.indigo.withOpacity(0.1), borderRadius: BorderRadius.circular(10)), child: const Center(child: Text("📊"))),
              const SizedBox(width: 12),
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text("Behavioral Pattern Analysis", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                Text("Session #${widget.sessionId}", style: const TextStyle(fontSize: 11, color: Colors.grey)),
              ]),
            ],
          ),
          const SizedBox(height: 24),
          _statsGrid(),
          const SizedBox(height: 32),
          _chartLabel("Time spent per question", Colors.indigo),
          SizedBox(height: 180, child: _timeChart(timeSpent)),
          const SizedBox(height: 32),
          _chartLabel("Option changes per question", Colors.red),
          SizedBox(height: 150, child: _optionChart(optChanges)),
        ],
      ),
    );
  }

  Widget _statsGrid() {
    return GridView.count(
      crossAxisCount: 2, shrinkWrap: true, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 2.2,
      physics: const NeverScrollableScrollPhysics(),
      children: [
        _statItem("Tracked", "${_summary!['totalQuestions']}", Colors.indigo),
        _statItem("Avg Time", "${_summary!['avgTimePerQuestion']}s", Colors.blue),
        _statItem("Changes", "${_summary!['totalOptionChanges']}", Colors.orange),
        _statItem("Slowest", "Q${_summary!['slowestQuestion']}", Colors.red),
      ],
    );
  }

  Widget _statItem(String l, String v, Color c) => Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: c.withOpacity(0.05), borderRadius: BorderRadius.circular(14), border: Border.all(color: c.withOpacity(0.1))), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(v, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: c)), Text(l.toUpperCase(), style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: c.withOpacity(0.5)))]));

  Widget _chartLabel(String t, Color c) => Padding(padding: const EdgeInsets.only(bottom: 12), child: Row(children: [Container(width: 5, height: 5, decoration: BoxDecoration(color: c, shape: BoxShape.circle)), const SizedBox(width: 8), Text(t, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: c.withOpacity(0.75)))]));

  Widget _timeChart(List<double> data) {
    return LineChart(LineChartData(
      gridData: FlGridData(show: true, drawVerticalLine: false, getDrawingHorizontalLine: (_) => FlLine(color: Colors.indigo.withOpacity(0.05), strokeWidth: 1)),
      titlesData: FlTitlesData(show: true, rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)), topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false))),
      borderData: FlBorderData(show: false),
      lineBarsData: [LineChartBarData(
        spots: data.asMap().entries.map((e) => FlSpot(e.key.toDouble(), e.value)).toList(),
        isCurved: true, color: Colors.indigo, barWidth: 3, isStrokeCapRound: true, dotData: FlDotData(show: true, getDotPainter: (_, __, ___, ____) => FlDotCirclePainter(radius: 4, color: Colors.white, strokeWidth: 2, strokeColor: Colors.indigo)),
        belowBarData: BarAreaData(show: true, color: Colors.indigo.withOpacity(0.05)),
      )],
    ));
  }

  Widget _optionChart(List<double> data) {
    return BarChart(BarChartData(
      gridData: FlGridData(show: false),
      titlesData: FlTitlesData(show: true, rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)), topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false))),
      borderData: FlBorderData(show: false),
      barGroups: data.asMap().entries.map((e) => BarChartGroupData(x: e.key, barRods: [BarChartRodData(toY: e.value, color: e.value >= 3 ? Colors.red : Colors.indigo, width: 14, borderRadius: BorderRadius.circular(4))])).toList(),
    ));
  }

  Widget _emptyState() => Container(padding: const EdgeInsets.all(40), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: Colors.indigo.withOpacity(0.1), style: BorderStyle.none)), child: Center(child: Column(children: [const Text("📭", style: TextStyle(fontSize: 32)), const SizedBox(height: 12), const Text("No behavioral data found", style: TextStyle(fontWeight: FontWeight.bold)), Text("Session record missing or incomplete.", textAlign: TextAlign.center, style: TextStyle(color: Colors.grey.shade400, fontSize: 12))])));
}
