import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:examprep_app/core/api/dio_client.dart';

class DifficultyAnalyzer extends ConsumerStatefulWidget {
  const DifficultyAnalyzer({super.key});
  @override
  ConsumerState<DifficultyAnalyzer> createState() => _DifficultyAnalyzerState();
}

class _DifficultyAnalyzerState extends ConsumerState<DifficultyAnalyzer> {
  List<dynamic> _exams = [], _subjects = [], _topics = [], _questions = [];
  String? _selExam, _selSubject;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _loadExams();
  }

  Future<void> _loadExams() async {
    try {
      final res = await ref.read(dioClientProvider).get('/admin/exams');
      if (mounted) setState(() => _exams = res.data ?? []);
    } catch (_) {}
  }

  Future<void> _loadSubjects(String eid) async {
    setState(() { _selExam = eid; _selSubject = null; _subjects = []; _topics = []; _questions = []; });
    final res = await ref.read(dioClientProvider).get('/admin/subjects?examId=$eid');
    if (mounted) setState(() => _subjects = res.data ?? []);
  }

  Future<void> _loadTopicsAndQuestions(String sid) async {
    setState(() { _selSubject = sid; _questions = []; _loading = true; });
    try {
      final dio = ref.read(dioClientProvider);
      final r = await dio.get('/admin/topics?subjectId=$sid');
      final topicList = r.data as List;
      _topics = topicList;

      List allQs = [];
      for (var t in topicList) {
        final qr = await dio.get('/admin/questions?topicId=${t['id']}');
        final qs = qr.data as List;
        for (var q in qs) {
          allQs.add({ ...q, 'topicName': t['name'] });
        }
      }
      if (mounted) setState(() { _questions = allQs; _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4), decoration: BoxDecoration(color: Colors.orange.withOpacity(0.09), border: Border.all(color: Colors.orange.withOpacity(0.18)), borderRadius: BorderRadius.circular(20)), child: const Text('🎯 Difficulty Analyzer', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.orange, letterSpacing: 1)))]),
          const SizedBox(height: 10),
          const Text('Question Difficulty Analyzer', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
          const Text('Analyze difficulty distribution, flag imbalanced topics, ensure quality coverage', style: TextStyle(fontSize: 13, color: Colors.grey)),
          const SizedBox(height: 22),

          _header('SELECT EXAM'),
          _buttonRow(_exams, _selExam, _loadSubjects),
          
          if (_selExam != null) ...[
            const SizedBox(height: 18),
            _header('SELECT SUBJECT'),
            _buttonRow(_subjects, _selSubject, _loadTopicsAndQuestions),
          ],

          if (_loading) const Center(child: Padding(padding: EdgeInsets.all(40), child: CircularProgressIndicator()))
          else if (_selSubject != null) ...[
             const SizedBox(height: 24),
             if (_questions.isEmpty) const Center(child: Text('No questions found.'))
             else ...[
               _overviewStats(),
               const SizedBox(height: 20),
               Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                 Expanded(child: _difficultyRatioPanel()),
                 const SizedBox(width: 16),
                 Expanded(child: _questionTypesPanel()),
               ]),
               const SizedBox(height: 18),
               _qualityFlags(),
               const SizedBox(height: 18),
               _topicBreakdownPanel(),
             ],
          ],
        ],
      ),
    );
  }

  Widget _header(String t) => Padding(padding: const EdgeInsets.only(bottom: 8), child: Text(t, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)));

  Widget _buttonRow(List items, String? activeId, Function(String) onTap) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(children: items.map((i) {
        bool active = activeId == i['id'].toString();
        return Padding(
          padding: const EdgeInsets.only(right: 8),
          child: ChoiceChip(
            label: Text(i['name']),
            selected: active,
            onSelected: (_) => onTap(i['id'].toString()),
            selectedColor: Colors.blue.withOpacity(0.1),
          ),
        );
      }).toList()),
    );
  }

  Widget _overviewStats() {
    final counts = {'EASY': 0, 'MEDIUM': 0, 'DIFFICULT': 0};
    for (var q in _questions) counts[q['difficulty']] = (counts[q['difficulty']] ?? 0) + 1;

    return Row(
      children: [
        Expanded(child: _statCard('Total', '${_questions.length}', Colors.blue)),
        const SizedBox(width: 10),
        Expanded(child: _statCard('Easy', '${counts['EASY']}', Colors.green)),
        const SizedBox(width: 10),
        Expanded(child: _statCard('Medium', '${counts['MEDIUM']}', Colors.orange)),
        const SizedBox(width: 10),
        Expanded(child: _statCard('Hard', '${counts['DIFFICULT']}', Colors.red)),
      ],
    );
  }

  Widget _statCard(String l, String v, Color c) => Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: c.withOpacity(0.06), borderRadius: BorderRadius.circular(14), border: Border.all(color: c.withOpacity(0.2))), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(v, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: c)), Text(l, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: c.withOpacity(0.6)))]));

  Widget _difficultyRatioPanel() {
    int total = _questions.length;
    double easy = _questions.where((q) => q['difficulty'] == 'EASY').length / total;
    double med = _questions.where((q) => q['difficulty'] == 'MEDIUM').length / total;
    double hard = _questions.where((q) => q['difficulty'] == 'DIFFICULT').length / total;

    return _panel(title: '📊 Difficulty Ratio', child: Column(children: [
      Container(height: 24, decoration: BoxDecoration(borderRadius: BorderRadius.circular(12)), clipBehavior: Clip.antiAlias, child: Row(children: [
        if (easy > 0) Expanded(flex: (easy*100).round(), child: Container(color: Colors.green, child: const Center(child: Text('E', style: TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold))))),
        if (med > 0) Expanded(flex: (med*100).round(), child: Container(color: Colors.orange, child: const Center(child: Text('M', style: TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold))))),
        if (hard > 0) Expanded(flex: (hard*100).round(), child: Container(color: Colors.red, child: const Center(child: Text('H', style: TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold))))),
      ])),
      const SizedBox(height: 12),
      const Text('Ideal: 30% Easy, 50% Medium, 20% Hard', style: TextStyle(fontSize: 10, color: Colors.grey, fontStyle: FontStyle.italic)),
    ]));
  }

  Widget _questionTypesPanel() {
    Map<String, int> types = {};
    for (var q in _questions) types[q['type']] = (types[q['type']] ?? 0) + 1;
    return _panel(title: '🧩 Question Types', child: Column(children: types.entries.map((e) => Row(children: [Text(e.key, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)), const SizedBox(width: 8), Expanded(child: LinearProgressIndicator(value: e.value / _questions.length, backgroundColor: Colors.grey.shade100, color: Colors.blue)), const SizedBox(width: 8), Text('${e.value}', style: const TextStyle(fontSize: 11))])).toList()));
  }

  Widget _qualityFlags() {
    // Parity logic for flags
    return const SizedBox(); // Placeholder for parity logic
  }

  Widget _topicBreakdownPanel() {
    return _panel(title: '📋 Topic-wise Breakdown', child: const Text('Breakdown logic...'));
  }

  Widget _panel({String? title, required Widget child}) => Container(width: double.infinity, padding: const EdgeInsets.all(22), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: Colors.blue.withOpacity(0.1))), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [if (title != null) ...[Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)), const SizedBox(height: 14)], child]));
}
