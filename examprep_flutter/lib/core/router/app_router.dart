import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/login_screen.dart';
import '../../features/auth/register_screen.dart';
import '../../features/home/home_screen.dart';
import '../../features/home/subject_page.dart';
import '../../features/home/topic_page.dart';
import '../../features/mock_test/mock_test_screen.dart';
import '../../features/result/result_screen.dart';
import '../../features/group_exam/group_exam_list.dart';
import '../../features/group_exam/group_lobby.dart';
import '../../features/group_exam/leaderboard_screen.dart';
import '../../features/real_exam/real_exams_page.dart';
import '../../features/adaptive_learning/adaptive_learning_screen.dart';
import '../../features/planner/smart_study_planner.dart';
import '../../features/review/review_dashboard_screen.dart';
import '../../features/user/student_landing.dart';
import '../../features/user/exams_page.dart';
import '../../features/user/progress_page.dart';
import '../../features/user/history_page.dart';
import '../../features/user/assignment_list.dart';
import '../../features/user/engagement_analytics.dart';
import '../../features/user/wellbeing_page.dart';
import '../../features/user/recommendation_engine.dart';
import '../../features/user/settings_page.dart';
import '../../features/game/arcade_center.dart';
import '../../features/game/game_dashboard.dart';
import '../../features/game/snake_ladder_game.dart';
import '../../features/game/space_defender_game.dart';
import '../../features/game/heist_master_game.dart';
import '../../features/game/magic_potion_game.dart';
import '../../features/game/train_express_game.dart';
import '../../features/admin/admin_dashboard.dart';
import '../../features/admin/exam_manager.dart';
import '../../features/admin/subject_manager.dart';
import '../../features/admin/topic_manager.dart';
import '../../features/admin/question_manager.dart';
import '../../features/mock_test/blind_accessible_exam.dart';
import '../../features/ai_tutor/voice_ai_tutor.dart';
import '../../features/ai_tutor/ai_chatbot.dart';
import '../../features/splash/splash_screen.dart';
import '../api/dio_client.dart';
import '../providers/auth_provider.dart';

// ──────────────────────────────────────────────────────────────────────────────
// GoRouter — matches all React routes from UserRoutes.jsx + AdminRoutes.jsx
// ──────────────────────────────────────────────────────────────────────────────
final appRouterProvider = Provider<GoRouter>((ref) {
  final authAsync = ref.watch(authProvider);
  final auth = authAsync.valueOrNull;

  DioClient.onUnauthorized = () {
    ref.read(authProvider.notifier).logout();
  };

  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final isLoggedIn = auth?.isLoggedIn ?? false;
      final isAdmin = auth?.isAdmin ?? false;
      final path = state.matchedLocation;

      final publicPaths = ['/', '/splash', '/login', '/register', '/game', '/achievements', '/review'];
      final isPublic = publicPaths.contains(path) || path.startsWith('/blind-exam/');

      if (!isLoggedIn && !isPublic) return '/login';
      if (isLoggedIn && (path == '/login' || path == '/register')) {
        return isAdmin ? '/admin' : '/home';
      }
      if (path.startsWith('/admin') && !isAdmin) return '/home';

      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
      GoRoute(path: '/', builder: (_, __) => const StudentLanding()),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
      GoRoute(path: '/game', builder: (_, __) => const ArcadeCenter()),
      GoRoute(path: '/game/snake-ladder', builder: (context, __) => SnakeLadderGame(onBack: () => context.pop())),
      GoRoute(path: '/game/space-defender', builder: (context, __) => SpaceDefenderGame(onBack: () => context.pop())),
      GoRoute(path: '/game/heist-master', builder: (context, __) => HeistMasterGame(onBack: () => context.pop())),
      GoRoute(path: '/game/magic-potion', builder: (context, __) => MagicPotionGame(onBack: () => context.pop())),
      GoRoute(path: '/game/train-express', builder: (context, __) => TrainExpressGame(onBack: () => context.pop())),
      GoRoute(path: '/achievements', builder: (_, __) => const GameDashboard()),
      GoRoute(path: '/review', builder: (_, __) => const ReviewDashboardScreen()),
      
      // AI ASSISTANTS
      GoRoute(path: '/ai-tutor', builder: (_, __) => const VoiceAiTutor()),
      GoRoute(path: '/ai-chat', builder: (_, __) => const AiChatbot()),

      GoRoute(
        path: '/blind-exam/:topicId',
        builder: (_, state) => BlindAccessibleExam(
          topicId: state.pathParameters['topicId']!,
        ),
      ),

      GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
      GoRoute(
        path: '/exam/:examId',
        builder: (_, state) => SubjectPage(
          examId: state.pathParameters['examId']!,
        ),
      ),
      GoRoute(
        path: '/subject/:subjectId',
        builder: (_, state) => TopicPage(
          subjectId: state.pathParameters['subjectId']!,
        ),
      ),
      GoRoute(
        path: '/test/:topicId',
        builder: (_, state) => const MockTestScreen(mode: TestMode.solo),
      ),
      GoRoute(
        path: '/result',
        builder: (_, state) => ResultScreen(
          resultData: state.extra as Map<String, dynamic>?,
        ),
      ),
      GoRoute(path: '/progress', builder: (_, __) => const ProgressPage()),
      GoRoute(path: '/history', builder: (_, __) => const HistoryPage()),

      GoRoute(path: '/group-exams', builder: (_, __) => const GroupExamList()),
      GoRoute(
        path: '/group-exams/:id',
        builder: (_, state) =>
            GroupLobby(groupId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/group-exams/:id/start',
        builder: (_, state) => MockTestScreen(
          mode: TestMode.group,
          groupExamId: state.pathParameters['id'],
        ),
      ),
      GoRoute(
        path: '/group-exams/:id/leaderboard',
        builder: (_, state) =>
            LeaderboardScreen(groupId: state.pathParameters['id']!),
      ),

      GoRoute(path: '/real-exams', builder: (_, __) => const RealExamsPage()),
      GoRoute(
        path: '/real-exam/:examId',
        builder: (_, state) => RealExamPreviewPage(
          examId: state.pathParameters['examId']!,
        ),
      ),
      GoRoute(path: '/assignments', builder: (_, __) => const AssignmentList()),
      GoRoute(path: '/study_planner', builder: (_, __) => const SmartStudyPlanner()),
      GoRoute(path: '/adaptive-learning', builder: (_, __) => const AdaptiveLearningScreen()),
      GoRoute(path: '/wellbeing', builder: (_, __) => const WellbeingPage()),
      GoRoute(path: '/recommendations', builder: (_, __) => const RecommendationEngine()),
      GoRoute(path: '/analytics', builder: (_, __) => const EngagementAnalytics()),
      GoRoute(path: '/settings', builder: (_, __) => const SettingsPage()),

      // Admin Routes
      GoRoute(path: '/admin', builder: (_, __) => const AdminDashboard()),
      GoRoute(path: '/admin/exams', builder: (_, __) => const ExamManager()),
      GoRoute(path: '/admin/subjects', builder: (_, __) => const SubjectManager()),
      GoRoute(path: '/admin/topics', builder: (_, __) => const TopicManager()),
      GoRoute(path: '/admin/questions', builder: (_, __) => const QuestionManager()),
    ],
  );
});
