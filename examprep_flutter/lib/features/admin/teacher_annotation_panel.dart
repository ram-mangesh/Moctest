import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:examprep_app/core/api/dio_client.dart';

class TeacherAnnotationPanel extends ConsumerStatefulWidget {
  const TeacherAnnotationPanel({super.key});
  @override
  ConsumerState<TeacherAnnotationPanel> createState() => _TeacherAnnotationPanelState();
}

class _TeacherAnnotationPanelState extends ConsumerState<TeacherAnnotationPanel> {
  final _searchCtrl = TextEditingController();
  List<dynamic> _students = [];
  bool _searching = false;
  Map<String, dynamic>? _selectedStudent;
  List<dynamic> _attempts = [];
  bool _loadingAttempts = false;
  Map<String, dynamic>? _activeAttempt;
  List<dynamic> _reviewData = [];
  List<dynamic> _annotations = [];
  bool _loadingReview = false;
  bool _showAll = false;
  final _noteCtrl = TextEditingController();
  String _tag = 'weakness';
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _searchCtrl.addListener(() {
      final q = _searchCtrl.text;
      if (q.length > 2) _search(q);
      else if (q.isEmpty) setState(() => _students = []);
    });
  }

  Future<void> _search(String q) async {
    setState(() => _searching = true);
    try {
      final res = await ref.read(dioClientProvider).get('/admin/students/search?name=$q');
      if (mounted) setState(() { _students = res.data ?? []; _searching = false; });
    } catch (_) { if (mounted) setState(() => _searching = false); }
  }

  Future<void> _loadAttempts(Map<String, dynamic> stu) async {
    setState(() { _selectedStudent = stu; _loadingAttempts = true; _activeAttempt = null; _reviewData = []; _annotations = []; });
    try {
      final res = await ref.read(dioClientProvider).get('/admin/students/${stu['id']}/attempts');
      if (mounted) setState(() { _attempts = res.data ?? []; _loadingAttempts = false; });
    } catch (_) { if (mounted) setState(() => _loadingAttempts = false); }
  }

  Future<void> _openReview(Map<String, dynamic> attempt) async {
    setState(() { _activeAttempt = attempt; _loadingReview = true; _showAll = false; });
    try {
      final dio = ref.read(dioClientProvider);
      final futures = [
        dio.get('/admin/students/attempts/${attempt['attemptId']}/review'),
        dio.get('/admin/annotations/${attempt['attemptId']}'),
      ];
      final res = await Future.wait(futures);
      if (mounted) setState(() { _reviewData = res[0].data ?? []; _annotations = res[1].data ?? []; _loadingReview = false; });
    } catch (_) { if (mounted) setState(() => _loadingReview = false); }
  }

  Future<void> _submitAnnotation() async {
    if (_noteCtrl.text.trim().isEmpty || _activeAttempt == null) return;
    setState(() => _saving = true);
    try {
      await ref.read(dioClientProvider).post('/admin/annotations', data: {
        'attemptId': _activeAttempt!['attemptId'],
        'note': _noteCtrl.text.trim(),
        'tag': _tag,
      });
      _noteCtrl.clear();
      final res = await ref.read(dioClientProvider).get('/admin/annotations/${_activeAttempt!['attemptId']}');
      if (mounted) setState(() { _annotations = res.data ?? []; _saving = false; });
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('✅ Feedback saved and student notified.')));
    } catch (_) { if (mounted) setState(() => _saving = false); }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        children: [
          _card(child: Row(children: [_iconBox('✏️'), const SizedBox(width: 14), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [Text('Faculty Annotation Panel', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Color(0xFF1E1B4B))), Text('Review student attempts and write personalized feedback', style: TextStyle(fontSize: 12.5, color: Colors.grey))]))])),
          const SizedBox(height: 18),
          
          // Step 1: Search
          _card(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            _stepBadge(1, 'Search Student'),
            TextField(controller: _searchCtrl, decoration: InputDecoration(hintText: '🔍 Type student name...', suffixIcon: _searching ? const Padding(padding: EdgeInsets.all(12), child: SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))) : null, border: OutlineInputBorder(borderRadius: BorderRadius.circular(11)))),
            if (_students.isNotEmpty && _selectedStudent == null)
              Container(margin: const EdgeInsets.only(top: 10), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(11), border: Border.all(color: Colors.blue.withOpacity(0.2))), child: Column(children: _students.map((s) => ListTile(title: Text(s['name']), subtitle: Text(s['email']), onTap: () => _loadAttempts(s))).toList())),
          ])),
          const SizedBox(height: 18),

          // Step 2: Attempts
          if (_selectedStudent != null)
            _card(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              _stepBadge(2, 'Select Attempt - ${_selectedStudent!['name']}'),
              if (_loadingAttempts) const LinearProgressIndicator()
              else if (_attempts.isEmpty) const Padding(padding: EdgeInsets.all(16), child: Text('No attempts found.'))
              else _buildAttemptTable(),
            ])),
          const SizedBox(height: 18),

          // Step 3: Review & Annotate
          if (_activeAttempt != null) ...[
            _reviewPanel(),
            const SizedBox(height: 18),
            _annotationForm(),
          ],
        ],
      ),
    );
  }

  Widget _buildAttemptTable() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: DataTable(
        columnSpacing: 24,
        columns: const [DataColumn(label: Text('Exam/Topic')), DataColumn(label: Text('Score')), DataColumn(label: Text('Date')), DataColumn(label: Text('Action'))],
        rows: _attempts.map((a) {
          bool active = _activeAttempt?['attemptId'] == a['attemptId'];
          return DataRow(cells: [
            DataCell(Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [Text(a['examName'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)), Text(a['topicName'], style: const TextStyle(fontSize: 11, color: Colors.grey))])),
            DataCell(Text('${a['scorePercent']}%', style: TextStyle(fontWeight: FontWeight.bold, color: a['scorePercent'] >= 75 ? Colors.green : (a['scorePercent'] >= 50 ? Colors.orange : Colors.red)))),
            DataCell(Text(a['attemptedAt']?.substring(0, 10) ?? '')),
            DataCell(ElevatedButton(onPressed: () => _openReview(a), style: ElevatedButton.styleFrom(backgroundColor: active ? const Color(0xFF6366F1) : Colors.blue.withOpacity(0.1), elevation: 0), child: Text(active ? 'Reviewing' : 'Review', style: TextStyle(color: active ? Colors.white : Colors.blue, fontSize: 11)))),
          ]);
        }).toList(),
      ),
    );
  }

  Widget _reviewPanel() {
    final wrong = _reviewData.where((q) => q['hasAnswerData'] && !q['correct']).toList();
    final displayList = _showAll ? _reviewData : (wrong.isEmpty ? _reviewData : wrong);

    return _card(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [const Text('Step 3 — Review Answers', style: TextStyle(fontWeight: FontWeight.bold)), Text('${_activeAttempt!['examName']} • ${_activeAttempt!['scorePercent']}%', style: const TextStyle(fontSize: 12, color: Colors.blue))]),
        TextButton(onPressed: () => setState(() => _showAll = !_showAll), child: Text(_showAll ? 'Show wrong only' : 'Show all questions')),
      ]),
      const SizedBox(height: 12),
      if (_loadingReview) const Center(child: CircularProgressIndicator())
      else ...displayList.map((q) => _QuestionReviewCard(q: q)).toList(),
    ]));
  }

  Widget _annotationForm() {
    return _card(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      _stepBadge(4, 'Write Annotation'),
      Row(children: [
        _tagBtn('tip', '💡 Tip', Colors.blue),
        const SizedBox(width: 8),
        _tagBtn('strength', '✅ Strength', Colors.green),
        const SizedBox(width: 8),
        _tagBtn('weakness', '⚠️ Weakness', Colors.orange),
      ]),
      const SizedBox(height: 14),
      TextField(controller: _noteCtrl, maxLines: 4, decoration: InputDecoration(hintText: 'Write feedback...', border: OutlineInputBorder(borderRadius: BorderRadius.circular(11)))),
      const SizedBox(height: 14),
      ElevatedButton(onPressed: _saving ? null : _submitAnnotation, style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1), minimumSize: const Size(double.infinity, 50), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))), child: Text(_saving ? 'Saving...' : 'Save & Notify Student', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white))),
      if (_annotations.isNotEmpty) ...[
        const SizedBox(height: 20),
        const Text('PREVIOUS FEEDBACK', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
        const SizedBox(height: 8),
        ..._annotations.map((a) => Container(margin: const EdgeInsets.only(bottom: 8), padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: Colors.grey.withOpacity(0.05), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey.withOpacity(0.1))), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2), decoration: BoxDecoration(color: Colors.blue.withOpacity(0.1), borderRadius: BorderRadius.circular(10)), child: Text(a['tag'] ?? 'note', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.blue))), Text(a['createdAt']?.substring(0, 10) ?? '', style: const TextStyle(fontSize: 10, color: Colors.grey))]), const SizedBox(height: 6), Text(a['note'], style: const TextStyle(fontSize: 13))]))).toList(),
      ],
    ]));
  }

  Widget _card({required Widget child}) => Container(padding: const EdgeInsets.all(22), decoration: BoxDecoration(color: Colors.white.withOpacity(0.9), borderRadius: BorderRadius.circular(18), border: Border.all(color: Colors.blue.withOpacity(0.13))), child: child);
  Widget _iconBox(String i) => Container(width: 44, height: 44, decoration: BoxDecoration(gradient: const LinearGradient(colors: [Colors.cyan, Colors.blue]), borderRadius: BorderRadius.circular(13)), child: Center(child: Text(i, style: const TextStyle(fontSize: 22))));
  Widget _stepBadge(int i, String l) => Container(margin: const EdgeInsets.only(bottom: 12), padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), decoration: BoxDecoration(color: Colors.blue.withOpacity(0.08), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.blue.withOpacity(0.15))), child: Row(mainAxisSize: MainAxisSize.min, children: [CircleAvatar(radius: 10, backgroundColor: Colors.blue, child: Text('$i', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold))), const SizedBox(width: 8), Text(l, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.indigo, letterSpacing: 0.5))]));
  Widget _tagBtn(String val, String l, Color c) {
    bool active = _tag == val;
    return GestureDetector(onTap: () => setState(() => _tag = val), child: Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8), decoration: BoxDecoration(color: active ? c.withOpacity(0.1) : Colors.white, border: Border.all(color: active ? c.withOpacity(0.3) : Colors.grey.withOpacity(0.2)), borderRadius: BorderRadius.circular(10)), child: Text(l, style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold, color: active ? c : Colors.grey))));
  }
}

class _QuestionReviewCard extends StatefulWidget {
  final Map<String, dynamic> q;
  const _QuestionReviewCard({required this.q});
  @override
  State<_QuestionReviewCard> createState() => _QuestionReviewCardState();
}

class _QuestionReviewCardState extends State<_QuestionReviewCard> {
  bool _open = false;

  @override
  Widget build(BuildContext context) {
    final q = widget.q;
    final hasData = q['hasAnswerData'] ?? false;
    final correct = q['correct'] ?? false;
    Color color = !hasData ? Colors.blue : (correct ? Colors.green : Colors.red);
    String icon = !hasData ? '📄' : (correct ? '✅' : '❌');

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(color: color.withOpacity(0.05), borderRadius: BorderRadius.circular(13), border: Border.all(color: color.withOpacity(0.15))),
      child: Column(
        children: [
          ListTile(
            dense: true,
            leading: Text(icon, style: const TextStyle(fontSize: 15)),
            title: Text('Q${q['questionNumber']} ${q['questionText']}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
            subtitle: Text('${q['type']} • ${q['difficulty']}'),
            trailing: Icon(_open ? Icons.expand_less : Icons.expand_more, size: 20),
            onTap: () => setState(() => _open = !_open),
          ),
          if (_open) ...[
            const Divider(height: 1),
            Padding(
              padding: const EdgeInsets.all(12),
              child: _buildAnswerDetails(q),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildAnswerDetails(Map<String, dynamic> q) {
    if (!(q['hasAnswerData'] ?? false)) return const Text('Student answer not available.');
    if (q['type'] == 'MCQ') {
      return Row(children: [
        Expanded(child: _ansBox('Student answered', q['studentSelected'], Colors.red)),
        const SizedBox(width: 8),
        Expanded(child: _ansBox('Correct answer', q['correctAnswer'], Colors.green)),
      ]);
    }
    if (q['type'] == 'NAQ') {
      return Row(children: [
        Expanded(child: _ansBox('Student answered', q['studentNumeric']?.toString(), Colors.red)),
        const SizedBox(width: 8),
        Expanded(child: _ansBox('Correct answer', q['correctNumeric']?.toString(), Colors.green)),
      ]);
    }
    // MULTI logic
    return const Text('Multi-choice review... (logic parity)');
  }

  Widget _ansBox(String label, String? val, Color c) => Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: c.withOpacity(0.08), borderRadius: BorderRadius.circular(8), border: Border.all(color: c.withOpacity(0.2))), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: c)), Text(val ?? 'None', style: const TextStyle(fontSize: 13))]));
}
