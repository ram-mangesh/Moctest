import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:examprep_app/core/api/dio_client.dart';
import 'package:examprep_app/core/theme/app_theme.dart';
import 'package:intl/intl.dart';

class SmartStudyPlanner extends ConsumerStatefulWidget {
  const SmartStudyPlanner({super.key});
  @override
  ConsumerState<SmartStudyPlanner> createState() => _SmartStudyPlannerState();
}

class _SmartStudyPlannerState extends ConsumerState<SmartStudyPlanner> {
  final TextEditingController _examNameController = TextEditingController();
  DateTime? _selectedDate;
  Map<String, dynamic>? _plan;
  bool _loading = false;
  Map<String, bool> _checked = {};

  final Map<String, dynamic> _dayTypes = {
    'study': {'color': Colors.indigo, 'icon': Icons.book, 'label': 'Study'},
    'practice': {'color': Colors.purple, 'icon': Icons.edit, 'label': 'Practice'},
    'revision': {'color': Colors.green, 'icon': Icons.refresh, 'label': 'Revision'},
    'rest': {'color': Colors.grey, 'icon': Icons.bed, 'label': 'Rest'},
    'exam': {'color': Colors.red, 'icon': Icons.my_location, 'label': 'Exam'},
  };

  @override
  void initState() {
    super.initState();
    _loadAll();
  }

  Future<void> _loadAll() async {
    final prefs = await SharedPreferences.getInstance();
    final cData = prefs.getString('study_plan_checked');
    final pData = prefs.getString('study_plan_last');
    final eName = prefs.getString('study_plan_exam');
    final eDate = prefs.getString('study_plan_date');

    if (mounted) {
      setState(() {
        if (cData != null) _checked = Map<String, bool>.from(jsonDecode(cData));
        if (pData != null) _plan = jsonDecode(pData);
        if (eName != null) _examNameController.text = eName;
        if (eDate != null) _selectedDate = DateTime.tryParse(eDate);
      });
    }
  }

  Future<void> _saveChecked() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('study_plan_checked', jsonEncode(_checked));
  }

  Future<void> _generate() async {
    if (_selectedDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select an exam date')));
      return;
    }
    setState(() => _loading = true);
    try {
      final daysUntil = _selectedDate!.difference(DateTime.now()).inDays + 1;
      
      // Get history context
      String histCtx = "";
      try {
        final res = await ref.read(dioClientProvider).get('/user/test/attempts');
        final hist = res.data as List;
        if (hist.isNotEmpty) {
          final weak = hist.where((a) => (a['scorePercent'] ?? 0) < 60).take(5).map((a) => a['topicName'] ?? '').toList();
          histCtx = "\nWeak topics: ${weak.join(', ')}";
        }
      } catch (_) {}

      final prompt = """Create a personalised study plan for ${_examNameController.text}.
Days until exam: $daysUntil days. Exam on: ${_selectedDate!.toIso8601String()}$histCtx

Return ONLY valid JSON:
{"summary":"One sentence strategy", "totalHours": 30, "days": [{"date":"YYYY-MM-DD", "dayLabel":"Day 1 - Mon", "type":"study|practice|revision|rest|exam", "title":"Day Goal", "tasks":["Task 1", "Task 2"], "tip":"One tip"}]}""";
      
      final res = await ref.read(dioClientProvider).post('/user/ai/chat', data: prompt);
      final raw = res.data.toString();
      final jsonMatch = RegExp(r'\{[\s\S]*\}').firstMatch(raw);
      
      if (jsonMatch != null) {
        final parsed = jsonDecode(jsonMatch.group(0)!);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('study_plan_last', jsonEncode(parsed));
        await prefs.setString('study_plan_exam', _examNameController.text);
        await prefs.setString('study_plan_date', _selectedDate!.toIso8601String());
        
        setState(() { 
          _plan = parsed; 
          _checked = {}; 
          _loading = false; 
        });
        _saveChecked();
      } else {
        throw Exception("Invalid AI response");
      }
    } catch (e) {
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Generation failed: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    int totalTasks = 0;
    int doneTasks = 0;
    if (_plan != null) {
      final days = _plan!['days'] as List;
      for (int i=0; i<days.length; i++) {
        final tasks = days[i]['tasks'] as List? ?? [];
        totalTasks += tasks.length;
        for (int j=0; j<tasks.length; j++) {
           if (_checked['$i-$j'] == true) doneTasks++;
        }
      }
    }
    double overallProgress = totalTasks == 0 ? 0 : doneTasks / totalTasks;

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      body: Stack(
        children: [
          _buildBackground(),
          CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(24, 60, 24, 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _eyebrow('AI Powered'),
                      const SizedBox(height: 8),
                      Text('Smart Study', style: GoogleFonts.plusJakartaSans(fontSize: 32, fontWeight: FontWeight.w900, color: const Color(0xFF1E1B4B))),
                      Text('Planner', style: GoogleFonts.plusJakartaSans(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.indigoAccent)),
                      const Text('Personalised schedule based on your weak topics', style: TextStyle(color: Colors.grey, fontSize: 14)),
                      const SizedBox(height: 32),
                      _setupCard(),
                      if (_loading) ...[
                        const SizedBox(height: 48),
                        const Center(child: Column(children: [CircularProgressIndicator(strokeWidth: 3), SizedBox(height: 16), Text('AI is building your plan...', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.indigo))])),
                      ] else if (_plan != null) ...[
                        const SizedBox(height: 32),
                        _progressCard(overallProgress, doneTasks, totalTasks),
                        const SizedBox(height: 32),
                        ...(_plan!['days'] as List).asMap().entries.map((e) => _dayCard(e.key, e.value)),
                        const SizedBox(height: 40),
                      ] else ...[
                        const SizedBox(height: 60),
                        _emptyState(),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBackground() {
    return Positioned.fill(
      child: Stack(
        children: [
          Positioned(top: -50, right: -50, child: Container(width: 300, height: 300, decoration: BoxDecoration(color: Colors.indigo.withOpacity(0.04), shape: BoxShape.circle))),
          Positioned(top: 200, left: -80, child: Container(width: 250, height: 250, decoration: BoxDecoration(color: Colors.purple.withOpacity(0.03), shape: BoxShape.circle))),
        ],
      ),
    );
  }

  Widget _eyebrow(String text) => Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4), decoration: BoxDecoration(color: Colors.indigo.withOpacity(0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.indigo.withOpacity(0.2))), child: Text(text.toUpperCase(), style: const TextStyle(color: Colors.indigo, fontWeight: FontWeight.bold, fontSize: 10, letterSpacing: 1.2)));

  Widget _setupCard() => Container(
    padding: const EdgeInsets.all(24),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: Colors.indigo.withOpacity(0.1)), boxShadow: [BoxShadow(color: Colors.indigo.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, 8))]),
    child: Column(
      children: [
        TextField(controller: _examNameController, style: const TextStyle(fontWeight: FontWeight.bold), decoration: InputDecoration(labelText: 'EXAM NAME', labelStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.grey), hintText: 'e.g. UPSC, JEE Main, GATE...', border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.indigo.withOpacity(0.1))), enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.indigo.withOpacity(0.1))))),
        const SizedBox(height: 16),
        InkWell(
          onTap: () async {
            final now = DateTime.now();
            final d = await showDatePicker(context: context, initialDate: now.add(const Duration(days: 7)), firstDate: now, lastDate: now.add(const Duration(days: 730)));
            if (d != null) setState(() => _selectedDate = d);
          },
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: Colors.indigo.withOpacity(0.03), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.indigo.withOpacity(0.1))),
            child: Row(
              children: [
                const Icon(Icons.calendar_today, size: 18, color: Colors.indigo),
                const SizedBox(width: 12),
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [const Text('EXAM DATE', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Colors.grey)), Text(_selectedDate == null ? 'Select Date' : DateFormat('MMM d, yyyy').format(_selectedDate!), style: const TextStyle(fontWeight: FontWeight.bold))]),
                const Spacer(),
                const Icon(Icons.chevron_right, color: Colors.grey),
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),
        SizedBox(width: double.infinity, child: ElevatedButton(onPressed: _generate, style: ElevatedButton.styleFrom(backgroundColor: Colors.indigo, foregroundColor: Colors.white, padding: const EdgeInsets.all(18), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)), elevation: 2), child: const Text('GENERATE STUDY PLAN', style: TextStyle(fontWeight: FontWeight.w800, letterSpacing: 1)))),
      ],
    ),
  );

  Widget _progressCard(double pct, int done, int total) => Container(
    padding: const EdgeInsets.all(24),
    decoration: BoxDecoration(gradient: LinearGradient(colors: [Colors.indigo.shade600, Colors.indigoAccent]), borderRadius: BorderRadius.circular(24), boxShadow: [BoxShadow(color: Colors.indigo.withOpacity(0.3), blurRadius: 15, offset: const Offset(0, 10))]),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [const Text('Overall Progress', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)), Text('${(pct * 100).round()}%', style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900))]),
            IconButton(onPressed: _loadAll, icon: const Icon(Icons.refresh, color: Colors.white70)),
          ],
        ),
        const SizedBox(height: 20),
        ClipRRect(borderRadius: BorderRadius.circular(10), child: LinearProgressIndicator(value: pct, minHeight: 10, backgroundColor: Colors.white.withOpacity(0.2), valueColor: const AlwaysStoppedAnimation(Colors.white))),
        const SizedBox(height: 12),
        Text('$done of $total tasks completed', style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w500)),
      ],
    ),
  );

  Widget _dayCard(int dIdx, dynamic d) {
    final type = d['type']?.toString().toLowerCase() ?? 'study';
    final config = _dayTypes[type] ?? _dayTypes['study'];
    final color = config['color'] as Color;
    final List tasks = d['tasks'] as List? ?? [];
    
    int dayDone = 0;
    for (int i=0; i<tasks.length; i++) {
      if (_checked['$dIdx-$i'] == true) dayDone++;
    }
    double dayPct = tasks.isEmpty ? 0 : dayDone / tasks.length;

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: color.withOpacity(_isToday(d['date']) ? 0.3 : 0.08), width: _isToday(d['date']) ? 2 : 1), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)), child: Icon(config['icon'], color: color, size: 24)),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(children: [Text(config['label'].toUpperCase(), style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)), if (_isToday(d['date'])) Container(margin: const EdgeInsets.only(left: 8), padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(4)), child: const Text('TODAY', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold)))]),
                      const SizedBox(height: 4),
                      Text(d['dayLabel'] ?? '', style: const TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 8),
                      Text(d['title'] ?? '', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF1E1B4B))),
                    ],
                  ),
                ),
                _percentageRing(dayPct),
              ],
            ),
          ),
          ...tasks.asMap().entries.map((te) {
            final k = '$dIdx-${te.key}';
            final done = _checked[k] ?? false;
            return Container(
              decoration: BoxDecoration(border: Border(top: BorderSide(color: Colors.grey.withOpacity(0.05)))),
              child: CheckboxListTile(value: done, title: Text(te.value, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, decoration: done ? TextDecoration.lineThrough : null, color: done ? Colors.grey : Colors.black87)), activeColor: color, checkboxShape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)), controlAffinity: ListTileControlAffinity.leading, dense: true, contentPadding: const EdgeInsets.symmetric(horizontal: 12), onChanged: (v) { setState(() => _checked[k] = v!); _saveChecked(); }),
            );
          }),
          if (d['tip'] != null)
            Padding(padding: const EdgeInsets.fromLTRB(20, 10, 20, 20), child: Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: Colors.amber.shade50, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.amber.shade100)), child: Row(children: [const Text('💡', style: TextStyle(fontSize: 16)), const SizedBox(width: 10), Expanded(child: Text(d['tip'], style: TextStyle(fontSize: 12, color: Colors.amber.shade900, fontStyle: FontStyle.italic)))]))),
        ],
      ),
    );
  }

  Widget _percentageRing(double pct) {
    return SizedBox(
      width: 45, height: 45,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CircularProgressIndicator(value: pct, strokeWidth: 4, backgroundColor: Colors.grey.withOpacity(0.1)),
          Text('${(pct * 100).round()}%', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  bool _isToday(dynamic dateStr) {
    if (dateStr == null) return false;
    final d = DateTime.tryParse(dateStr.toString());
    return d != null && DateFormat('yyyy-MM-dd').format(d) == DateFormat('yyyy-MM-dd').format(DateTime.now());
  }

  Widget _emptyState() => Center(child: Column(children: [Container(padding: const EdgeInsets.all(30), decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle, boxShadow: [BoxShadow(color: Colors.indigo.withOpacity(0.05), blurRadius: 20)]), child: const Text('🗓️', style: TextStyle(fontSize: 50))), const SizedBox(height: 24), const Text('No active plan found', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1E1B4B))), const SizedBox(height: 8), const Text('Enter your exam details above and\nlet AI build your schedule.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey, height: 1.5))]));
}
