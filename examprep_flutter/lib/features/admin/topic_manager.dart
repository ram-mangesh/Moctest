import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:examprep_app/core/api/dio_client.dart';

class TopicManager extends ConsumerStatefulWidget {
  const TopicManager({super.key});
  @override
  ConsumerState<TopicManager> createState() => _TopicManagerState();
}

class _TopicManagerState extends ConsumerState<TopicManager> {
  List<dynamic> _exams = [];
  List<dynamic> _subjects = [];
  List<dynamic> _topics = [];
  String? _examId, _subjectId;
  final _nameCtrl = TextEditingController();
  Map<String, dynamic>? _editTopic;
  bool _loading = false;

  @override
  void initState() { super.initState(); _loadExams(); }

  Future<void> _loadExams() async {
    final res = await ref.read(dioClientProvider).get('/admin/exams');
    if (mounted) setState(() => _exams = res.data);
  }

  Future<void> _loadSubjects(String? eid) async {
    if (eid == null) { setState(() { _subjects = []; _topics = []; }); return; }
    final res = await ref.read(dioClientProvider).get('/admin/subjects?examId=$eid');
    if (mounted) setState(() { _subjects = res.data; _subjectId = null; _topics = []; });
  }

  Future<void> _loadTopics(String? sid) async {
    if (sid == null) { setState(() => _topics = []); return; }
    setState(() => _loading = true);
    final res = await ref.read(dioClientProvider).get('/admin/topics?subjectId=$sid');
    if (mounted) setState(() { _topics = res.data; _loading = false; });
  }

  Future<void> _submit() async {
    if (_subjectId == null) return;
    final name = _nameCtrl.text.trim();
    if (name.isEmpty) return;
    try {
      if (_editTopic != null) {
        await ref.read(dioClientProvider).put('/admin/topics/${_editTopic!['id']}', data: {'name': name});
      } else {
        await ref.read(dioClientProvider).post('/admin/topics', data: {'name': name, 'subjectId': int.parse(_subjectId!)});
      }
      _nameCtrl.clear();
      setState(() => _editTopic = null);
      _loadTopics(_subjectId);
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.82),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: const Color(0xFF0D9488).withOpacity(0.14), width: 1.5),
            boxShadow: [BoxShadow(color: const Color(0xFF0D9488).withOpacity(0.09), blurRadius: 24, offset: const Offset(0, 4))],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Text('🏷️', style: TextStyle(fontSize: 22)),
                  const SizedBox(width: 10),
                  Text(_editTopic != null ? 'Update Topic' : 'Add New Topic', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF1E1B4B))),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('SELECT EXAM', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Colors.grey)),
                        const SizedBox(height: 7),
                        _dropdown(_examId, _exams, (v) {
                          setState(() => _examId = v);
                          _loadSubjects(v);
                        }, 'Choose Exam'),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('SELECT SUBJECT', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Colors.grey)),
                        const SizedBox(height: 7),
                        _dropdown(_subjectId, _subjects, (v) {
                          setState(() => _subjectId = v);
                          _loadTopics(v);
                        }, 'Choose Subject', enabled: _examId != null),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _nameCtrl,
                      enabled: _subjectId != null,
                      decoration: InputDecoration(
                        hintText: 'Topic name (e.g. Algebra)',
                        hintStyle: TextStyle(color: const Color(0xFF0D9488).withOpacity(0.38)),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(11), borderSide: BorderSide(color: const Color(0xFF0D9488).withOpacity(0.2))),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  ElevatedButton(
                    onPressed: _subjectId == null ? null : _submit,
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0D9488), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(11))),
                    child: Text(_editTopic != null ? 'Update' : 'Add', style: const TextStyle(color: Colors.white)),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        if (_subjectId != null) ...[
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Topics', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                decoration: BoxDecoration(color: const Color(0xFF0D9488).withOpacity(0.12), borderRadius: BorderRadius.circular(20)),
                child: Text('${_topics.length} total', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0D9488))),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (_loading) const Center(child: CircularProgressIndicator())
          else if (_topics.isEmpty)
            const Center(child: Padding(padding: EdgeInsets.all(44), child: Text('📭 No topics yet.')))
          else
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _topics.length,
              itemBuilder: (_, i) {
                final t = _topics[i];
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(color: Colors.white.withOpacity(0.78), borderRadius: BorderRadius.circular(13), border: Border.all(color: const Color(0xFF0D9488).withOpacity(0.1))),
                  child: Row(
                    children: [
                      Container(
                        width: 28, height: 28,
                        decoration: BoxDecoration(color: const Color(0xFF0D9488).withOpacity(0.12), borderRadius: BorderRadius.circular(9)),
                        child: Center(child: Text('${i + 1}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF0D9488)))),
                      ),
                      const SizedBox(width: 12),
                      Expanded(child: Text(t['name'] ?? '', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700))),
                      TextButton(onPressed: () => setState(() { _editTopic = t; _nameCtrl.text = t['name']; }), child: const Text('✏️ Edit')),
                      TextButton(onPressed: () async {
                        final conf = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(title: const Text('Delete?'), actions: [TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('No')), TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Yes'))]));
                        if (conf == true) { await ref.read(dioClientProvider).delete('/admin/topics/${t['id']}'); _loadTopics(_subjectId); }
                      }, child: const Text('🗑️ Delete', style: TextStyle(color: Colors.red))),
                    ],
                  ),
                );
              },
            ),
        ],
      ],
    );
  }

  Widget _dropdown(String? val, List<dynamic> opts, ValueChanged<String?> onChange, String hint, {bool enabled = true}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(11), border: Border.all(color: const Color(0xFF0D9488).withOpacity(0.2))),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: val,
          hint: Text(hint, style: const TextStyle(fontSize: 13)),
          isExpanded: true,
          items: enabled ? opts.map((e) => DropdownMenuItem(value: e['id'].toString(), child: Text(e['name']))).toList() : [],
          onChanged: enabled ? onChange : null,
        ),
      ),
    );
  }
}
