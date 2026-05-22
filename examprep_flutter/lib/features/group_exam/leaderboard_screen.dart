import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:examprep_app/core/api/dio_client.dart';
import 'package:examprep_app/core/theme/app_theme.dart';

// ── Leaderboard — Full parity with Leaderboard .jsx
// Features:
//  • Polling /group-exam/:id/leaderboard every 3 seconds
//  • Podium for top 3 (Silver, Gold, Bronze)
//  • Animated rows with rank badges
//  • Delete exam option for host (mapped from React)
class LeaderboardScreen extends ConsumerStatefulWidget {
  final String groupId;
  const LeaderboardScreen({super.key, required this.groupId});

  @override
  ConsumerState<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends ConsumerState<LeaderboardScreen> {
  List<dynamic> _rows = [];
  bool _loading = true;
  Timer? _pollingTimer;

  @override
  void initState() {
    super.initState();
    _load();
    _pollingTimer = Timer.periodic(const Duration(seconds: 3), (_) => _load());
  }

  Future<void> _load() async {
    try {
      final res = await ref.read(dioClientProvider).get('/group-exam/${widget.groupId}/leaderboard');
      if (mounted) {
        setState(() {
          _rows = res.data as List;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _deleteExam() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Exam?'),
        content: const Text('Are you sure you want to delete this exam?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Delete', style: TextStyle(color: Colors.red))),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await ref.read(dioClientProvider).delete('/group-exam/${widget.groupId}');
        if (mounted) context.go('/group-exams');
      } catch (e) {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to delete exam')));
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
    if (_loading) {
      return const Scaffold(
        backgroundColor: Color(0xFFF8F4FF),
        body: Center(child: CircularProgressIndicator(color: Color(0xFFC77DFF))),
      );
    }

    final top3 = _rows.take(3).toList();
    // Podium order: Silver (2nd), Gold (1st), Bronze (3rd)
    List<dynamic?> podium = [null, null, null];
    if (top3.isNotEmpty) {
      podium[1] = top3[0]; // Gold
      if (top3.length > 1) podium[0] = top3[1]; // Silver
      if (top3.length > 2) podium[2] = top3[2]; // Bronze
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8F4FF),
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: RadialGradient(
            center: Alignment(0, -0.5),
            radius: 1.5,
            colors: [Color(0x1FC77DFF), Colors.transparent],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.all(24.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(colors: [Color(0x22FF6B9D), Color(0x22C77DFF)]),
                            borderRadius: BorderRadius.circular(100),
                            border: Border.all(color: const Color(0xFFC77DFF).withOpacity(0.35), width: 1.5),
                          ),
                          child: Row(
                            children: [
                              _BlinkingDot(),
                              const SizedBox(width: 6),
                              Text('LIVE RESULTS', style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2, color: const Color(0xFFC77DFF))),
                            ],
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text('🏆 Leaderboard', 
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 32, 
                            fontWeight: FontWeight.bold,
                            foreground: Paint()..shader = const LinearGradient(colors: [Color(0xFFC77DFF), Color(0xFFFF6B9D)]).createShader(const Rect.fromLTWH(0, 0, 300, 70))
                          ),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete_outline, color: Color(0xFFE63A6A)),
                      onPressed: _deleteExam,
                      tooltip: 'Delete Exam',
                    ),
                  ],
                ),
              ),

              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    children: [
                      // Podium
                      if (_rows.length >= 2)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 30),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              _PodiumColumn(index: 1, user: podium[0]),
                              _PodiumColumn(index: 0, user: podium[1]),
                              _PodiumColumn(index: 2, user: podium[2]),
                            ],
                          ),
                        ),

                      // Table
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.black.withOpacity(0.06), width: 1.5),
                          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 40, offset: const Offset(0, 8))],
                        ),
                        child: Column(
                          children: [
                            _TableHeader(),
                            if (_rows.isEmpty)
                              const Padding(
                                padding: EdgeInsets.all(50),
                                child: Text('⏳ No results yet — waiting for players to finish', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
                              )
                            else
                              ...List.generate(_rows.length, (i) => _LeaderboardRow(index: i, user: _rows[i])),
                          ],
                        ),
                      ),
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PodiumColumn extends StatelessWidget {
  final int index; // 0, 1, 2 for Gold, Silver, Bronze
  final Map<String, dynamic>? user;
  const _PodiumColumn({required this.index, this.user});

  @override
  Widget build(BuildContext context) {
    if (user == null) return const SizedBox(width: 90);

    final isGold = index == 0;
    final h = [72.0, 52.0, 36.0][index];
    final color = [const Color(0xFFFFB703), const Color(0xFF94A3B8), const Color(0xFFCD7F32)][index];
    final badge = ['🥇', '🥈', '🥉'][index];
    final rankNum = [1, 2, 3][index];

    return Column(
      children: [
        _PodiumAvatar(index: index, badge: badge),
        const SizedBox(height: 5),
        SizedBox(
          width: 82,
          child: Text(user!['username'] ?? '—', textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        ),
        Text('${user!['score']}/${user!['attempted']}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
        const SizedBox(height: 4),
        Container(
          width: 82,
          height: h + 20,
          margin: const EdgeInsets.only(bottom: 0),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [color.withOpacity(0.2), color.withOpacity(0.04)],
            ),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
            border: Border(
              top: BorderSide(color: color.withOpacity(0.4), width: 1.5),
              left: BorderSide(color: color.withOpacity(0.4), width: 1.5),
              right: BorderSide(color: color.withOpacity(0.4), width: 1.5),
            ),
          ),
          child: Center(child: Text('$rankNum', style: GoogleFonts.spaceGrotesk(fontSize: 24, fontWeight: FontWeight.w800, color: color))),
        ),
      ],
    );
  }
}

class _PodiumAvatar extends StatefulWidget {
  final int index;
  final String badge;
  const _PodiumAvatar({required this.index, required this.badge});
  @override
  State<_PodiumAvatar> createState() => _PodiumAvatarState();
}

class _PodiumAvatarState extends State<_PodiumAvatar> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(seconds: 3))..repeat(reverse: true);
  }
  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) {
    bool isGold = widget.index == 0;
    final color = [const Color(0xFFFFB703), const Color(0xFF94A3B8), const Color(0xFFCD7F32)][widget.index];
    final bg = [const Color(0xFFFFF3CD), const Color(0xFFF1F5F9), const Color(0xFFFFF0E8)][widget.index];

    Widget content = Container(
      width: isGold ? 64 : 52, height: isGold ? 64 : 52,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: bg,
        border: Border.all(color: color, width: 3),
        boxShadow: [BoxShadow(color: isGold ? color.withOpacity(0.35) : Colors.black.withOpacity(0.08), blurRadius: isGold ? 24 : 16)],
      ),
      child: Center(child: Text(widget.badge, style: TextStyle(fontSize: isGold ? 24 : 18))),
    );

    if (isGold) {
      return AnimatedBuilder(
        animation: _ctrl,
        builder: (_, child) => Transform.translate(offset: Offset(0, -6 * _ctrl.value), child: child),
        child: content,
      );
    }
    return content;
  }
}

class _TableHeader extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      decoration: const BoxDecoration(
        gradient: LinearGradient(colors: [Color(0xFFFAF5FF), Color(0xFFFFF0F8)]),
        border: Border(bottom: BorderSide(color: Colors.black12, width: 1)),
      ),
      child: Row(
        children: const [
          SizedBox(width: 40, child: Text('RANK', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5, color: Colors.grey))),
          Expanded(child: Text('USER', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5, color: Colors.grey))),
          SizedBox(width: 80, child: Text('SCORE', textAlign: TextAlign.center, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5, color: Colors.grey))),
          SizedBox(width: 60, child: Text('TIME', textAlign: TextAlign.right, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5, color: Colors.grey))),
        ],
      ),
    );
  }
}

class _LeaderboardRow extends StatelessWidget {
  final int index;
  final Map<String, dynamic> user;
  const _LeaderboardRow({required this.index, required this.user});

  @override
  Widget build(BuildContext context) {
    final rank = index + 1;
    final isTop3 = index < 3;
    final rankColor = isTop3 ? [const Color(0xFFFFB703), const Color(0xFF94A3B8), const Color(0xFFCD7F32)][index] : const Color(0xFFF3F4F8);
    final rankBg = isTop3 ? [const Color(0xFFFFF3CD), const Color(0xFFF1F5F9), const Color(0xFFFFF0E8)][index] : const Color(0xFFF8F9FA);
    
    final score = (user['score'] as num?)?.toDouble() ?? 0;
    final att = (user['attempted'] as num?)?.toDouble() ?? 1;
    final ratio = score / att;
    final scoreColor = ratio >= 0.7 ? const Color(0xFF06D6A0) : ratio >= 0.4 ? const Color(0xFFFF9F1C) : const Color(0xFFFF6B9D);
    final scoreBg = ratio >= 0.7 ? const Color(0xFFEDFBF3) : ratio >= 0.4 ? const Color(0xFFFFFBE8) : const Color(0xFFFFF0F3);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.black.withOpacity(0.04))),
        gradient: isTop3 ? LinearGradient(colors: [rankColor.withOpacity(0.05), Colors.transparent]) : null,
      ),
      child: Row(
        children: [
          SizedBox(
            width: 40,
            child: Container(
              width: 32, height: 32,
              decoration: BoxDecoration(
                color: rankBg,
                shape: BoxShape.circle,
                border: Border.all(color: rankColor.withOpacity(0.4), width: 1.5),
              ),
              child: Center(child: Text('${index < 3 ? ['🥇', '🥈', '🥉'][index] : rank}', style: TextStyle(fontSize: index < 3 ? 12 : 11, fontWeight: FontWeight.bold))),
            ),
          ),
          Expanded(child: Text(user['username'] ?? '—', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13))),
          SizedBox(
            width: 80,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 4),
              decoration: BoxDecoration(color: scoreBg, borderRadius: BorderRadius.circular(8), border: Border.all(color: scoreColor.withOpacity(0.3))),
              child: Text('${user['score']} / ${user['attempted']}', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: scoreColor)),
            ),
          ),
          SizedBox(
            width: 60,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 4),
              decoration: BoxDecoration(color: const Color(0xFFF3F4F8), borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.black.withOpacity(0.06))),
              child: Text('${user['timeTaken']}s', textAlign: TextAlign.center, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.grey)),
            ),
          ),
        ],
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
  void initState() { super.initState(); _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1400))..repeat(reverse: true); }
  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (_, __) => Container(
        width: 7, height: 7,
        decoration: BoxDecoration(
          color: const Color(0xFFFF6B9D),
          shape: BoxShape.circle,
          boxShadow: [BoxShadow(color: const Color(0xFFFF6B9D).withOpacity(0.5 * _ctrl.value), blurRadius: 10 * _ctrl.value, spreadRadius: 5 * _ctrl.value)],
        ),
      ),
    );
  }
}
