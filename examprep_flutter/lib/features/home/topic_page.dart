import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:examprep_app/core/api/dio_client.dart';
import 'package:examprep_app/core/theme/app_theme.dart';
import 'package:examprep_app/shared/widgets/user_layout.dart';

class TopicPage extends ConsumerStatefulWidget {
  final String subjectId;
  const TopicPage({super.key, required this.subjectId});
  @override
  ConsumerState<TopicPage> createState() => _TopicPageState();
}

class _TopicPageState extends ConsumerState<TopicPage> {
  bool _loading = true;
  List<dynamic> _topics = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final api = ref.read(dioClientProvider);
    try {
      final res = await api.get('/exam-data/topics/${widget.subjectId}');
      if (mounted) {
        setState(() {
          _topics = res.data as List;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showVoiceConfirm(Map<String, dynamic> t) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Voice Exam: ${t['name']}',
            style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800)),
        content: Text(
          'Launch Voice-Accessible Exam?\n\n'
          '• Designed for visually impaired students.\n'
          '• Questions and options will be read aloud.\n'
          '• Answer by speaking the option letter (A, B, C or D).\n\n'
          'Make sure your volume is up.',
          style: GoogleFonts.plusJakartaSans(fontSize: 14),
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () {
              Navigator.pop(context);
              context.go('/blind-exam/${t['id']}');
            },
            child: const Text('Start Voice Exam'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return UserLayout(
      title: 'Topics',
      showBack: true,
      child: _loading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _topics.length,
              itemBuilder: (_, i) {
                final t = _topics[i] as Map<String, dynamic>;
                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                        color: AppColors.primary.withOpacity(0.14), width: 1.5),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          gradient: AppColors.primaryGradient,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Center(
                            child: Text('📝', style: TextStyle(fontSize: 20))),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(t['name'] ?? 'Topic',
                                  style: GoogleFonts.plusJakartaSans(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.inkDark)),
                              const Text('Choose your practice mode',
                                  style: TextStyle(
                                      fontSize: 12, color: Colors.grey)),
                            ]),
                      ),
                      Row(
                        children: [
                          _ActionBtn(
                            icon: Icons.play_arrow_rounded,
                            label: 'Start',
                            btnColor: AppColors.primary,
                            onTap: () => context.go('/test/${t['id']}'),
                          ),
                          const SizedBox(width: 8),
                          _ActionBtn(
                            icon: Icons.mic_rounded,
                            label: 'Voice',
                            btnColor: Colors.indigo,
                            onTap: () => _showVoiceConfirm(t),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}

class _ActionBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color btnColor;
  final VoidCallback onTap;

  const _ActionBtn(
      {required this.icon,
      required this.label,
      required this.btnColor,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: btnColor.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: btnColor.withOpacity(0.2)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: btnColor),
            const SizedBox(width: 4),
            Text(label,
                style: GoogleFonts.plusJakartaSans(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: btnColor)),
          ],
        ),
      ),
    );
  }
}
