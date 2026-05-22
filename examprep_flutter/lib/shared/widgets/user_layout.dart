import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:examprep_app/core/theme/app_theme.dart';
import 'package:examprep_app/core/providers/auth_provider.dart';

class UserLayout extends ConsumerWidget {
  final Widget child;
  final String title;
  final bool showBack;

  const UserLayout({super.key, required this.child, required this.title, this.showBack = false});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final path = GoRouterState.of(context).matchedLocation;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      drawer: _Sidebar(currentPath: path),
      appBar: AppBar(
        leading: showBack ? IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()) : null,
        title: Text(title, style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800, fontSize: 18)),
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: AppColors.inkDark,
        centerTitle: false,
        actions: [
          IconButton(onPressed: () => context.go('/settings'), icon: const Icon(LucideIcons.settings, size: 20)),
          const SizedBox(width: 8),
          PopupMenuButton<String>(
            onSelected: (val) {
              if (val == 'logout') {
                ref.read(authProvider.notifier).logout();
                context.go('/login');
              }
            },
            offset: const Offset(0, 40),
            child: const CircleAvatar(radius: 16, backgroundColor: AppColors.primary, child: Text("S", style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold))),
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'logout',
                child: Row(children: [Icon(Icons.logout, size: 18), SizedBox(width: 8), Text('Logout')]),
              ),
            ],
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: child,
      floatingActionButton: path != '/ai-chat' ? FloatingActionButton(
        onPressed: () => context.go('/ai-chat'),
        backgroundColor: AppColors.primary,
        child: const Text("🤖", style: TextStyle(fontSize: 24)),
      ) : null,
    );
  }
}

class _Sidebar extends StatelessWidget {
  final String currentPath;
  const _Sidebar({required this.currentPath});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: Container(
        color: Colors.white,
        child: Column(
          children: [
            _buildHeader(),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 20),
                children: [
                  _NavItem(icon: LucideIcons.home, label: "Home", route: "/home", active: currentPath == "/home"),
                  _NavItem(icon: LucideIcons.bookOpen, label: "Exams", route: "/home", active: currentPath.startsWith("/exam")),
                  _NavItem(icon: LucideIcons.history, label: "History", route: "/history", active: currentPath == "/history"),
                  _NavItem(icon: LucideIcons.trendingUp, label: "Progress", route: "/progress", active: currentPath == "/progress"),
                  const Divider(height: 32),
                  const _NavLabel(label: "SMART TOOLS"),
                  _NavItem(icon: LucideIcons.layout, label: "Assignments", route: "/assignments", active: currentPath == "/assignments"),
                  _NavItem(icon: LucideIcons.calendar, label: "Study Planner", route: "/study_planner", active: currentPath == "/study_planner"),
                  _NavItem(icon: LucideIcons.zap, label: "Adaptive Learning", route: "/adaptive-learning", active: currentPath == "/adaptive-learning"),
                  _NavItem(icon: LucideIcons.refreshCcw, label: "Spaced Review", route: "/review", active: currentPath == "/review"),
                  const Divider(height: 32),
                  const _NavLabel(label: "WELLBEING & RECOMMENDATIONS"),
                  _NavItem(icon: LucideIcons.heart, label: "Wellbeing Center", route: "/wellbeing", active: currentPath == "/wellbeing"),
                  _NavItem(icon: LucideIcons.sparkles, label: "AI Recommendations", route: "/recommendations", active: currentPath == "/recommendations"),
                  _NavItem(icon: LucideIcons.barChart2, label: "Engagement Hub", route: "/analytics", active: currentPath == "/analytics"),
                  const Divider(height: 32),
                  const _NavLabel(label: "AI ASSISTANTS"),
                  _NavItem(icon: LucideIcons.phoneCall, label: "AI Personal Teacher", route: "/ai-tutor", active: currentPath == "/ai-tutor"),
                  _NavItem(icon: LucideIcons.messageSquare, label: "AI Study Chatbot", route: "/ai-chat", active: currentPath == "/ai-chat"),
                  const Divider(height: 32),
                  const _NavLabel(label: "SOCIAL & FUN"),
                  _NavItem(icon: LucideIcons.users, label: "Group Exams", route: "/group-exams", active: currentPath.startsWith("/group-exams")),
                  _NavItem(icon: LucideIcons.trophy, label: "Achievements", route: "/achievements", active: currentPath == "/achievements"),
                  _NavItem(icon: LucideIcons.gamepad2, label: "Arcade Games", route: "/game", active: currentPath == "/game"),
                ],
              ),
            ),
            _buildLogout(context),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 60, 24, 24),
      decoration: const BoxDecoration(
        gradient: LinearGradient(colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)], begin: Alignment.topLeft, end: Alignment.bottomRight),
      ),
      child: Row(
        children: [
          Container(width: 40, height: 40, decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(12)), child: const Center(child: Text("🎓", style: TextStyle(fontSize: 20)))),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("ExamPrep", style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w900, color: Colors.white, fontSize: 18)),
              Text("Student Portal", style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 11, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLogout(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: Color(0xFFF1F5F9))),
      ),
      child: _NavItem(icon: LucideIcons.logOut, label: "Logout", route: "/login", active: false, color: Colors.red),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label, route;
  final bool active;
  final Color? color;

  const _NavItem({required this.icon, required this.label, required this.route, required this.active, this.color});

  @override
  Widget build(BuildContext context) {
    final c = color ?? (active ? AppColors.primary : AppColors.inkMuted);
    return InkWell(
      onTap: () {
        Navigator.pop(context); // Close drawer
        context.go(route);
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 4),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: active ? AppColors.primary.withOpacity(0.08) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(icon, size: 20, color: c),
            const SizedBox(width: 12),
            Text(label, style: GoogleFonts.plusJakartaSans(fontSize: 14, fontWeight: active ? FontWeight.bold : FontWeight.w600, color: c)),
            if (active) ...[const Spacer(), Container(width: 6, height: 6, decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle))],
          ],
        ),
      ),
    );
  }
}

class _NavLabel extends StatelessWidget {
  final String label;
  const _NavLabel({required this.label});
  @override
  Widget build(BuildContext context) => Padding(padding: const EdgeInsets.fromLTRB(12, 8, 12, 12), child: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.grey.shade400, letterSpacing: 1.2)));
}
