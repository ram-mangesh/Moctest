import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:examprep_app/core/api/dio_client.dart';

class SubjectManager extends ConsumerStatefulWidget {
  const SubjectManager({super.key});
  @override
  ConsumerState<SubjectManager> createState() => _SubjectManagerState();
}

class _SubjectManagerState extends ConsumerState<SubjectManager> {
  List<dynamic> _exams = [];
  List<dynamic> _subjects = [];
  String? _examId;
  final _nameCtrl = TextEditingController();
  Map<String, dynamic>? _editId;
  bool _loading = false;

  @override
  void initState() { super.initState(); _loadExams(); }

  Future<void> _loadExams() async {
    final res = await ref.read(dioClientProvider).get('/admin/exams');
    if (mounted) setState(() => _exams = res.data);
  }

  Future<void> _loadSubjects(String? eid) async {
    if (eid == null) { setState(() => _subjects = []); return; }
    setState(() => _loading = true);
    final res = await ref.read(dioClientProvider).get('/admin/subjects?examId=$eid');
    if (mounted) setState(() { _subjects = res.data; _loading = false; });
  }

  Future<void> _submit() async {
    if (_examId == null) return;
    final name = _nameCtrl.text.trim();
    if (name.isEmpty) return;
    try {
      if (_editId != null) {
        await ref.read(dioClientProvider).put('/admin/subjects/${_editId!['id']}', data: {'name': name});
      } else {
        await ref.read(dioClientProvider).post('/admin/subjects', data: {'name': name, 'examId': int.parse(_examId!)});
      }
      _nameCtrl.clear();
      setState(() => _editId = null);
      _loadSubjects(_examId);
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Form
        Container(
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.82),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: const Color(0xFF7C3AED).withOpacity(0.14), width: 1.5),
            boxShadow: [BoxShadow(color: const Color(0xFF7C3AED).withOpacity(0.09), blurRadius: 24, offset: const Offset(0, 4))],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Text('📚', style: TextStyle(fontSize: 22)),
                  const SizedBox(width: 10),
                  Text(_editId != null ? 'Update Subject' : 'Add New Subject', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF1E1B4B))),
                ],
              ),
              const SizedBox(height: 16),
              const Text('SELECT EXAM', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Colors.grey)),
              const SizedBox(height: 7),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(11), border: Border.all(color: const Color(0xFF7C3AED).withOpacity(0.2))),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _examId,
                    hint: const Text('— Choose an exam —', style: TextStyle(fontSize: 14)),
                    isExpanded: true,
                    items: _exams.map((e) => DropdownMenuItem(value: e['id'].toString(), child: Text(e['name']))).toList(),
                    onChanged: (v) {
                      setState(() { _examId = v; _editId = null; _nameCtrl.clear(); });
                      _loadSubjects(v);
                    },
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _nameCtrl,
                      enabled: _examId != null,
                      decoration: InputDecoration(
                        hintText: 'Subject name (e.g. Mathematics)',
                        hintStyle: TextStyle(color: const Color(0xFF7C3AED).withOpacity(0.38)),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(11), borderSide: BorderSide(color: const Color(0xFF7C3AED).withOpacity(0.2))),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  ElevatedButton(
                    onPressed: _examId == null ? null : _submit,
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF7C3AED), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(11))),
                    child: Text(_editId != null ? 'Update' : 'Add', style: const TextStyle(color: Colors.white)),
                  ),
                  if (_editId != null) ...[
                    const SizedBox(width: 8),
                    TextButton(onPressed: () => setState(() { _editId = null; _nameCtrl.clear(); }), child: const Text('Cancel')),
                  ],
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        if (_examId != null) ...[
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Subjects', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                decoration: BoxDecoration(color: const Color(0xFF7C3AED).withOpacity(0.12), borderRadius: BorderRadius.circular(20)),
                child: Text('${_subjects.length} total', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF7C3AED))),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (_loading) const Center(child: CircularProgressIndicator())
          else if (_subjects.isEmpty)
            const Center(child: Padding(padding: EdgeInsets.all(44), child: Text('📭 No subjects yet for this exam.')))
          else
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _subjects.length,
              itemBuilder: (_, i) {
                final s = _subjects[i];
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(color: Colors.white.withOpacity(0.78), borderRadius: BorderRadius.circular(13), border: Border.all(color: const Color(0xFF7C3AED).withOpacity(0.1))),
                  child: Row(
                    children: [
                      Container(
                        width: 28, height: 28,
                        decoration: BoxDecoration(color: const Color(0xFF7C3AED).withOpacity(0.12), borderRadius: BorderRadius.circular(9)),
                        child: Center(child: Text('${i + 1}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF7C3AED)))),
                      ),
                      const SizedBox(width: 12),
                      Expanded(child: Text(s['name'] ?? '', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700))),
                      TextButton(onPressed: () => setState(() { _editId = s; _nameCtrl.text = s['name']; }), child: const Text('✏️ Edit')),
                      TextButton(onPressed: () async {
                        final conf = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(title: const Text('Delete?'), actions: [TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('No')), TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Yes'))]));
                        if (conf == true) { await ref.read(dioClientProvider).delete('/admin/subjects/${s['id']}'); _loadSubjects(_examId); }
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
}
