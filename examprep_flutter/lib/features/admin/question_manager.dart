import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:examprep_app/core/api/dio_client.dart';
import 'widgets/question_form.dart';
import 'widgets/question_list.dart';

class QuestionManager extends ConsumerStatefulWidget {
  const QuestionManager({super.key});
  @override
  ConsumerState<QuestionManager> createState() => _QuestionManagerState();
}

class _QuestionManagerState extends ConsumerState<QuestionManager> {
  List<dynamic> _exams = [], _subjects = [], _topics = [], _questions = [];
  String? _examId, _subjectId, _topicId;
  Map<String, dynamic>? _editQuestion;
  bool _loadingExams = true;

  @override
  void initState() { super.initState(); _loadExams(); }

  Future<void> _loadExams() async {
    try {
      final res = await ref.read(dioClientProvider).get('/admin/exams');
      if (mounted) setState(() { _exams = res.data; _loadingExams = false; });
    } catch (_) { if (mounted) setState(() => _loadingExams = false); }
  }

  Future<void> _loadSubjects(String eid) async {
    final res = await ref.read(dioClientProvider).get('/admin/subjects?examId=$eid');
    if (mounted) setState(() { _subjects = res.data; _subjectId = null; _topics = []; _topicId = null; _questions = []; });
  }

  Future<void> _loadTopics(String sid) async {
    final res = await ref.read(dioClientProvider).get('/admin/topics?subjectId=$sid');
    if (mounted) setState(() { _topics = res.data; _topicId = null; _questions = []; });
  }

  Future<void> _loadQuestions(String tid) async {
    final res = await ref.read(dioClientProvider).get('/admin/questions?topicId=$tid');
    if (mounted) setState(() => _questions = res.data);
  }

  int get _step => _examId == null ? 1 : _subjectId == null ? 2 : _topicId == null ? 3 : 4;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Stepper
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: const Color(0xFFF59E0B).withOpacity(0.05),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.15), width: 1.5),
          ),
          child: Row(
            children: [
              _stepItem(1, 'Exam'),
              _stepLine(1),
              _stepItem(2, 'Subject'),
              _stepLine(2),
              _stepItem(3, 'Topic'),
              _stepLine(3),
              _stepItem(4, 'Questions'),
            ],
          ),
        ),
        const SizedBox(height: 16),
        // Selects
        LayoutBuilder(builder: (context, constraints) {
          bool isWide = constraints.maxWidth > 600;
          return Wrap(
            spacing: 14,
            runSpacing: 14,
            children: [
              _dropdown('📝 SELECT EXAM', _examId, _exams, (v) {
                setState(() => _examId = v);
                if (v != null) _loadSubjects(v);
              }, '— Choose Exam —', width: isWide ? (constraints.maxWidth - 28) / 3 : constraints.maxWidth),
              _dropdown('📚 SELECT SUBJECT', _subjectId, _subjects, (v) {
                setState(() => _subjectId = v);
                if (v != null) _loadTopics(v);
              }, '— Choose Subject —', enabled: _examId != null, width: isWide ? (constraints.maxWidth - 28) / 3 : constraints.maxWidth),
              _dropdown('🗂️ SELECT TOPIC', _topicId, _topics, (v) {
                setState(() => _topicId = v);
                if (v != null) _loadQuestions(v);
              }, '— Choose Topic —', enabled: _subjectId != null, width: isWide ? (constraints.maxWidth - 28) / 3 : constraints.maxWidth),
            ],
          );
        }),
        const SizedBox(height: 24),
        if (_topicId == null)
          _hint()
        else ...[
          QuestionForm(
            topicId: int.parse(_topicId!),
            editQuestion: _editQuestion,
            onCancel: () => setState(() => _editQuestion = null),
            onSave: () {
              setState(() => _editQuestion = null);
              _loadQuestions(_topicId!);
            },
          ),
          const SizedBox(height: 24),
          QuestionList(
            questions: _questions,
            onEdit: (q) => setState(() => _editQuestion = q),
            refresh: () => _loadQuestions(_topicId!),
          ),
        ],
      ],
    );
  }

  Widget _stepItem(int i, String label) {
    bool done = _step > i;
    bool active = _step == i;
    return Row(
      children: [
        Container(
          width: 26, height: 26,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: done ? const Color(0xFFF59E0B) : (active ? const Color(0xFFF59E0B).withOpacity(0.15) : Colors.white),
            border: Border.all(color: active || done ? const Color(0xFFF59E0B) : Colors.grey.shade300, width: 2),
          ),
          child: Center(child: Text(done ? '✓' : '$i', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: done ? Colors.white : (active ? const Color(0xFFF59E0B) : Colors.grey)))),
        ),
        const SizedBox(width: 7),
        Text(label, style: TextStyle(fontSize: 12, fontWeight: active ? FontWeight.bold : FontWeight.normal, color: active || done ? const Color(0xFFF59E0B) : Colors.grey)),
      ],
    );
  }

  Widget _stepLine(int i) {
    bool done = _step > i;
    return Expanded(
      child: Container(
        height: 2,
        margin: const EdgeInsets.symmetric(horizontal: 6),
        decoration: BoxDecoration(
          color: done ? const Color(0xFFF59E0B) : Colors.grey.shade200,
          borderRadius: BorderRadius.circular(2),
        ),
      ),
    );
  }

  Widget _dropdown(String label, String? val, List<dynamic> opts, ValueChanged<String?> onChange, String hint, {bool enabled = true, required double width}) {
    return SizedBox(
      width: width,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
          const SizedBox(height: 7),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(11), border: Border.all(color: enabled && val != null ? const Color(0xFFF59E0B) : const Color(0xFFF59E0B).withOpacity(0.22), width: 1.5)),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: val,
                hint: Text(hint, style: const TextStyle(fontSize: 13)),
                isExpanded: true,
                items: enabled ? opts.map((e) => DropdownMenuItem(value: e['id'].toString(), child: Text(e['name']))).toList() : [],
                onChanged: enabled ? onChange : null,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _hint() => Container(
    width: double.infinity,
    padding: const EdgeInsets.all(48),
    decoration: BoxDecoration(color: const Color(0xFFF59E0B).withOpacity(0.03), borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.25), width: 1.5, style: BorderStyle.none)), // dashed border placeholder
    child: Column(
      children: const [
        Text('👆', style: TextStyle(fontSize: 40)),
        SizedBox(height: 12),
        Text('Select an Exam → Subject → Topic above to manage questions', textAlign: TextAlign.center, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Colors.grey)),
      ],
    ),
  );
}
