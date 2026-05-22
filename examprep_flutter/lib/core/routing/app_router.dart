import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/admin/admin_dashboard.dart';
import '../../features/admin/teacher_ai_generator.dart';
import '../../features/admin/teacher_annotation_panel.dart';
import '../../features/admin/student_insights.dart';
import '../../features/admin/difficulty_analyzer.dart';
import '../../features/admin/notification_manager.dart';
import '../../features/user/student_landing.dart';
import '../../features/user/exams_page.dart';
import '../../features/exam/mock_test_screen.dart';
import '../../features/game/game_dashboard.dart';
import '../../features/game/arcade_center.dart';
import '../../features/user/assignment_list.dart';
import '../../features/user/result_page.dart';

final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const StudentLanding(),
    ),
    GoRoute(
      path: '/exams',
      builder: (context, state) => const ExamsPage(),
    ),
    GoRoute(
      path: '/exam/:topicId',
      builder: (context, state) => MockTestScreen(topicId: state.pathParameters['topicId']!),
    ),
    GoRoute(
      path: '/result',
      builder: (context, state) => ResultPage(data: state.extra as Map<String, dynamic>),
    ),
    GoRoute(
      path: '/assignments',
      builder: (context, state) => const AssignmentList(),
    ),
    GoRoute(
      path: '/arcade',
      builder: (context, state) => const ArcadeCenter(),
    ),
    GoRoute(
      path: '/achievements',
      builder: (context, state) => const GameDashboard(),
    ),
    
    // ADMIN ROUTES
    GoRoute(
      path: '/admin',
      builder: (context, state) => const AdminDashboard(),
    ),
    GoRoute(
      path: '/admin/ai-generator',
      builder: (context, state) => const TeacherAiGenerator(),
    ),
    GoRoute(
      path: '/admin/student-insights',
      builder: (context, state) => const StudentInsights(),
    ),
    GoRoute(
      path: '/admin/difficulty-analyzer',
      builder: (context, state) => const DifficultyAnalyzer(),
    ),
    GoRoute(
      path: '/admin/notifications',
      builder: (context, state) => const NotificationManager(),
    ),
    GoRoute(
      path: '/admin/annotations',
      builder: (context, state) => const TeacherAnnotationPanel(),
    ),
  ],
);
