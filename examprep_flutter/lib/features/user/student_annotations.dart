import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:examprep_app/core/api/dio_client.dart';

class StudentAnnotations extends ConsumerStatefulWidget {
  const StudentAnnotations({super.key});
  @override
  ConsumerState<StudentAnnotations> createState() => _StudentAnnotationsState();
}

class _StudentAnnotationsState extends ConsumerState<StudentAnnotations> {
  List<dynamic> _annotations = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ref.read(dioClientProvider).get('/user/annotations/my');
      if (mounted) setState(() { _annotations = res.data ?? []; _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0, title: Text('Teacher Feedback', style: GoogleFonts.plusJakartaSans(color: const Color(0xFF1E1B4B), fontWeight: FontWeight.bold)), leading: const BackButton(color: Colors.black)),
      body: _loading ? const Center(child: CircularProgressIndicator()) : (_annotations.isEmpty ? _empty() : _buildList()),
    );
  }

  Widget _empty() => Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [const Text('📝', style: TextStyle(fontSize: 48)), const SizedBox(height: 16), Text('No teacher feedback yet', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.bold, fontSize: 18)), const Text('Your teacher\'s annotations will appear here', style: TextStyle(color: Colors.grey))]));

  Widget _buildList() {
    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: _annotations.length,
      itemBuilder: (context, index) {
        final a = _annotations[index];
        return _card(a);
      },
    );
  }

  Widget _card(Map<String, dynamic> a) {
    final tag = a['tag']?.toString().toLowerCase();
    Color tagColor = Colors.indigo;
    if (tag == 'strength') tagColor = Colors.green;
    if (tag == 'weakness') tagColor = Colors.red;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.indigo.withOpacity(0.1)), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10)]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(children: [Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: Colors.indigo.withOpacity(0.1), borderRadius: BorderRadius.circular(8)), child: const Text('👨‍🏫', style: TextStyle(fontSize: 16))), const SizedBox(width: 8), Text('Attempt #${a['attemptId']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14))]),
              if (a['tag'] != null) Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: tagColor.withOpacity(0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: tagColor.withOpacity(0.2))), child: Text(a['tag'].toString().toUpperCase(), style: TextStyle(color: tagColor, fontSize: 10, fontWeight: FontWeight.bold))),
            ],
          ),
          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.only(left: 40),
            child: Text(a['note'] ?? '', style: TextStyle(color: Colors.black.withOpacity(0.7), height: 1.6, fontSize: 14)),
          ),
          const SizedBox(height: 12),
          Align(alignment: Alignment.centerRight, child: Text(a['createdAt'] ?? '', style: const TextStyle(color: Colors.grey, fontSize: 11))),
        ],
      ),
    );
  }
}
