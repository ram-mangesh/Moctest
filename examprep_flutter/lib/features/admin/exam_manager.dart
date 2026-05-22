import 'package:flutter/material.dart';
import 'package:examprep_app/core/api/dio_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// ── ExamManager — Full parity with ExamManager.jsx
class ExamManager extends ConsumerStatefulWidget {
  const ExamManager({super.key});
  @override
  ConsumerState<ExamManager> createState() => _ExamManagerState();
}

class _ExamManagerState extends ConsumerState<ExamManager> {
  List<dynamic> _exams = [];
  final _nameCtrl = TextEditingController();
  Map<String, dynamic>? _editExam;
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final res = await ref.read(dioClientProvider).get('/admin/exams');
      if (mounted) setState(() { _exams = res.data; _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  Future<void> _submit() async {
    final name = _nameCtrl.text.trim();
    if (name.isEmpty) return;
    try {
      if (_editExam != null) {
        await ref.read(dioClientProvider).put('/admin/exams/${_editExam!['id']}', data: {'name': name});
      } else {
        await ref.read(dioClientProvider).post('/admin/exams', data: {'name': name});
      }
      _nameCtrl.clear();
      setState(() => _editExam = null);
      _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Operation failed')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Form Card
        Container(
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.82),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.14), width: 1.5),
            boxShadow: [BoxShadow(color: const Color(0xFF6366F1).withOpacity(0.09), blurRadius: 24, offset: const Offset(0, 4))],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Text('📝', style: TextStyle(fontSize: 22)),
                  const SizedBox(width: 10),
                  Text(_editExam != null ? 'Update Exam' : 'Add New Exam', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF1E1B4B))),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _nameCtrl,
                      decoration: InputDecoration(
                        hintText: 'Exam name (e.g. SSC CGL...)',
                        hintStyle: TextStyle(color: const Color(0xFF6366F1).withOpacity(0.38)),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(11), borderSide: BorderSide(color: const Color(0xFF6366F1).withOpacity(0.2))),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(11), borderSide: BorderSide(color: const Color(0xFF6366F1).withOpacity(0.2))),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(11), borderSide: const BorderSide(color: Color(0xFF6366F1))),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  ElevatedButton(
                    onPressed: _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF6366F1),
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(11)),
                    ),
                    child: Text(_editExam != null ? '✏️ Update' : '➕ Add Exam', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                  ),
                  if (_editExam != null) ...[
                    const SizedBox(width: 8),
                    TextButton(onPressed: () => setState(() { _editExam = null; _nameCtrl.clear(); }), child: const Text('Cancel')),
                  ],
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        // List Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('All Exams', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold)),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
              decoration: BoxDecoration(color: const Color(0xFF6366F1).withOpacity(0.1), borderRadius: BorderRadius.circular(20)),
              child: Text('${_exams.length} total', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF4338CA))),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (_loading) const Center(child: CircularProgressIndicator())
        else if (_exams.isEmpty) 
          const Center(child: Padding(padding: EdgeInsets.all(44), child: Text('📭 No exams yet — add one above!', style: TextStyle(color: Colors.grey))))
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _exams.length,
            itemBuilder: (_, i) {
              final exam = _exams[i];
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.78),
                  borderRadius: BorderRadius.circular(13),
                  border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.1)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 28, height: 28,
                      decoration: BoxDecoration(color: const Color(0xFF6366F1).withOpacity(0.1), borderRadius: BorderRadius.circular(9)),
                      child: Center(child: Text('${i + 1}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF4338CA)))),
                    ),
                    const SizedBox(width: 12),
                    Expanded(child: Text(exam['name'] ?? '', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700))),
                    Row(
                      children: [
                        TextButton(
                          onPressed: () => setState(() { _editExam = exam; _nameCtrl.text = exam['name']; }),
                          child: const Text('✏️ Edit', style: TextStyle(fontSize: 12)),
                        ),
                        TextButton(
                          onPressed: () async {
                            final conf = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(title: const Text('Delete?'), actions: [TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('No')), TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Yes'))]));
                            if (conf == true) {
                              await ref.read(dioClientProvider).delete('/admin/exams/${exam['id']}');
                              _load();
                            }
                          },
                          child: const Text('🗑️ Delete', style: TextStyle(fontSize: 12, color: Colors.red)),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
      ],
    );
  }
}
