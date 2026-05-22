import 'package:flutter/material.dart';
import '../../../../core/api/dio_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class QuestionForm extends ConsumerStatefulWidget {
  final int topicId;
  final Map<String, dynamic>? editQuestion;
  final VoidCallback onCancel;
  final VoidCallback onSave;

  const QuestionForm({super.key, required this.topicId, this.editQuestion, required this.onCancel, required this.onSave});

  @override
  ConsumerState<QuestionForm> createState() => _QuestionFormState();
}

class _QuestionFormState extends ConsumerState<QuestionForm> {
  final _quesCtrl = TextEditingController();
  String _type = 'MCQ'; // MCQ, MULTI, NAQ
  String _diff = 'EASY'; // EASY, MEDIUM, DIFFICULT
  List<TextEditingController> _optCtrls = List.generate(4, (_) => TextEditingController());
  int _correct = 0;
  List<int> _correctMulti = [];
  final _numCtrl = TextEditingController();
  final _toleranceCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    if (widget.editQuestion != null) _initForm(widget.editQuestion!);
  }

  @override
  void didUpdateWidget(QuestionForm old) {
    super.didUpdateWidget(old);
    if (widget.editQuestion != old.editQuestion) {
      if (widget.editQuestion != null) _initForm(widget.editQuestion!);
      else _clearForm();
    }
  }

  void _initForm(Map<String, dynamic> q) {
    _quesCtrl.text = q['question'] ?? '';
    _type = q['type'] ?? 'MCQ';
    _diff = q['difficulty'] ?? 'EASY';
    final opts = q['options'] as List? ?? ['', '', '', ''];
    for (int i = 0; i < 4; i++) {
      _optCtrls[i].text = i < opts.length ? opts[i].toString() : '';
    }
    if (_type == 'MCQ') _correct = (q['correct'] as num?)?.toInt() ?? 0;
    if (_type == 'MULTI') _correctMulti = (q['correctMultiple'] as List?)?.map((e) => (e as num).toInt()).toList() ?? [];
    if (_type == 'NAQ') {
      _numCtrl.text = q['correctNumeric']?.toString() ?? '';
      _toleranceCtrl.text = q['tolerance']?.toString() ?? '';
    }
  }

  void _clearForm() {
    _quesCtrl.clear();
    _type = 'MCQ';
    _diff = 'EASY';
    for (var c in _optCtrls) c.clear();
    _correct = 0;
    _correctMulti = [];
    _numCtrl.clear();
    _toleranceCtrl.clear();
  }

  Future<void> _save() async {
    if (_quesCtrl.text.trim().isEmpty) return;
    final payload = {
      'question': _quesCtrl.text.trim(),
      'topicId': widget.topicId,
      'type': _type,
      'difficulty': _diff,
      'options': _type != 'NAQ' ? _optCtrls.map((e) => e.text.trim()).toList() : null,
      'correct': _type == 'MCQ' ? _correct : null,
      'correctMultiple': _type == 'MULTI' ? _correctMulti : null,
      'correctNumeric': _type == 'NAQ' ? double.tryParse(_numCtrl.text) : null,
      'tolerance': _type == 'NAQ' ? double.tryParse(_toleranceCtrl.text) : null,
    };

    try {
      if (widget.editQuestion != null) {
        await ref.read(dioClientProvider).put('/admin/questions/${widget.editQuestion!['id']}', data: payload);
      } else {
        await ref.read(dioClientProvider).post('/admin/questions', data: payload);
      }
      _clearForm();
      widget.onSave();
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFF59E0B).withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.18)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(widget.editQuestion != null ? '✏️' : '➕', style: const TextStyle(fontSize: 20)),
              const SizedBox(width: 10),
              Text(widget.editQuestion != null ? 'Edit Question' : 'Add Question', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              const Spacer(),
              if (widget.editQuestion != null)
                TextButton(onPressed: widget.onCancel, child: const Text('✕ Cancel', style: TextStyle(color: Colors.red))),
            ],
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _quesCtrl,
            maxLines: 3,
            decoration: _inputDeco('Type your question here...'),
          ),
          const SizedBox(height: 16),
          _sectionLabel('Question Type'),
          const SizedBox(height: 8),
          Row(
            children: [
              _tabBtn('MCQ', '🔘'),
              const SizedBox(width: 6),
              _tabBtn('MULTI', '☑️'),
              const SizedBox(width: 6),
              _tabBtn('NAQ', '🔢'),
            ],
          ),
          const SizedBox(height: 16),
          _sectionLabel('Difficulty'),
          const SizedBox(height: 8),
          Row(
            children: [
              _diffBtn('EASY', '🟢', const Color(0xFF10B981)),
              const SizedBox(width: 6),
              _diffBtn('MEDIUM', '🟡', const Color(0xFFF59E0B)),
              const SizedBox(width: 6),
              _diffBtn('DIFFICULT', '🔴', const Color(0xFFEF4444)),
            ],
          ),
          const SizedBox(height: 16),
          if (_type != 'NAQ') ...[
            _sectionLabel('Answer Options'),
            const SizedBox(height: 8),
            ...List.generate(4, (i) => _optionRow(i)),
          ] else ...[
            Row(
              children: [
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [_sectionLabel('Correct Answer'), const SizedBox(height: 8), TextField(controller: _numCtrl, keyboardType: TextInputType.number, decoration: _inputDeco('e.g. 42'))])),
                const SizedBox(width: 16),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [_sectionLabel('Tolerance'), const SizedBox(height: 8), TextField(controller: _toleranceCtrl, keyboardType: TextInputType.number, decoration: _inputDeco('e.g. 0.5'))])),
              ],
            ),
          ],
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _save,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFF59E0B),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text(widget.editQuestion != null ? '✏️ UPDATE QUESTION' : '✅ SAVE QUESTION', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 1)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionLabel(String l) => Text(l, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1));

  InputDecoration _inputDeco(String h) => InputDecoration(
    hintText: h,
    filled: true,
    fillColor: Colors.white,
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(11), borderSide: BorderSide(color: const Color(0xFFF59E0B).withOpacity(0.22))),
    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(11), borderSide: const BorderSide(color: Color(0xFFF59E0B))),
    contentPadding: const EdgeInsets.all(12),
  );

  Widget _tabBtn(String t, String icon) {
    bool active = _type == t;
    return GestureDetector(
      onTap: () => setState(() => _type = t),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: active ? const Color(0xFF6366F1).withOpacity(0.2) : Colors.white,
          borderRadius: BorderRadius.circular(9),
          border: Border.all(color: active ? const Color(0xFF6366F1).withOpacity(0.4) : Colors.grey.shade300, width: 1.5),
        ),
        child: Row(children: [Text(icon), const SizedBox(width: 4), Text(t, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: active ? const Color(0xFF6366F1) : Colors.grey))]),
      ),
    );
  }

  Widget _diffBtn(String d, String icon, Color c) {
    bool active = _diff == d;
    return GestureDetector(
      onTap: () => setState(() => _diff = d),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: active ? c.withOpacity(0.15) : Colors.white,
          borderRadius: BorderRadius.circular(9),
          border: Border.all(color: active ? c.withOpacity(0.4) : Colors.grey.shade300, width: 1.5),
        ),
        child: Row(children: [Text(icon), const SizedBox(width: 4), Text(d, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: active ? c : Colors.grey))]),
      ),
    );
  }

  Widget _optionRow(int i) {
    bool isCorrect = (_type == 'MCQ' && _correct == i) || (_type == 'MULTI' && _correctMulti.contains(i));
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Container(
            width: 32, height: 32,
            decoration: BoxDecoration(color: isCorrect ? const Color(0xFF10B981).withOpacity(0.2) : Colors.grey.shade100, borderRadius: BorderRadius.circular(8)),
            child: Center(child: Text(String.fromCharCode(65 + i), style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isCorrect ? const Color(0xFF10B981) : Colors.grey))),
          ),
          const SizedBox(width: 8),
          Expanded(child: TextField(controller: _optCtrls[i], decoration: _inputDeco('Option ${String.fromCharCode(65 + i)}'))),
          const SizedBox(width: 8),
          IconButton(
            onPressed: () {
              if (_type == 'MCQ') setState(() => _correct = i);
              else setState(() => _correctMulti.contains(i) ? _correctMulti.remove(i) : _correctMulti.add(i));
            },
            icon: Icon(isCorrect ? Icons.check_circle : Icons.radio_button_unchecked, color: isCorrect ? const Color(0xFF10B981) : Colors.grey.shade300),
          ),
        ],
      ),
    );
  }
}
