import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';
import 'package:dio/dio.dart';
import 'package:examprep_app/core/api/dio_client.dart';

class AssignmentList extends ConsumerStatefulWidget {
  const AssignmentList({super.key});
  @override
  ConsumerState<AssignmentList> createState() => _AssignmentListState();
}

class _AssignmentListState extends ConsumerState<AssignmentList> {
  List<dynamic> _subjects = [];
  Map<int, List<dynamic>> _assignments = {};
  Map<int, dynamic> _attempts = {};
  bool _loading = true;
  int? _uploadingId;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final dio = ref.read(dioClientProvider);
      // Assuming examId is available in local storage or state.
      // For now, testing with fixed query or general subjects.
      final subjRes = await dio.get('/user/subjects');
      _subjects = subjRes.data ?? [];

      for (var s in _subjects) {
        final assRes = await dio.get('/user/topics?subjectId=${s['id']}');
        _assignments[s['id']] = assRes.data ?? [];
      }

      final attRes = await dio.get('/user/assignment/attempts');
      for (var a in attRes.data) {
        _attempts[a['assignmentId']] = a;
      }
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _uploadFile(int assignmentId) async {
    final result = await FilePicker.platform.pickFiles();
    if (result == null || result.files.isEmpty) return;

    final file = result.files.first;
    setState(() => _uploadingId = assignmentId);

    try {
      final formData = FormData.fromMap({
        'assignmentId': assignmentId,
        'file': await MultipartFile.fromFile(file.path!, filename: file.name),
      });

      await ref.read(dioClientProvider).post('/user/assignment/upload', data: formData);
      _loadData(); // Refresh
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('✅ Assignment uploaded successfully!')));
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('❌ Upload failed.')));
    }
    setState(() => _uploadingId = null);
  }

  String _getStatus(int id) {
    final a = _attempts[id];
    if (a == null) return "Pending";
    if (!a['aiEvaluated']) return "Submitted";
    return "Evaluated";
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: _loading ? const Center(child: CircularProgressIndicator()) : SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('📘 My Assignments', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Color(0xFF1E1B4B))),
            const SizedBox(height: 24),
            if (_subjects.isEmpty) const Center(child: Text('No subjects available for your standard'))
            else ..._subjects.map((s) => _subjectSection(s)).toList(),
          ],
        ),
      ),
    );
  }

  Widget _subjectSection(Map<String, dynamic> s) {
    final list = _assignments[s['id']] ?? [];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(padding: const EdgeInsets.symmetric(vertical: 12), child: Text(s['name'], style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold))),
        if (list.isEmpty) const Text('No assignments', style: TextStyle(color: Colors.grey, fontSize: 13))
        else ...list.map((a) => _assignmentCard(a)).toList(),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _assignmentCard(Map<String, dynamic> a) {
    final status = _getStatus(a['id']);
    final attempt = _attempts[a['id']];

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.indigo.withOpacity(0.05)), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(a['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              _statusChip(status),
            ],
          ),
          const SizedBox(height: 8),
          Text(a['description'] ?? 'Written assignment', style: const TextStyle(fontSize: 13, color: Colors.grey)),
          const SizedBox(height: 16),
          if (status == "Pending")
             ElevatedButton.icon(onPressed: _uploadingId == a['id'] ? null : () => _uploadFile(a['id']), icon: const Icon(Icons.upload_file, size: 18), label: Text(_uploadingId == a['id'] ? 'Uploading...' : 'Upload Submission'))
          else
             _attemptDetails(attempt),
          if (status == "Evaluated") _aiFeedback(attempt),
        ],
      ),
    );
  }

  Widget _statusChip(String s) {
    Color c = s == "Pending" ? Colors.orange : (s == "Submitted" ? Colors.blue : Colors.green);
    return Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: c.withOpacity(0.1), borderRadius: BorderRadius.circular(12)), child: Text(s, style: TextStyle(color: c, fontSize: 10, fontWeight: FontWeight.bold)));
  }

  Widget _attemptDetails(Map<String, dynamic> att) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('📤 Submitted: ${att['submittedAt']?.substring(0, 10)}', style: const TextStyle(fontSize: 12, color: Colors.grey)),
        Text('👨‍🏫 Reviewed: ${att['reviewed'] ? '✅ Yes' : '❌ No'}', style: const TextStyle(fontSize: 12, color: Colors.grey)),
      ],
    );
  }

  Widget _aiFeedback(Map<String, dynamic> att) {
    return Container(
      margin: const EdgeInsets.only(top: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.indigo.shade50, borderRadius: BorderRadius.circular(12)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('🤖 AI Feedback', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.indigo)),
          const SizedBox(height: 4),
          Text('Score: ${att['score']}%', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 8),
          Text(att['aiRecommendation'] ?? '', style: const TextStyle(fontSize: 12, color: Color(0xFF1E1B4B))),
        ],
      ),
    );
  }
}
