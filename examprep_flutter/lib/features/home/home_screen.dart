import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:examprep_app/core/api/dio_client.dart';
import 'package:examprep_app/core/theme/app_theme.dart';
import 'package:examprep_app/shared/widgets/user_layout.dart';
import 'package:examprep_app/shared/widgets/glass_card.dart';

// ── Home Screen — mirrors Home.jsx
// Shows: exam list cards → navigate to /exam/:examId
class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});
  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  bool _loading = true;
  List<dynamic> _exams = [];
  String _userName = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final api = ref.read(dioClientProvider);
    final name = await AuthStorage.getName() ?? 'Student';
    try {
      final res = await api.get('/exam-data/exams');
      if (mounted) setState(() { _exams = res.data as List; _userName = name; _loading = false; });
    } catch (_) {
      if (mounted) setState(() { _userName = name; _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return UserLayout(
      title: 'Home',
      child: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                // Welcome
                RichText(text: TextSpan(
                  style: GoogleFonts.plusJakartaSans(fontSize: 26, fontWeight: FontWeight.w900, color: AppColors.inkDark),
                  children: [const TextSpan(text: 'Hello, '),
                    TextSpan(text: '$_userName! 👋', style: const TextStyle(color: AppColors.primary))],
                )),
                const SizedBox(height: 4),
                Text('Pick an exam to practice today',
                    style: GoogleFonts.plusJakartaSans(fontSize: 14, color: AppColors.inkMuted)),
                const SizedBox(height: 24),

                // Quick links
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(children: [
                    _QuickLink('📈', 'Progress', '/progress'),
                    _QuickLink('📚', 'History', '/history'),
                    _QuickLink('🎯', 'Goals', '/adaptive-learning'),
                     _QuickLink('💡', 'AI Chat', '/ai-chat'),
                     _QuickLink('🧑‍🏫', 'AI Teacher', '/ai-tutor'),
                     _QuickLink('🎮', 'Games', '/game'),
                    _QuickLink('👥', 'Group', '/group-exams'),
                  ]),
                ),
                const SizedBox(height: 28),

                Text('Available Exams',
                    style: GoogleFonts.plusJakartaSans(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.inkDark)),
                const SizedBox(height: 14),

                _exams.isEmpty
                    ? const Center(child: Text('No exams available'))
                    : GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: MediaQuery.of(context).size.width > 800 ? 3 : 2,
                          childAspectRatio: 1.4,
                          crossAxisSpacing: 14, mainAxisSpacing: 14,
                        ),
                        itemCount: _exams.length,
                        itemBuilder: (_, i) => _ExamCard(
                          exam: _exams[i] as Map<String, dynamic>,
                          onTap: () => context.go('/exam/${_exams[i]['id']}'),
                        ),
                      ),
              ]),
            ),
    );
  }
}

class _QuickLink extends StatelessWidget {
  final String icon, label, route;
  const _QuickLink(this.icon, this.label, this.route);
  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: () => context.go(route),
        child: Container(
          margin: const EdgeInsets.only(right: 10),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.primary.withOpacity(0.15), width: 1.5),
            boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.06), blurRadius: 12)],
          ),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            Text(icon, style: const TextStyle(fontSize: 16)),
            const SizedBox(width: 6),
            Text(label, style: GoogleFonts.plusJakartaSans(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.inkDark)),
          ]),
        ),
      );
}

class _ExamCard extends StatelessWidget {
  final Map<String, dynamic> exam;
  final VoidCallback onTap;
  const _ExamCard({required this.exam, required this.onTap});

  static const _gradients = [
    [Color(0xFF6366F1), Color(0xFF8B5CF6)],
    [Color(0xFF0891B2), Color(0xFF06B6D4)],
    [Color(0xFF7C3AED), Color(0xFFEC4899)],
    [Color(0xFF059669), Color(0xFF10B981)],
    [Color(0xFFD97706), Color(0xFFF59E0B)],
    [Color(0xFFDC2626), Color(0xFFEF4444)],
  ];

  @override
  Widget build(BuildContext context) {
    final idx = (exam['id'] as int? ?? 0) % _gradients.length;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: _gradients[idx],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(18),
          boxShadow: [BoxShadow(color: _gradients[idx][0].withOpacity(0.3), blurRadius: 16, offset: const Offset(0, 6))],
        ),
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('📚', style: TextStyle(fontSize: 28)),
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(exam['name'] ?? 'Exam', style: GoogleFonts.plusJakartaSans(
                  fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white)),
              if (exam['description'] != null)
                Text(exam['description'] as String, maxLines: 1, overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.plusJakartaSans(fontSize: 11, color: Colors.white.withOpacity(0.75))),
            ]),
          ],
        ),
      ),
    );
  }
}
