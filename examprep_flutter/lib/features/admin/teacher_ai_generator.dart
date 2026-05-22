import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';
import 'package:dio/dio.dart';
import 'package:examprep_app/core/api/dio_client.dart';

class TeacherAiGenerator extends ConsumerStatefulWidget {
  const TeacherAiGenerator({super.key});
  @override
  ConsumerState<TeacherAiGenerator> createState() => _TeacherAiGeneratorState();
}

class _TeacherAiGeneratorState extends ConsumerState<TeacherAiGenerator> {
  PlatformFile? _file;
  List<dynamic> _exams = [], _subjects = [], _topics = [], _drafts = [];
  String? _examId, _subjectId, _topicId;
  int _count = 5;
  String _type = 'MCQ', _diff = 'EASY';
  final _promptCtrl = TextEditingController();
  int _step = 1;
  bool _loading = false;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final res = await ref.read(dioClientProvider).get('/admin/exams');
    if (mounted) setState(() => _exams = res.data);
  }

  Future<void> _loadSubjects(String eid) async {
    final res = await ref.read(dioClientProvider).get('/admin/subjects?examId=$eid');
    if (mounted) setState(() { _subjects = res.data; _subjectId = null; _topics = []; _topicId = null; });
  }

  Future<void> _loadTopics(String sid) async {
    final res = await ref.read(dioClientProvider).get('/admin/topics?subjectId=$sid');
    if (mounted) setState(() { _topics = res.data; _topicId = null; });
  }

  Future<void> _generate() async {
    if (_file == null || _topicId == null) return;
    setState(() => _loading = true);
    try {
      final dio = ref.read(dioClientProvider);
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(_file!.path!, filename: _file!.name),
        'topicId': int.parse(_topicId!),
        'prompt': _promptCtrl.text,
        'questionCount': _count,
        'type': _type,
        'difficulty': _diff,
      });

      await dio.post('/assign/generate', data: formData);
      final draftsRes = await dio.get('/review/drafts/topic/$_topicId');
      if (mounted) {
        setState(() {
          _drafts = draftsRes.data ?? [];
          _step = 3;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('AI Generation failed')));
      }
    }
  }

  Future<void> _approveAll() async {
    try {
      await ref.read(dioClientProvider).post('/approve?topicId=$_topicId');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('✅ Approved and moved to live')));
        setState(() { _drafts = []; _step = 1; _file = null; _topicId = null; });
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Hero bar
        _glassPanel(
          child: Row(
            children: [
              _aiIcon(),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text('AI Question Generator', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF1E1B4B))),
                    Text('Upload a study document and let AI craft exam-ready questions', style: TextStyle(fontSize: 12.5, color: Colors.grey)),
                  ],
                ),
              ),
              _aiPoweredBadge(),
            ],
          ),
        ),
        const SizedBox(height: 20),
        // Steps
        Row(
          children: [
            _stepCircle(1, 'Scope'),
            _stepLine(1),
            _stepCircle(2, 'Configure'),
            _stepLine(2),
            _stepCircle(3, 'Drafts'),
          ],
        ),
        const SizedBox(height: 24),

        if (_step == 1) _buildStep1(),
        if (_step == 2) _buildStep2(),
        if (_step == 3) _buildStep3(),
      ],
    );
  }

  Widget _buildStep1() {
    return Column(
      children: [
        _glassPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _stepHeader('📄 STEP 1 — UPLOAD MATERIAL'),
              const SizedBox(height: 14),
              _fileDropArea(),
            ],
          ),
        ),
        const SizedBox(height: 18),
        _glassPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _stepHeader('🎯 STEP 2 — SELECT SCOPE'),
              const SizedBox(height: 14),
              _dropdown('EXAM', _examId, _exams, (v) { setState(() => _examId = v); _loadSubjects(v!); }, '— Choose Exam —'),
              const SizedBox(height: 12),
              _dropdown('SUBJECT', _subjectId, _subjects, (v) { setState(() => _subjectId = v); _loadTopics(v!); }, '— Choose Subject —', enabled: _examId != null),
              const SizedBox(height: 12),
              _dropdown('TOPIC', _topicId, _topics, (v) => setState(() => _topicId = v), '— Choose Topic —', enabled: _subjectId != null),
            ],
          ),
        ),
        const SizedBox(height: 24),
        Align(
          alignment: Alignment.centerLeft,
          child: ElevatedButton(
            onPressed: (_file != null && _topicId != null) ? () => setState(() => _step = 2) : null,
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1), padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
            child: const Text('Next — Configure →', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
          ),
        ),
      ],
    );
  }

  Widget _buildStep2() {
    return Column(
      children: [
        _glassPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _stepHeader('⚙️ STEP 3 — CONFIGURE GENERATION'),
              const SizedBox(height: 18),
              Row(
                children: [
                  Expanded(child: _counter()),
                  const SizedBox(width: 20),
                  Expanded(child: _typeSelector()),
                ],
              ),
              const SizedBox(height: 18),
              _diffSelector(),
              const SizedBox(height: 18),
              _sectionLabel('💬 CUSTOM INSTRUCTIONS (OPTIONAL)'),
              const SizedBox(height: 8),
              TextField(controller: _promptCtrl, maxLines: 3, decoration: InputDecoration(hintText: 'e.g. Focus on formulas...', border: OutlineInputBorder(borderRadius: BorderRadius.circular(11)))),
            ],
          ),
        ),
        const SizedBox(height: 18),
        _glassPanel(
          child: Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              const Text('Ready to generate:', style: TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.bold)),
              _summaryItem('File', _file?.name ?? ''),
              _summaryItem('Questions', '$_count'),
              _summaryItem('Type', _type),
              _summaryItem('Diff', _diff),
            ],
          ),
        ),
        const SizedBox(height: 24),
        Row(
          children: [
            OutlinedButton(onPressed: () => setState(() => _step = 1), style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))), child: const Text('← Back')),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton(
                onPressed: _loading ? null : _generate,
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981), padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                child: _loading ? const CircularProgressIndicator(color: Colors.white) : const Text('✨ GENERATE QUESTIONS WITH AI', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 1)),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStep3() {
    return Column(
      children: [
        _glassPanel(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('📋 Generated Questions', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const Text('Review, edit or remove — then approve', style: TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              ),
              Row(
                children: [
                  Container(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4), decoration: BoxDecoration(color: Colors.green.withOpacity(0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.green.withOpacity(0.25))), child: Text('${_drafts.length} questions', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.green))),
                  const SizedBox(width: 10),
                  TextButton(onPressed: () => setState(() => _step = 2), child: const Text('← Regenerate')),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        ..._draftList(),
        const SizedBox(height: 18),
        _glassPanel(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [const Text('Ready to publish?', style: TextStyle(fontWeight: FontWeight.bold)), Text('All ${_drafts.length} will move to live question bank', style: const TextStyle(fontSize: 12, color: Colors.grey))]),
              ElevatedButton(onPressed: _approveAll, style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF059669), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(13))), child: const Text('✅ Approve All & Publish', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
            ],
          ),
        ),
      ],
    );
  }

  List<Widget> _draftList() => List.generate(_drafts.length, (i) {
    final q = _drafts[i];
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.blue.withOpacity(0.12))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              _badge(q['type'] ?? '', Colors.blue),
              const SizedBox(width: 6),
              _badge(q['difficulty'] ?? '', Colors.orange),
              const Spacer(),
              const Icon(Icons.edit, size: 16, color: Colors.blue),
              const SizedBox(width: 10),
              const Icon(Icons.delete_outline, size: 16, color: Colors.red),
            ],
          ),
          const SizedBox(height: 10),
          Text(q['question'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 10),
          if (q['options'] != null)
             GridView.count(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), crossAxisCount: 2, childAspectRatio: 4, children: List.generate((q['options'] as List).length, (oi) => Text('${String.fromCharCode(65+oi)}) ${q['options'][oi]}', style: const TextStyle(fontSize: 12)))),
        ],
      ),
    );
  });

  Widget _glassPanel({required Widget child}) => Container(padding: const EdgeInsets.all(22), decoration: BoxDecoration(color: Colors.white.withOpacity(0.82), borderRadius: BorderRadius.circular(18), border: Border.all(color: Colors.blue.withOpacity(0.13))), child: child);
  Widget _aiIcon() => Container(width: 50, height: 50, decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFF10B981), Color(0xFF06B6D4), Color(0xFF6366F1)]), borderRadius: BorderRadius.circular(15)), child: const Center(child: Text('🤖', style: TextStyle(fontSize: 26))));
  Widget _aiPoweredBadge() => Container(padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8), decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFF10B981), Color(0xFF06B6D4)]), borderRadius: BorderRadius.circular(22)), child: const Text('✨ AI Powered', style: TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold)));
  Widget _stepCircle(int i, String l) => Column(children: [Container(width: 34, height: 34, decoration: BoxDecoration(shape: BoxShape.circle, color: _step >= i ? Colors.blue : Colors.transparent, border: Border.all(color: _step >= i ? Colors.blue : Colors.blue.withOpacity(0.2), width: 2)), child: Center(child: Text('$i', style: TextStyle(color: _step >= i ? Colors.white : Colors.blue.withOpacity(0.4), fontWeight: FontWeight.bold)))), Text(l, style: TextStyle(fontSize: 10, color: _step >= i ? Colors.blue : Colors.grey))]);
  Widget _stepLine(int i) => Expanded(child: Container(height: 2, margin: const EdgeInsets.only(bottom: 12), color: _step > i ? Colors.blue : Colors.blue.withOpacity(0.12)));
  Widget _stepHeader(String l) => Text(l, style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, letterSpacing: 1.5, color: Colors.grey));
  Widget _sectionLabel(String l) => Text(l, style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1));
  Widget _summaryItem(String l, String v) => Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: Colors.blue.withOpacity(0.08), borderRadius: BorderRadius.circular(8)), child: Text('$l: $v', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.indigo)));

  Widget _fileDropArea() {
    return GestureDetector(
      onTap: () async {
        final result = await FilePicker.platform.pickFiles(type: FileType.custom, allowedExtensions: ['pdf', 'docx', 'doc', 'txt']);
        if (result != null) setState(() => _file = result.files.first);
      },
      child: Container(
        height: 130,
        decoration: BoxDecoration(color: Colors.blue.withOpacity(_file == null ? 0.03 : 0.05), borderRadius: BorderRadius.circular(14), border: Border.all(color: _file == null ? Colors.blue.withOpacity(0.25) : Colors.green.withOpacity(0.35), width: 2, style: _file == null ? BorderStyle.solid : BorderStyle.solid)), // dotted not easy
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(_file == null ? '📂' : '✅', style: const TextStyle(fontSize: 34)),
              Text(_file == null ? 'Click to upload study material' : _file!.name, style: TextStyle(fontWeight: FontWeight.bold, color: _file == null ? Colors.indigo : Colors.green)),
              Text(_file == null ? 'PDF, DOCX, TXT supported' : '${(_file!.size / 1024).round()} KB', style: const TextStyle(fontSize: 12, color: Colors.grey)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _dropdown(String l, String? v, List<dynamic> o, ValueChanged<String?> onChange, String ph, {bool enabled = true}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionLabel(l),
        const SizedBox(height: 7),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(11), border: Border.all(color: Colors.blue.withOpacity(0.2))),
          child: DropdownButtonHideUnderline(child: DropdownButton<String>(value: v, hint: Text(ph, style: const TextStyle(fontSize: 14)), isExpanded: true, items: enabled ? o.map((e) => DropdownMenuItem(value: e['id'].toString(), child: Text(e['name']))).toList() : [], onChanged: enabled ? onChange : null)),
        ),
      ],
    );
  }

  Widget _counter() => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [_sectionLabel('QUESTION COUNT'), const SizedBox(height: 10), Container(decoration: BoxDecoration(border: Border.all(color: Colors.grey.shade300), borderRadius: BorderRadius.circular(11)), child: Row(mainAxisSize: MainAxisSize.min, children: [IconButton(onPressed: () => setState(() => _count = (_count > 1 ? _count - 1 : 1)), icon: const Icon(Icons.remove)), Text('$_count', style: const TextStyle(fontWeight: FontWeight.bold)), IconButton(onPressed: () => setState(() => _count = (_count < 50 ? _count + 1 : 50)), icon: const Icon(Icons.add))]))]);
  Widget _typeSelector() => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [_sectionLabel('QUESTION TYPE'), const SizedBox(height: 10), Row(children: ['MCQ', 'MULTI', 'NAQ'].map((t) => Padding(padding: const EdgeInsets.only(right: 6), child: ChoiceChip(label: Text(t), selected: _type == t, onSelected: (s) => setState(() => _type = t)))).toList())]);
  Widget _diffSelector() => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [_sectionLabel('DIFFICULTY'), const SizedBox(height: 10), Row(children: ['EASY', 'MEDIUM', 'DIFFICULT'].map((d) => Padding(padding: const EdgeInsets.only(right: 6), child: ChoiceChip(label: Text(d), selected: _diff == d, onSelected: (s) => setState(() => _diff = d)))).toList())]);

  Widget _badge(String l, Color c) => Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: c.withOpacity(0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: c.withOpacity(0.2))), child: Text(l, style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: c)));
}
