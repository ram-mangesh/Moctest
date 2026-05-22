import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import 'package:examprep_app/core/api/dio_client.dart';

class GroupExamList extends ConsumerStatefulWidget {
  const GroupExamList({super.key});
  @override
  ConsumerState<GroupExamList> createState() => _GroupExamListState();
}

class _GroupExamListState extends ConsumerState<GroupExamList> {
  List<dynamic> _groups = [];
  bool _loading = true;
  String? _inviteCode;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ref.read(dioClientProvider).get('/group-exam/my-groups');
      if (mounted) setState(() { _groups = res.data ?? []; _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  Future<void> _join(String code) async {
    try {
      final res = await ref.read(dioClientProvider).post('/group-exam/join/$code');
      if (mounted) context.push('/group-exams/${res.data['id']}');
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Invalid Invite Code')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFF),
      appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0, leading: const BackButton(color: Colors.black)),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _eyebrow('Multiplayer Arena'),
            const SizedBox(height: 8),
            RichText(text: TextSpan(style: GoogleFonts.spaceGrotesk(fontSize: 32, fontWeight: FontWeight.bold, color: const Color(0xFF1E1B4B)), children: [const TextSpan(text: 'My Groups '), TextSpan(text: 'Battles', style: TextStyle(foreground: Paint()..shader = const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFFEC4899)]).createShader(const Rect.fromLTWH(0, 0, 200, 70))))])),
            const SizedBox(height: 24),
            _joinPanel(),
            const SizedBox(height: 24),
            Row(children: [const Expanded(child: Divider()), Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4), decoration: BoxDecoration(color: const Color(0xFFEDE9FE), borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFF7C3AED).withOpacity(0.18))), child: const Text('ACTIVE ROOMS', style: TextStyle(color: Color(0xFF7C3AED), fontWeight: FontWeight.bold, fontSize: 10, letterSpacing: 1.5)))), const Expanded(child: Divider())]),
            const SizedBox(height: 24),
            _loading ? const Center(child: CircularProgressIndicator()) : (_groups.isEmpty ? _empty() : Column(children: _groups.map((g) => _groupCard(g)).toList())),
          ],
        ),
      ),
    );
  }

  Widget _eyebrow(String text) => Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4), decoration: BoxDecoration(color: const Color(0xFFEDE9FE), border: Border.all(color: const Color(0xFF7C3AED).withOpacity(0.28)), borderRadius: BorderRadius.circular(100)), child: Text(text.toUpperCase(), style: const TextStyle(color: Color(0xFF7C3AED), fontWeight: FontWeight.w700, fontSize: 10, letterSpacing: 1.2)));

  Widget _joinPanel() => Container(padding: const EdgeInsets.all(24), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.black.withOpacity(0.07)), boxShadow: [BoxShadow(color: const Color(0xFF7C3AED).withOpacity(0.08), blurRadius: 20)]), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [const Text('🎯 JOIN WITH INVITE CODE', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Colors.grey, letterSpacing: 1)), const SizedBox(height: 16), Row(children: [Expanded(child: TextField(onChanged: (v) => _inviteCode = v, decoration: InputDecoration(hintText: 'Code', filled: true, fillColor: const Color(0xFFF9FAFB), border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none)))), const SizedBox(width: 12), ElevatedButton(onPressed: () => _inviteCode != null ? _join(_inviteCode!) : null, style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0891B2), foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))), child: const Text('JOIN'))])]));

  Widget _groupCard(Map<String, dynamic> g) {
    final started = g['started'] ?? false;
    return InkWell(
      onTap: () => context.push('/group-exams/${g['id']}'),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.black.withOpacity(0.07)), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10)]),
        child: Row(
          children: [
            Container(width: 46, height: 46, decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFFEDE9FE), Color(0xFFFCE7F3)]), borderRadius: BorderRadius.circular(12)), child: const Center(child: Text('👥', style: TextStyle(fontSize: 20)))),
            const SizedBox(width: 16),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('INVITE: ${g['inviteCode']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF7C3AED))), const SizedBox(height: 4), Row(children: [_chip(started ? '● STARTED' : '◌ WAITING', started ? Colors.green : Colors.orange), const SizedBox(width: 8), _chip('⚡ ${g['participants']?.length ?? 0} PLAYERS', Colors.deepPurple)])])),
            const Icon(Icons.chevron_right, color: Color(0xFFCBD5E1)),
          ],
        ),
      ),
    );
  }

  Widget _chip(String t, Color c) => Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2), decoration: BoxDecoration(color: c.withOpacity(0.1), borderRadius: BorderRadius.circular(100), border: Border.all(color: c.withOpacity(0.3))), child: Text(t, style: TextStyle(color: c, fontSize: 9, fontWeight: FontWeight.bold)));

  Widget _empty() => Center(child: Column(children: [const SizedBox(height: 40), const Text('👾', style: TextStyle(fontSize: 48)), const SizedBox(height: 16), const Text('No active battle rooms found', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.w600))]));
}
