// All API endpoint strings — mirrors React's axios.js base + all call sites
class ApiEndpoints {
  static const String baseUrl = 'https://tangy-experts-serve.loca.lt/api';

  // ── Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';

  // ── Exam data (public catalog)
  static const String exams = '/exam-data/exams';
  static String subjects(String examId) => '/exam-data/subjects/$examId';
  static String topics(String subjectId) => '/exam-data/topics/$subjectId';

  // ── User test flow
  static String questions({required String topicId}) =>
      '/user/questions?topicId=$topicId';
  static String submitTest({required String topicId}) =>
      '/user/test/submit?topicId=$topicId';
  static const String attempts = '/user/test/attempts';

  // ── Adaptive learning (difficulty)
  static const String difficultyLogs = '/api/user/difficulty/logs';
  static const String difficultyOverride = '/api/user/difficulty/override';

  // ── Real exam
  static const String realExamStart = '/real-exam/start';
  static String realExamSubmit(String sessionId) =>
      '/real-exam/submit/$sessionId';

  // ── Group exam
  static const String myGroups = '/group-exam/my-groups';
  static const String createGroup = '/group-exam/create';
  static String joinGroup(String code) => '/group-exam/join/$code';
  static String groupExam(String id) => '/group-exam/$id';
  static String groupExamSubmit(String id) => '/group-exam/$id/submit';

  // ── AI
  static const String aiTeacherContext = '/user/ai/teacher-context';
  static const String aiTeacherCall = '/user/ai/teacher-call';

  // ── Behavioral analytics / proctoring
  static const String trackAttempt = '/user/behavioral/track';
  static const String realtimeAnalytics = '/user/behavioral/analytics';

  // ── Assignments
  static const String assignments = '/user/assignments';

  // ── Study planner
  static const String studyPlan = '/user/study-plan';

  // ── Settings / annotations
  static const String userSettings = '/user/settings';
  static const String annotations = '/user/annotations';

  // ── Real exam ranking
  static const String realExamRanking = '/real-exam-ranking';

  // ── Admin
  static const String adminExams = '/admin/exams';
  static const String adminSubjects = '/admin/subjects';
  static const String adminTopics = '/admin/topics';
  static const String adminQuestions = '/admin/questions';
  static const String adminStudentInsights = '/admin/student-insights';
  static const String adminNotifications = '/admin/notifications';
  static const String platformOverview = '/admin/platform-overview';
  static const String difficultyAnalyzer = '/admin/difficulty-analyzer';
  static const String aiGenerator = '/admin/ai-generate';
}
