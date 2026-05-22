import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:examprep_app/core/api/dio_client.dart';
import 'package:intl/intl.dart';

class ProgressPage extends ConsumerStatefulWidget {
  const ProgressPage({super.key});

  @override
  ConsumerState<ProgressPage> createState() => _ProgressPageState();
}

class _ProgressPageState extends ConsumerState<ProgressPage> {
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
      if (mounted) setState(() { _attempts = res.data ?? []; _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());

    final total = _attempts.length;
    final avgScore = total == 0 ? 0 : (_attempts.fold(0.0, (s, a) => s + (a['scorePercent'] ?? 0)) / total).round();
    final bestScore = total == 0 ? 0 : _attempts.map((a) => (a['scorePercent'] as num?)?.round() ?? 0).reduce((a, b) => a > b ? a : b);

    // Topic wise data
    final topicMap = <String, List<int>>{};
    for (var a in _attempts) {
      final t = a['topicName']?.toString() ?? a['topic']?.toString() ?? 'Unknown';
      if (!topicMap.containsKey(t)) topicMap[t] = [0, 0];
      topicMap[t]![0] += (a['scorePercent'] as num?)?.round() ?? 0;
      topicMap[t]![1] += 1;
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), decoration: BoxDecoration(color: const Color(0xFF6366f1).withOpacity(0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFF6366f1).withOpacity(0.2))), child: const Text('ANALYTICS', style: TextStyle(color: Color(0xFF6366f1), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1))),
            const SizedBox(height: 10),
            Text('Your Progress', style: GoogleFonts.plusJakartaSans(fontSize: 28, fontWeight: FontWeight.w900, color: const Color(0xFF1E1B4B))),
            const Text('Track performance across all your quiz attempts', style: TextStyle(color: Colors.grey, fontSize: 14)),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(child: _statCard('Total Attempts', '$total', Colors.blue, Icons.timer)),
                const SizedBox(width: 12),
                Expanded(child: _statCard('Avg Score', '$avgScore%', Colors.purple, Icons.bar_chart)),
                const SizedBox(width: 12),
                Expanded(child: _statCard('Best Score', '$bestScore%', Colors.green, Icons.emoji_events)),
              ],
            ),
            const SizedBox(height: 24),
            _chartCard('📈', 'Score Over Time', _buildLineChart()),
            const SizedBox(height: 16),
            _chartCard('🍩', 'Score Distribution', _buildPieChart()),
            const SizedBox(height: 16),
            _chartCard('📚', 'Topic-wise Performance', _buildBarChart(topicMap)),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _statCard(String label, String val, Color c, IconData icon) => Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: c.withOpacity(0.2)), boxShadow: [BoxShadow(color: c.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, 4))]), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Icon(icon, color: c, size: 28), const SizedBox(height: 12), Text(val, style: GoogleFonts.plusJakartaSans(fontSize: 26, fontWeight: FontWeight.w900, color: c)), Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.bold))]));
  
  Widget _chartCard(String emoji, String title, Widget chart) => Container(padding: const EdgeInsets.all(24), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.indigo.withOpacity(0.1)), boxShadow: [BoxShadow(color: Colors.indigo.withOpacity(0.05), blurRadius: 10)]), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Row(children: [Text(emoji, style: const TextStyle(fontSize: 20)), const SizedBox(width: 12), Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E1B4B)))]), const Divider(height: 30), SizedBox(height: 250, child: chart)]));

  Widget _buildLineChart() {
    if (_attempts.isEmpty) return const Center(child: Text('Not enough data'));
    final spots = _attempts.asMap().entries.map((e) => FlSpot(e.key.toDouble(), (e.value['scorePercent'] as num?)?.toDouble() ?? 0.0)).toList();
    return LineChart(LineChartData(
      gridData: FlGridData(show: true, drawVerticalLine: false),
      titlesData: FlTitlesData(show: true, leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 40)), bottomTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)), rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)), topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false))),
      borderData: FlBorderData(show: false),
      lineBarsData: [LineChartBarData(spots: spots, isCurved: true, color: Colors.blue, barWidth: 3, dotData: FlDotData(show: true), belowBarData: BarAreaData(show: true, color: Colors.blue.withOpacity(0.1)))],
    ));
  }

  Widget _buildPieChart() {
    if (_attempts.isEmpty) return const Center(child: Text('Not enough data'));
    int excellent=0, good=0, avg=0, poor=0;
    for (var a in _attempts) {
      final s = (a['scorePercent'] as num?)?.round() ?? 0;
      if (s >= 80) excellent++; else if (s >= 60) good++; else if (s >= 40) avg++; else poor++;
    }
    return PieChart(PieChartData(sectionsSpace: 2, centerSpaceRadius: 60, sections: [
      if (excellent>0) PieChartSectionData(color: Colors.green, value: excellent.toDouble(), title: '$excellent', radius: 40, titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      if (good>0) PieChartSectionData(color: Colors.blue, value: good.toDouble(), title: '$good', radius: 40, titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      if (avg>0) PieChartSectionData(color: Colors.orange, value: avg.toDouble(), title: '$avg', radius: 40, titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      if (poor>0) PieChartSectionData(color: Colors.red, value: poor.toDouble(), title: '$poor', radius: 40, titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
    ]));
  }

  Widget _buildBarChart(Map<String, List<int>> topicMap) {
    if (topicMap.isEmpty) return const Center(child: Text('Not enough data'));
    final groups = topicMap.entries.toList().asMap().entries.map((e) {
      final tItem = e.value;
      return BarChartGroupData(x: e.key, barRods: [BarChartRodData(toY: (tItem.value[0] / tItem.value[1]), color: Colors.purple, width: 20, borderRadius: BorderRadius.circular(4))]);
    }).toList();
    return BarChart(BarChartData(
      gridData: FlGridData(show: false),
      borderData: FlBorderData(show: false),
      titlesData: FlTitlesData(show: true, leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 40)), bottomTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)), rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)), topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false))),
      barGroups: groups,
    ));
  }
}
