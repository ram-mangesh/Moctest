import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:examprep_app/core/api/dio_client.dart';
import 'package:examprep_app/core/theme/app_theme.dart';

// ── GroupLobby — Full parity with GroupLobby.jsx
// Features:
//  • Polling /group-exam/:id every 3 seconds
//  • Displays invite code and participants
//  • Auto-navigates to test when started
//  • Only creator can start the exam
class GroupLobby extends ConsumerStatefulWidget {
  final String groupId;
  const GroupLobby({super.key, required this.groupId});

  @override
  ConsumerState<GroupLobby> createState() => _GroupLobbyState();
}

class _GroupLobbyState extends ConsumerState<GroupLobby> {
  Map<String, dynamic>? _group;
  Timer? _pollingTimer;
  int _userId = 0;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    final idStr = await AuthStorage.getUserId();
    _userId = int.tryParse(idStr ?? '0') ?? 0;
    _loadLobby();
    _pollingTimer = Timer.periodic(const Duration(seconds: 3), (_) => _loadLobby());
  }

  Future<void> _loadLobby() async {
    try {
      final api = ref.read(dioClientProvider);
      final res = await api.get('/group-exam/${widget.groupId}');
      final data = res.data as Map<String, dynamic>;
      
      if (mounted) {
        setState(() => _group = data);
        if (data['started'] == true) {
          _pollingTimer?.cancel();
          context.go('/group-exams/${widget.groupId}/start');
        }
      }
    } catch (e) {
      debugPrint("Lobby error: $e");
    }
  }

  Future<void> _startExam() async {
    try {
      await ref.read(dioClientProvider).post('/group-exam/${widget.groupId}/start');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Only the host can start the exam')),
        );
      }
    }
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_group == null) {
      return Scaffold(
        backgroundColor: const Color(0xFFF8F4FF),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const CircularProgressIndicator(color: Color(0xFF7C3AED)),
              const SizedBox(height: 16),
              Text('LOADING LOBBY...', style: GoogleFonts.spaceGrotesk(letterSpacing: 2, fontWeight: FontWeight.bold, color: Colors.grey)),
            ],
          ),
        ),
      );
    }

    final participants = (_group!['participants'] as List?) ?? [];
    final count = participants.length;
    final isCreator = (_group!['createdBy'] as num?)?.toInt() == _userId;
    final emptySlots = (count < 4 ? 4 - count : 0);

    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          color: Color(0xFFF8F4FF),
          gradient: RadialGradient(
            center: Alignment(0.2, -0.4),
            radius: 1.2,
            colors: [Color(0x1C7C3AED), Colors.transparent],
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Container(
                constraints: const BoxConstraints(maxWidth: 500),
                padding: const EdgeInsets.all(40),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(28),
                  border: Border.all(color: Colors.black.withOpacity(0.07), width: 1.5),
                  boxShadow: [
                    BoxShadow(color: const Color(0xFF7C3AED).withOpacity(0.1), blurRadius: 56, offset: const Offset(0, 12)),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFCFFAFE),
                        borderRadius: BorderRadius.circular(100),
                        border: Border.all(color: const Color(0xFF0891B2).withOpacity(0.28), width: 1.5),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          _BlinkingDot(),
                          const SizedBox(width: 6),
                          Text('LIVE LOBBY', style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2, color: const Color(0xFF0891B2))),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text('👥 Lobby', 
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 28, 
                        fontWeight: FontWeight.bold,
                        foreground: Paint()..shader = const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFFEC4899)]).createShader(const Rect.fromLTWH(0, 0, 200, 70))
                      ),
                    ),
                    const SizedBox(height: 28),
                    // Invite Code
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [Color(0x0F7C3AED), Color(0x12EC4899)]),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFF7C3AED).withOpacity(0.22), width: 1.5),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('INVITE CODE', style: GoogleFonts.spaceGrotesk(fontSize: 10, letterSpacing: 2, color: Colors.grey)),
                              const SizedBox(height: 5),
                              Text(_group!['inviteCode'] ?? '—', style: GoogleFonts.spaceGrotesk(fontSize: 28, fontWeight: FontWeight.bold, color: const Color(0xFF7C3AED), letterSpacing: 8)),
                            ],
                          ),
                          const Text('🔗', style: TextStyle(fontSize: 28)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 28),
                    // Participants
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('PARTICIPANTS JOINED', style: GoogleFonts.spaceGrotesk(fontSize: 10, letterSpacing: 2, color: Colors.grey)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                          decoration: BoxDecoration(color: const Color(0xFFD1FAE5), borderRadius: BorderRadius.circular(100), border: Border.all(color: const Color(0xFF059669).withOpacity(0.28), width: 1.5)),
                          child: Text('✦ $count joined', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF059669))),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        ...participants.map((_) => _PlayerOrb()),
                        ...List.generate(emptySlots, (_) => _EmptyOrb()),
                      ],
                    ),
                    const SizedBox(height: 28),
                    const Divider(),
                    const SizedBox(height: 28),
                    // Action button
                    if (isCreator && !(_group!['started'] == true))
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _startExam,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF7C3AED),
                            padding: const EdgeInsets.symmetric(vertical: 20),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          child: Text('⚡ START EXAM', style: GoogleFonts.spaceGrotesk(fontSize: 15, fontWeight: FontWeight.bold, letterSpacing: 2, color: Colors.white)),
                        ),
                      )
                    else
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(color: const Color(0xFFF9FAFB), borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.black.withOpacity(0.07), width: 1.5)),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const _WaitingDots(),
                            const SizedBox(width: 12),
                            Text('WAITING FOR HOST', style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 1, color: Colors.grey)),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _BlinkingDot extends StatefulWidget {
  @override
  State<_BlinkingDot> createState() => _BlinkingDotState();
}

class _BlinkingDotState extends State<_BlinkingDot> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1400))..repeat(reverse: true);
  }
  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (_, __) => Container(
        width: 7, height: 7,
        decoration: BoxDecoration(
          color: const Color(0xFF0891B2),
          shape: BoxShape.circle,
          boxShadow: [BoxShadow(color: const Color(0xFF0891B2).withOpacity(0.5 * _ctrl.value), blurRadius: 10 * _ctrl.value, spreadRadius: 5 * _ctrl.value)],
        ),
      ),
    );
  }
}

class _PlayerOrb extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 42, height: 42,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: const LinearGradient(colors: [Color(0xFFEDE9FE), Color(0x1F7C3AED)]),
        border: Border.all(color: const Color(0xFF7C3AED).withOpacity(0.3), width: 2),
        boxShadow: [BoxShadow(color: const Color(0xFF7C3AED).withOpacity(0.12), blurRadius: 10, offset: const Offset(0, 2))],
      ),
      child: const Center(child: Text('👤', style: TextStyle(fontSize: 20))),
    );
  }
}

class _EmptyOrb extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 42, height: 42,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: const Color(0xFFF9FAFB),
        border: Border.all(color: Colors.black.withOpacity(0.1), width: 2, style: BorderStyle.none), // dashed border not easy in flutter without pkg, using placeholder
      ),
      child: Center(child: Text('+', style: GoogleFonts.spaceGrotesk(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.grey.withOpacity(0.5)))),
    );
  }
}

class _WaitingDots extends StatefulWidget {
  const _WaitingDots();
  @override
  State<_WaitingDots> createState() => _WaitingDotsState();
}

class _WaitingDotsState extends State<_WaitingDots> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  @override
  void initState() { super.initState(); _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1400))..repeat(); }
  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(3, (i) => AnimatedBuilder(
        animation: _ctrl,
        builder: (_, __) {
          final t = (_ctrl.value + i * 0.18) % 1.0;
          final scale = t < 0.4 ? 0.65 + (t / 0.4) * 0.45 : t < 0.8 ? 1.1 - ((t - 0.4) / 0.4) * 0.45 : 0.65;
          return Container(width: 7, height: 7, margin: const EdgeInsets.only(right: 5), decoration: BoxDecoration(shape: BoxShape.circle, color: const Color(0xFF7C3AED).withOpacity(scale)));
        },
      )),
    );
  }
}
