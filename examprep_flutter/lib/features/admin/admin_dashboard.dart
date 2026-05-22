import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import 'package:examprep_app/core/providers/auth_provider.dart';
import 'package:examprep_app/core/theme/app_theme.dart';
import 'exam_manager.dart';
import 'subject_manager.dart';
import 'topic_manager.dart';
import 'question_manager.dart';
import 'teacher_ai_generator.dart';
import 'teacher_annotation_panel.dart';
import 'student_insights.dart';
import 'platform_overview.dart';
import 'difficulty_analyzer.dart';
import 'notification_manager.dart';

// ── AdminDashboard — Full parity with AdminDashboard.jsx
class AdminDashboard extends ConsumerStatefulWidget {
  const AdminDashboard({super.key});

  @override
  ConsumerState<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends ConsumerState<AdminDashboard> {
  String _activeTab = 'overview';
  String _searchQuery = '';

  final List<AdminTabItem> _tabs = [
    AdminTabItem(id: 'exam', icon: '📋', label: 'Exam Manager', color: Color(0xFF2563EB)),
    AdminTabItem(id: 'subject', icon: '📚', label: 'Subject Manager', color: Color(0xFF7C3AED)),
    AdminTabItem(id: 'topic', icon: '🏷️', label: 'Topic Manager', color: Color(0xFF0D9488)),
    AdminTabItem(id: 'question', icon: '❓', label: 'Question Manager', color: Color(0xFFD97706)),
    AdminTabItem(id: 'ai', icon: '🤖', label: 'AI Generator', color: Color(0xFF059669), isAi: true),
    AdminTabItem(id: 'annotations', icon: '✏️', label: 'Annotations', color: Color(0xFF0891B2)),
    AdminTabItem(id: 'students', icon: '👨‍🎓', label: 'Student Insights', color: Color(0xFFDC2626)),
    AdminTabItem(id: 'overview', icon: '📊', label: 'Platform Overview', color: Color(0xFF6366F1)),
    AdminTabItem(id: 'difficulty', icon: '🎯', label: 'Difficulty Analyzer', color: Color(0xFFEA580C)),
    AdminTabItem(id: 'notifications', icon: '🔔', label: 'Alert Center', color: Color(0xFF8B5CF6)),
  ];

  @override
  Widget build(BuildContext context) {
    final activeTabItem = _tabs.firstWhere((t) => t.id == _activeTab);
    
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      drawer: _AdminDrawer(
        tabs: _tabs,
        activeTab: _activeTab,
        onTabSelected: (id) => setState(() => _activeTab = id),
      ),
      appBar: _AdminAppBar(
        activeTab: activeTabItem,
        onSearch: (q) => setState(() => _searchQuery = q),
      ),
      body: Stack(
        children: [
          // Background particles/orbs proxy
          Positioned.fill(child: _AdminBackground()),
          
          // Main Content
          SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Center(
              child: Container(
                constraints: const BoxConstraints(maxWidth: 1100),
                child: _buildActiveManager(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActiveManager() {
    switch (_activeTab) {
      case 'exam': return const ExamManager();
      case 'subject': return const SubjectManager();
      case 'topic': return const TopicManager();
      case 'question': return const QuestionManager();
      case 'ai': return const TeacherAiGenerator();
      case 'annotations': return const TeacherAnnotationPanel();
      case 'students': return const StudentInsights();
      case 'overview': return const PlatformOverview();
      case 'difficulty': return const DifficultyAnalyzer();
      case 'notifications': return const NotificationManager();
      default: return const PlatformOverview();
    }
  }
}

class AdminTabItem {
  final String id, icon, label;
  final Color color;
  final bool isAi;
  AdminTabItem({required this.id, required this.icon, required this.label, required this.color, this.isAi = false});
}

class _AdminAppBar extends StatelessWidget implements PreferredSizeWidget {
  final AdminTabItem activeTab;
  final ValueChanged<String> onSearch;

  const _AdminAppBar({required this.activeTab, required this.onSearch});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.98),
        border: Border(bottom: BorderSide(color: const Color(0xFF2563EB).withOpacity(0.08), width: 1.5)),
        boxShadow: [BoxShadow(color: const Color(0xFF2563EB).withOpacity(0.08), blurRadius: 32, offset: const Offset(0, 4))],
      ),
      child: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        titleSpacing: 0,
        leading: Builder(builder: (context) => IconButton(
          icon: const Icon(Icons.menu, color: Color(0xFF2563EB)),
          onPressed: () => Scaffold.of(context).openDrawer(),
        )),
        title: Row(
          children: [
            // Breadcrumb
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: activeTab.color.withOpacity(0.09),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: activeTab.color.withOpacity(0.2), width: 1.5),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('Admin', style: TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold)),
                  const Padding(padding: EdgeInsets.symmetric(horizontal: 4), child: Text('/', style: TextStyle(color: Colors.grey))),
                  Text(activeTab.icon, style: const TextStyle(fontSize: 16)),
                  const SizedBox(width: 4),
                  Text(activeTab.label, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: activeTab.color)),
                ],
              ),
            ),
          const SizedBox(width: 12),
          Expanded(
            child: Container(
              constraints: const BoxConstraints(maxWidth: 300),
              height: 40,
              decoration: BoxDecoration(
                color: const Color(0xFF2563EB).withOpacity(0.05),
                border: Border.all(color: const Color(0xFF2563EB).withOpacity(0.13), width: 1.5),
                borderRadius: BorderRadius.circular(11),
              ),
                child: TextField(
                  onChanged: onSearch,
                  style: const TextStyle(fontSize: 13),
                  decoration: InputDecoration(
                    hintText: 'Search pages…',
                    hintStyle: TextStyle(color: const Color(0xFF2563EB).withOpacity(0.36)),
                    prefixIcon: const Icon(Icons.search, size: 18, color: Colors.grey),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                ),
              ),
            ),
          ],
        ),
        actions: [
          _LiveBadge(),
          const SizedBox(width: 12),
          const Icon(Icons.notifications_none, color: Color(0xFF2563EB)),
          const SizedBox(width: 12),
          Consumer(builder: (context, ref, child) {
            return PopupMenuButton<String>(
              onSelected: (val) {
                if (val == 'logout') {
                  ref.read(authProvider.notifier).logout();
                  context.go('/login');
                }
              },
              offset: const Offset(0, 40),
              child: const CircleAvatar(radius: 16, backgroundColor: Colors.blue, child: Text('A', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold))),
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'logout',
                  child: Row(children: [Icon(Icons.logout, size: 18), SizedBox(width: 8), Text('Logout')]),
                ),
              ],
            );
          }),
          const SizedBox(width: 16),
        ],
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(64);
}

class _AdminDrawer extends StatelessWidget {
  final List<AdminTabItem> tabs;
  final String activeTab;
  final ValueChanged<String> onTabSelected;

  const _AdminDrawer({required this.tabs, required this.activeTab, required this.onTabSelected});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      width: 264,
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.fromLTRB(20, 40, 20, 20),
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: const Color(0xFF2563EB).withOpacity(0.08), width: 1.5)),
            ),
            child: Row(
              children: [
                Container(
                  width: 36, height: 36,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFF2563EB), Color(0xFF0D9488)]),
                    borderRadius: BorderRadius.circular(11),
                  ),
                  child: const Center(child: Text('🎓', style: TextStyle(fontSize: 19))),
                ),
                const SizedBox(width: 11),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('ExamPrep', style: GoogleFonts.sora(fontSize: 14, fontWeight: FontWeight.w800, color: const Color(0xFF2563EB))),
                    const Text('ADMIN PANEL', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, letterSpacing: 2, color: Colors.grey)),
                  ],
                ),
              ],
            ),
          ),
          // Nav
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(8),
              children: [
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  child: Text('NAVIGATION', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 1.5, color: Colors.grey)),
                ),
                ...tabs.map((tab) => _DrawerItem(
                  tab: tab,
                  isActive: activeTab == tab.id,
                  onTap: () {
                    onTabSelected(tab.id);
                    Navigator.pop(context);
                  },
                )),
              ],
            ),
          ),
          // Footer
          const _AdminUserFooter(),
        ],
      ),
    );
  }
}

class _DrawerItem extends StatelessWidget {
  final AdminTabItem tab;
  final bool isActive;
  final VoidCallback onTap;

  const _DrawerItem({required this.tab, required this.isActive, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 2, horizontal: 4),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: isActive ? tab.color.withOpacity(0.09) : Colors.transparent,
          borderRadius: BorderRadius.circular(13),
          border: Border.all(color: isActive ? tab.color.withOpacity(0.22) : Colors.transparent, width: 1.5),
        ),
        child: Row(
          children: [
            Container(
              width: 31, height: 31,
              decoration: BoxDecoration(color: isActive ? tab.color.withOpacity(0.14) : Colors.black.withOpacity(0.05), borderRadius: BorderRadius.circular(9)),
              child: Center(child: Text(tab.icon, style: const TextStyle(fontSize: 16))),
            ),
            const SizedBox(width: 11),
            Text(tab.label, style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: isActive ? tab.color : Colors.grey)),
            if (tab.isAi) ...[
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFF059669), Color(0xFF0891B2)]), borderRadius: BorderRadius.circular(20)),
                child: const Text('AI', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white)),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _AdminUserFooter extends StatelessWidget {
  const _AdminUserFooter();
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(border: Border(top: BorderSide(color: const Color(0xFF2563EB).withOpacity(0.09)))),
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: const Color(0xFF2563EB).withOpacity(0.06),
          borderRadius: BorderRadius.circular(13),
          border: Border.all(color: const Color(0xFF2563EB).withOpacity(0.11)),
        ),
        child: Row(
          children: [
            const CircleAvatar(backgroundColor: Colors.blue, child: Text('A', style: TextStyle(color: Colors.white))),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text('Admin', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5)),
                  Text('Super Admin', style: TextStyle(fontSize: 10, color: Colors.blue)),
                ],
              ),
            ),
            const _OnlineDot(),
          ],
        ),
      ),
    );
  }
}

class _LiveBadge extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFF10B981).withOpacity(0.09),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF10B981).withOpacity(0.22), width: 1.5),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _OnlineDot(),
          const SizedBox(width: 6),
          const Text('LIVE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF059669))),
        ],
      ),
    );
  }
}

class _OnlineDot extends StatefulWidget {
  const _OnlineDot();
  @override
  State<_OnlineDot> createState() => _OnlineDotState();
}

class _OnlineDotState extends State<_OnlineDot> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  @override
  void initState() { super.initState(); _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1600))..repeat(reverse: true); }
  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (_, __) => Container(
        width: 7, height: 7,
        decoration: BoxDecoration(
          color: const Color(0xFF10B981),
          shape: BoxShape.circle,
          boxShadow: [BoxShadow(color: const Color(0xFF10B981).withOpacity(0.5 * _ctrl.value), blurRadius: 10 * _ctrl.value, spreadRadius: 4 * _ctrl.value)],
        ),
      ),
    );
  }
}

class _AdminBackground extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFFF8FAFC), Color(0xFFEFF6FF), Color(0xFFF0FDFA), Color(0xFFF8FAFC)],
          stops: [0.0, 0.3, 0.6, 1.0],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Opacity(
        opacity: 0.05,
        child: CustomPaint(
          painter: _GridPainter(),
        ),
      ),
    );
  }
}

class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = const Color(0xFF2563EB)..strokeWidth = 1;
    for (double i = 0; i < size.width; i += 60) {
      canvas.drawLine(Offset(i, 0), Offset(i, size.height), paint);
    }
    for (double i = 0; i < size.height; i += 60) {
      canvas.drawLine(Offset(0, i), Offset(size.width, i), paint);
    }
  }
  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
