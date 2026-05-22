import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:examprep_app/core/api/dio_client.dart';
import 'package:examprep_app/core/theme/app_theme.dart';
import 'package:examprep_app/shared/widgets/user_layout.dart';

// ── GroupExamList — Full parity with GroupExamList.jsx
class GroupExamList extends ConsumerStatefulWidget {
  const GroupExamList({super.key});
  @override
  ConsumerState<GroupExamList> createState() => _GroupExamListState();
}

class _GroupExamListState extends ConsumerState<GroupExamList> {
  List<dynamic> _groups = [], _exams = [], _subjects = [], _topics = [];
  String _examId = '', _subjectId = '', _topicId = '', _inviteCode = '';
  bool _loading = true;

  @override
  void initState() { super.initState(); _init(); }

  Future<void> _init() async {
    await Future.wait([_loadGroups(), _loadExams()]);
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _loadGroups() async {
    try {
      final r = await ref.read(dioClientProvider).get('/group-exam/my-groups');
      _groups = r.data as List;
    } catch (_) {}
  }

  Future<void> _loadExams() async {
    try {
      final r = await ref.read(dioClientProvider).get('/exam-data/exams');
      _exams = r.data as List;
    } catch (_) {}
  }

  Future<void> _loadSubjects(String eid) async {
    setState(() { _examId = eid; _subjectId = ''; _topicId = ''; _topics = []; });
    final r = await ref.read(dioClientProvider).get('/exam-data/subjects/$eid');
    setState(() => _subjects = r.data as List);
  }

  Future<void> _loadTopics(String sid) async {
    setState(() { _subjectId = sid; _topicId = ''; });
    final r = await ref.read(dioClientProvider).get('/exam-data/topics/$sid');
    setState(() => _topics = r.data as List);
  }

  Future<void> _createGroup() async {
    if (_topicId.isEmpty) { ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Select topic first'))); return; }
    await ref.read(dioClientProvider).post('/group-exam/create?topicId=$_topicId');
    await _loadGroups();
    setState(() {});
  }

  Future<void> _joinGroup() async {
    if (_inviteCode.isEmpty) return;
    final r = await ref.read(dioClientProvider).post('/group-exam/join/$_inviteCode');
    if (mounted) context.go('/group-exams/${r.data['id']}');
  }

  @override
  Widget build(BuildContext context) {
    return UserLayout(
      title: 'Group Battles',
      child: _loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(children: [
                // Create group panel
                _Panel(title: '⚡ Create New Battle', child: Wrap(spacing: 8, runSpacing: 8, children: [
                  _Dropdown(value: _examId.isEmpty ? null : _examId, hint: 'Select Exam',
                    items: _exams.map((e) => DropdownMenuItem(value: e['id'].toString(), child: Text(e['name'].toString()))).toList(),
                    onChanged: (v) => _loadSubjects(v!)),
                  _Dropdown(value: _subjectId.isEmpty ? null : _subjectId, hint: 'Select Subject',
                    items: _subjects.map((s) => DropdownMenuItem(value: s['id'].toString(), child: Text(s['name'].toString()))).toList(),
                    onChanged: _examId.isEmpty ? null : (v) => _loadTopics(v!)),
                  _Dropdown(value: _topicId.isEmpty ? null : _topicId, hint: 'Select Topic',
                    items: _topics.map((t) => DropdownMenuItem(value: t['id'].toString(), child: Text(t['name'].toString()))).toList(),
                    onChanged: _subjectId.isEmpty ? null : (v) => setState(() => _topicId = v!)),
                  ElevatedButton(onPressed: _createGroup, child: const Text('Create Battle')),
                ])),
                const SizedBox(height: 14),

                // Join group panel
                _Panel(title: '🎯 Join With Invite Code', child: Row(children: [
                  Expanded(child: TextField(
                    onChanged: (v) => _inviteCode = v,
                    decoration: const InputDecoration(hintText: 'Enter invite code…', isDense: true, contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 10)),
                  )),
                  const SizedBox(width: 10),
                  ElevatedButton(onPressed: _joinGroup, style: ElevatedButton.styleFrom(backgroundColor: AppColors.accent), child: const Text('Join')),
                ])),
                const SizedBox(height: 20),

                const Divider(),
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  child: Text('Active Rooms', style: GoogleFonts.plusJakartaSans(fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: 0.1, color: AppColors.primary)),
                ),

                _groups.isEmpty
                    ? Container(
                        padding: const EdgeInsets.all(40),
                        decoration: BoxDecoration(border: Border.all(color: AppColors.primary.withOpacity(0.15), width: 1.5, style: BorderStyle.solid), borderRadius: BorderRadius.circular(18)),
                        child: const Center(child: Text('👾 No active group rooms yet.\nCreate or join one above.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey))),
                      )
                    : Column(children: _groups.map((g) {
                        final m = g as Map<String, dynamic>;
                        return GestureDetector(
                          onTap: () => context.go('/group-exams/${m['id']}'),
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: AppColors.primary.withOpacity(0.12), width: 1.5),
                            ),
                            child: Row(children: [
                              const Text('👥', style: TextStyle(fontSize: 24)),
                              const SizedBox(width: 14),
                              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                Text('Invite: ${m['inviteCode'] ?? '—'}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                                Row(children: [
                                  _StatusChip(m['started'] == true ? '● Started' : '◌ Waiting', m['started'] == true),
                                  const SizedBox(width: 6),
                                  Text('${(m['participants'] as List?)?.length ?? 0} players', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                                ]),
                              ])),
                              const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey),
                            ]),
                          ),
                        );
                      }).toList()),
              ]),
            ),
    );
  }
}

class _Panel extends StatelessWidget {
  final String title;
  final Widget child;
  const _Panel({required this.title, required this.child});
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppColors.primary.withOpacity(0.12)),
          boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.06), blurRadius: 16)],
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.inkMuted)),
          const SizedBox(height: 12),
          child,
        ]),
      );
}

class _Dropdown extends StatelessWidget {
  final String? value;
  final String hint;
  final List<DropdownMenuItem<String>> items;
  final ValueChanged<String?>? onChanged;
  const _Dropdown({this.value, required this.hint, required this.items, this.onChanged});
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 12),
        decoration: BoxDecoration(
          color: const Color(0xFFF9FAFB),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.primary.withOpacity(0.18)),
        ),
        child: DropdownButton<String>(
          value: value,
          hint: Text(hint, style: const TextStyle(fontSize: 13)),
          items: items,
          onChanged: onChanged,
          underline: const SizedBox(),
          style: const TextStyle(fontSize: 13, color: AppColors.inkDark),
        ),
      );
}

class _StatusChip extends StatelessWidget {
  final String label;
  final bool started;
  const _StatusChip(this.label, this.started);
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(
          color: started ? AppColors.success.withOpacity(0.12) : AppColors.warning.withOpacity(0.12),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: started ? AppColors.success.withOpacity(0.3) : AppColors.warning.withOpacity(0.3)),
        ),
        child: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: started ? AppColors.success : AppColors.warning)),
      );
}
