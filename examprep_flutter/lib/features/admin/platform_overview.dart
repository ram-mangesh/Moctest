import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:examprep_app/core/api/dio_client.dart';
import 'package:fl_chart/fl_chart.dart';

class PlatformOverview extends ConsumerStatefulWidget {
  const PlatformOverview({super.key});
  @override
  ConsumerState<PlatformOverview> createState() => _PlatformOverviewState();
}

class _PlatformOverviewState extends ConsumerState<PlatformOverview> {
  List<dynamic> _students = [];
  List<dynamic> _allAttempts = [];
  List<dynamic> _exams = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    try {
      final api = ref.read(dioClientProvider);
      final futures = [
        api.get('/admin/students/search?name='),
        api.get('/admin/exams'),
      ];
      final res = await Future.wait(futures);
      
      final stuList = res[0].data as List;
      _students = stuList;
      _exams = res[1].data as List;

      // Load attempts
      final attemptFutures = stuList.take(50).map((s) => api.get('/admin/students/${s['id']}/attempts').then((r) => r.data as List).catchError((_) => [])).toList();
      final results = await Future.wait(attemptFutures);
      _allAttempts = results.expand((x) => x).toList();

      if (mounted) setState(() => _loading = false);
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: Padding(padding: EdgeInsets.all(50), child: Text('⏳ Loading platform data...')));

    // Derived stats
    final totalStudents = _students.length;
    final totalTests = _allAttempts.length;
    final avgScore = totalTests == 0 ? 0 : (_allAttempts.fold(0.0, (sum, a) => sum + (a['scorePercent'] ?? 0)) / totalTests).round();
    final passRate = totalTests == 0 ? 0 : (_allAttempts.where((a) => (a['scorePercent'] ?? 0) >= 60).length / totalTests * 100).round();

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(color: Colors.blue.withOpacity(0.09), border: Border.all(color: Colors.blue.withOpacity(0.18)), borderRadius: BorderRadius.circular(20)),
            child: const Text('📊 Analytics', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.blue, letterSpacing: 1)),
          ),
          const SizedBox(height: 10),
          const Text('Platform Overview', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
          const Text('Real-time platform analytics and student performance overview', style: TextStyle(fontSize: 13, color: Colors.grey)),
          const SizedBox(height: 24),

          // Stat Cards
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: MediaQuery.of(context).size.width > 900 ? 4 : 2,
            childAspectRatio: 1.5,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            children: [
              _statCard('Total Students', '$totalStudents', Icons.person, Colors.blue),
              _statCard('Total Tests', '$totalTests', Icons.assignment, Colors.purple),
              _statCard('Avg Score', '$avgScore%', Icons.analytics, avgScore >= 60 ? Colors.green : Colors.red),
              _statCard('Pass Rate', '$passRate%', Icons.check_circle, passRate >= 60 ? Colors.green : Colors.red),
            ],
          ),
          const SizedBox(height: 24),

          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Distribution
              Expanded(
                flex: 1,
                child: _panel('📉 Score Distribution', _ScoreDistributionChart(attempts: _allAttempts)),
              ),
              const SizedBox(width: 18),
              // Top Performers
              Expanded(
                flex: 1,
                child: _panel('🏆 Top Performers', _TopPerformersList(students: _students, attempts: _allAttempts)),
              ),
            ],
          ),
          const SizedBox(height: 18),
          _panel('🕐 Recent Activity', _RecentActivityList(attempts: _allAttempts, students: _students)),
        ],
      ),
    );
  }

  Widget _statCard(String label, String val, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: color.withOpacity(0.07), borderRadius: BorderRadius.circular(16), border: Border.all(color: color.withOpacity(0.2))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const Spacer(),
          Text(val, style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: color)),
          Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: color.withOpacity(0.6))),
        ],
      ),
    );
  }

  Widget _panel(String title, Widget content) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: Colors.blue.withOpacity(0.1))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
          const SizedBox(height: 14),
          content,
        ],
      ),
    );
  }
}

class _ScoreDistributionChart extends StatelessWidget {
  final List<dynamic> attempts;
  const _ScoreDistributionChart({required this.attempts});

  @override
  Widget build(BuildContext context) {
    final buckets = [
      {'label': '0-20%', 'min': 0, 'max': 20, 'color': Colors.red},
      {'label': '21-40%', 'min': 21, 'max': 40, 'color': Colors.orange},
      {'label': '41-60%', 'min': 41, 'max': 60, 'color': Colors.amber},
      {'label': '61-80%', 'min': 61, 'max': 80, 'color': Colors.lightGreen},
      {'label': '81-100%', 'min': 81, 'max': 100, 'color': Colors.green},
    ];

    double maxCount = 0;
    for (var b in buckets) {
      double c = attempts.where((a) => (a['scorePercent'] ?? 0) >= b['min'] && (a['scorePercent'] ?? 0) <= b['max']).length.toDouble();
      b['count'] = c;
      if (c > maxCount) maxCount = c;
    }
    if (maxCount == 0) maxCount = 1;

    return Column(
      children: buckets.map((b) => Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Row(
          children: [
            SizedBox(width: 55, child: Text(b['label'] as String, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: b['color'] as Color))),
            Expanded(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: LinearProgressIndicator(
                  value: (b['count'] as double) / maxCount,
                  backgroundColor: Colors.blue.withOpacity(0.06),
                  color: b['color'] as Color,
                  minHeight: 10,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Text('${(b['count'] as double).toInt()}', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: b['color'] as Color)),
          ],
        ),
      )).toList(),
    );
  }
}

class _TopPerformersList extends StatelessWidget {
  final List<dynamic> students, attempts;
  const _TopPerformersList({required this.students, required this.attempts});

  @override
  Widget build(BuildContext context) {
    // Basic ranking logic parity
    Map<int, List<double>> stuPoints = {};
    for (var a in attempts) {
      final uid = (a['userId'] ?? a['studentId']) as int?;
      if (uid == null) continue;
      stuPoints.putIfAbsent(uid, () => []).add((a['scorePercent'] ?? 0).toDouble());
    }

    final top = students.map((s) {
      final pts = stuPoints[s['id']] ?? [];
      return {
        ...s,
        'avg': pts.isEmpty ? 0 : (pts.reduce((a, b) => a + b) / pts.length).round(),
        'tests': pts.length,
      };
    })
    .where((s) => (s['tests'] as int) >= 1)
    .toList()
    ..sort((a, b) => (b['avg'] as int).compareTo(a['avg'] as int));

    if (top.isEmpty) return const Center(child: Text('No data yet', style: TextStyle(color: Colors.grey, fontSize: 13)));

    return Column(
      children: List.generate(top.take(6).length, (i) {
        final s = top[i];
        final avg = s['avg'] as int;
        return Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Row(
            children: [
              CircleAvatar(radius: 14, backgroundColor: Colors.blue, child: Text('${i+1}', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold))),
              const SizedBox(width: 10),
              Expanded(child: Text(s['name'] ?? '', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold), overflow: TextOverflow.ellipsis)),
              Text('$avg%', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: avg >= 70 ? Colors.green : (avg >= 50 ? Colors.orange : Colors.red))),
            ],
          ),
        );
      }),
    );
  }
}

class _RecentActivityList extends StatelessWidget {
  final List<dynamic> attempts, students;
  const _RecentActivityList({required this.attempts, required this.students});

  @override
  Widget build(BuildContext context) {
    final recent = List.from(attempts)..sort((a,b) => (b['attemptedAt'] ?? '').compareTo(a['attemptedAt'] ?? ''));
    if (recent.isEmpty) return const Center(child: Text('No activity yet', style: TextStyle(color: Colors.grey)));

    return Column(
      children: List.generate(recent.take(6).length, (i) {
        final a = recent[i];
        final score = ((a['scorePercent'] ?? 0) as num).round();
        final stuId = a['userId'] ?? a['studentId'];
        final stu = students.firstWhere((s) => s['id'] == stuId, orElse: () => {'name': 'Student'});
        final color = score >= 70 ? Colors.green : (score >= 50 ? Colors.orange : Colors.red);

        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Row(
            children: [
              Container(
                width: 32, height: 32,
                decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle, border: Border.all(color: color.withOpacity(0.3))),
                child: Center(child: Text('$score', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: color))),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('${stu['name']} scored $score% on ${a['topicName'] ?? 'Test'}', style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
                    Text('${a['correct']}/${a['total']} questions • ${a['attemptedAt']?.substring(0,10) ?? ""}', style: TextStyle(fontSize: 10, color: Colors.blue.withOpacity(0.5))),
                  ],
                ),
              ),
            ],
          ),
        );
      }),
    );
  }
}
