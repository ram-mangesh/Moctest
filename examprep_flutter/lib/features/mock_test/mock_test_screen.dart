import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:examprep_app/core/api/dio_client.dart';
import 'package:examprep_app/core/theme/app_theme.dart';
import '../proctoring/anti_cheat_service.dart';
import '../proctoring/face_proctoring_widget.dart';
import 'test_header.dart';
import 'question_panel.dart';
import 'question_palette.dart';
import 'footer_controls.dart';
import 'scratch_pad.dart';
import 'nudge_toast.dart';

// ─────────────────────────────────────────────────────────────────────────────
// MockTest Screen — Full parity with MockTest.jsx
//
// Modes: SOLO | GROUP | REAL  (maps to React: mode="SOLO"/"GROUP"/"REAL")
// Features:
//  • Loads questions from API based on mode
//  • Timer countdown → auto-submit on time-up
//  • Answer tracking with trackAttempt API call
//  • Anti-cheat: AppLifecycleState.paused → violation
//  • Face proctoring widget overlaid
//  • Violation counter → auto-submit at MAX_VIOLATIONS (3)
//  • Scratch pad
//  • Question palette (answered/skipped/review states)
//  • Mark for review
//  • Submit by: user action | timer | violation limit
//  • Session ID strategy: solo/group = DateTime.now() | real = from backend
//  • localStorage session map for attempt→session lookup
// ─────────────────────────────────────────────────────────────────────────────

enum TestMode { solo, group, real }

const int kMaxViolations = 3; // mirrors MAX_VIOLATIONS = 3 in React
const String kSessionMapKey = 'ep_session_map';

// ── Question model
class Question {
  final int id;
  final String text;
  final String optionA, optionB, optionC, optionD;
  final String correct;
  final String? explanation;

  const Question({
    required this.id,
    required this.text,
    required this.optionA,
    required this.optionB,
    required this.optionC,
    required this.optionD,
    required this.correct,
    this.explanation,
  });

  factory Question.fromJson(Map<String, dynamic> j) {
    final opts = j['options'] as List?;
    return Question(
      id: (j['id'] as num).toInt(),
      text: j['question'] ?? j['text'] ?? '',
      optionA: opts != null && opts.length > 0 ? opts[0].toString() : (j['optionA'] ?? ''),
      optionB: opts != null && opts.length > 1 ? opts[1].toString() : (j['optionB'] ?? ''),
      optionC: opts != null && opts.length > 2 ? opts[2].toString() : (j['optionC'] ?? ''),
      optionD: opts != null && opts.length > 3 ? opts[3].toString() : (j['optionD'] ?? ''),
      correct: j['correct'] != null ? String.fromCharCode(65 + (j['correct'] as int)) : (j['correct'] ?? '').toString(),
      explanation: j['explanation'],
    );
  }

  List<(String, String)> get options => [
        ('A', optionA), ('B', optionB), ('C', optionC), ('D', optionD),
      ];
}

// ── Answer payload
class AnswerPayload {
  final String selected;
  final int timeSpent;
  final int optionChanges;

  const AnswerPayload({
    required this.selected,
    this.timeSpent = 0,
    this.optionChanges = 0,
  });

  Map<String, dynamic> toJson() => {
        'selected': selected,
        'timeSpent': timeSpent,
        'optionChanges': optionChanges,
      };
}

// ── Analytics nudge
class AnalyticsData {
  final List<String> nudges;
  const AnalyticsData({this.nudges = const []});
}

// ─────────────────────────────────────────────────────────────────────────────
// State model for MockTest
// ─────────────────────────────────────────────────────────────────────────────
class MockTestState {
  final List<Question> questions;
  final int currentQ;
  final Map<int, AnswerPayload> answers;
  final String examName;
  final int duration;      // seconds remaining
  final Set<int> review;   // question IDs marked for review
  final int violations;
  final int? sessionId;
  final bool loading;
  final bool submitted;
  final List<String> nudges;

  const MockTestState({
    this.questions = const [],
    this.currentQ = 0,
    this.answers = const {},
    this.examName = 'Mock Test',
    this.duration = 0,
    this.review = const {},
    this.violations = 0,
    this.sessionId,
    this.loading = true,
    this.submitted = false,
    this.nudges = const [],
  });

  MockTestState copyWith({
    List<Question>? questions,
    int? currentQ,
    Map<int, AnswerPayload>? answers,
    String? examName,
    int? duration,
    Set<int>? review,
    int? violations,
    int? sessionId,
    bool? loading,
    bool? submitted,
    List<String>? nudges,
  }) =>
      MockTestState(
        questions: questions ?? this.questions,
        currentQ: currentQ ?? this.currentQ,
        answers: answers ?? this.answers,
        examName: examName ?? this.examName,
        duration: duration ?? this.duration,
        review: review ?? this.review,
        violations: violations ?? this.violations,
        sessionId: sessionId ?? this.sessionId,
        loading: loading ?? this.loading,
        submitted: submitted ?? this.submitted,
        nudges: nudges ?? this.nudges,
      );
}

// ─────────────────────────────────────────────────────────────────────────────
// MockTest Notifier
// ─────────────────────────────────────────────────────────────────────────────
class MockTestNotifier extends StateNotifier<MockTestState> {
  final DioClient _api;
  final TestMode mode;
  final String? topicId;
  final String? examId;
  final String? groupExamId;
  final void Function(Map<String, dynamic>? result) onComplete;
  final void Function(String groupId) onGroupComplete;

  Timer? _timer;
  Timer? _analyticsTimer;
  int _questionStartTime = 0;
  int _optionChanges = 0;
  bool _submitting = false;

  MockTestNotifier({
    required DioClient api,
    required this.mode,
    required this.onComplete,
    required this.onGroupComplete,
    this.topicId,
    this.examId,
    this.groupExamId,
  })  : _api = api,
        super(const MockTestState()) {
    _loadQuestions();
  }

  // ── LOAD QUESTIONS (mirrors React useEffect loadQuestions)
  Future<void> _loadQuestions() async {
    try {
      if (mode == TestMode.real) {
        // REAL exam: POST /real-exam/start
        final res = await _api.post('/real-exam/start', data: {
          'examId': int.parse(examId!),
          'duration': 1800,
        });
        final data = res.data as Map<String, dynamic>;
        final questions = (data['questions'] as List)
            .map((q) => Question.fromJson(q as Map<String, dynamic>))
            .toList();
        final endTime = DateTime.parse(data['endTime'] as String);
        final duration = endTime.difference(DateTime.now()).inSeconds;
        final sessionId = data['sessionId'] as int;

        state = state.copyWith(
          questions: questions,
          duration: duration.clamp(0, 86400),
          sessionId: sessionId,
          loading: false,
        );
        _startTimer();
        _startAnalytics();
        return;
      }

      if (mode == TestMode.group) {
        // GROUP: fetch group then questions
        final g = await _api.get('/group-exam/$groupExamId');
        final tid = g.data['topicId'] as int;
        final res = await _api.get('/user/questions?topicId=$tid');
        final questions = (res.data as List)
            .map((q) => Question.fromJson(q as Map<String, dynamic>))
            .toList();
        final sessionId = DateTime.now().millisecondsSinceEpoch;

        state = state.copyWith(
          examName: 'Group Exam',
          questions: questions,
          duration: questions.length * 60,
          sessionId: sessionId,
          loading: false,
        );
        _startTimer();
        _startAnalytics();
        return;
      }

      // SOLO
      final res = await _api.get('/user/questions?topicId=$topicId');
      final questions = (res.data as List)
          .map((q) => Question.fromJson(q as Map<String, dynamic>))
          .toList();
      final sessionId = DateTime.now().millisecondsSinceEpoch;

      state = state.copyWith(
        questions: questions,
        duration: questions.length * 60,
        sessionId: sessionId,
        loading: false,
      );
      _startTimer();
      _startAnalytics();
    } catch (e) {
      state = state.copyWith(loading: false);
    }
  }

  // ── TIMER (counts down, auto-submits at 0)
  void _startTimer() {
    _questionStartTime = DateTime.now().millisecondsSinceEpoch;
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (state.duration <= 0) {
        handleSubmit();
        return;
      }
      state = state.copyWith(duration: state.duration - 1);
    });
  }

  // ── ANALYTICS POLLING (mirrors useRealtimeAnalytics)
  void _startAnalytics() {
    _analyticsTimer = Timer.periodic(const Duration(seconds: 15), (_) async {
      if (state.sessionId == null) return;
      try {
        final res = await _api.get(
          '/user/behavioral/analytics',
          queryParameters: {'sessionId': state.sessionId},
        );
        final nudges = ((res.data['nudges'] ?? []) as List)
            .map((n) => n.toString())
            .toList();
        state = state.copyWith(nudges: nudges);
      } catch (_) {}
    });
  }

  // ── ANSWER CHANGE (mirrors handleAnswerChange)
  void handleAnswerChange(int questionId, String selected) {
    final now = DateTime.now().millisecondsSinceEpoch;
    final timeSpent = ((now - _questionStartTime) / 1000).round();
    _questionStartTime = now;

    final prev = state.answers[questionId];
    if (prev != null) _optionChanges++;

    final payload = AnswerPayload(
      selected: selected,
      timeSpent: timeSpent,
      optionChanges: _optionChanges,
    );

    final newAnswers = Map<int, AnswerPayload>.from(state.answers);
    newAnswers[questionId] = payload;
    state = state.copyWith(answers: newAnswers);

    // Track attempt (fire and forget)
    _trackAttempt(questionId, payload);
    _optionChanges = 0;
  }

  // ── TRACK ATTEMPT (mirrors trackAttempt.jsx)
  Future<void> _trackAttempt(int questionId, AnswerPayload payload) async {
    if (state.sessionId == null) return;
    try {
      await _api.post('/user/behavioral/track', data: {
        'sessionId': state.sessionId,
        'questionId': questionId,
        'timeSpent': payload.timeSpent,
        'optionChanges': payload.optionChanges,
        'revisits': 0,
        'answeredCorrect': false,
        'timestamp': DateTime.now().millisecondsSinceEpoch,
      });
    } catch (_) {} // non-critical
  }

  // ── NAVIGATION
  void setCurrentQ(int q) => state = state.copyWith(currentQ: q);
  void nextQuestion() {
    if (state.currentQ < state.questions.length - 1) {
      state = state.copyWith(currentQ: state.currentQ + 1);
    }
  }
  void prevQuestion() {
    if (state.currentQ > 0) state = state.copyWith(currentQ: state.currentQ - 1);
  }

  // ── MARK FOR REVIEW
  void toggleReview(int questionId) {
    final newReview = Set<int>.from(state.review);
    if (newReview.contains(questionId)) {
      newReview.remove(questionId);
    } else {
      newReview.add(questionId);
    }
    state = state.copyWith(review: newReview);
  }

  // ── VIOLATION (mirrors registerViolation)
  Future<void> registerViolation(String reason) async {
    final next = state.violations + 1;
    state = state.copyWith(violations: next);
    if (next >= kMaxViolations) {
      // Auto-submit
      handleSubmit();
    }
  }

  // ── SUBMIT (mirrors handleSubmit — all 3 modes)
  Future<void> handleSubmit() async {
    if (_submitting || state.submitted) return;
    _submitting = true;
    _timer?.cancel();
    _analyticsTimer?.cancel();
    state = state.copyWith(submitted: true);

    final answersForApi = state.answers.map(
      (id, payload) => MapEntry(id.toString(), payload.toJson()),
    );

    try {
      if (mode == TestMode.real) {
        final res = await _api.post(
          '/real-exam/submit/${state.sessionId}',
          data: answersForApi,
        );
        onComplete(res.data as Map<String, dynamic>?);
        return;
      }

      if (mode == TestMode.group) {
        final score = _calculateCorrect();
        await _api.post('/group-exam/$groupExamId/submit', data: {
          'score': score,
          'attempted': state.answers.length,
          'timeTaken': state.questions.length * 60 - state.duration,
        });
        onGroupComplete(groupExamId!);
        return;
      }

      // SOLO
      final res = await _api.post(
        '/user/test/submit?topicId=$topicId',
        data: {'answers': answersForApi},
      );
      // Save session mapping (mirrors saveSessionMapping)
      final data = res.data as Map<String, dynamic>? ?? {};
      if (data['attemptId'] != null && state.sessionId != null) {
        await _saveSessionMapping(
          data['attemptId'].toString(),
          state.sessionId!,
        );
      }
      
      // Enrich with local state for review
      final finalData = {
        ...data,
        'score': data['score'] ?? ((data['correct'] ?? 0) * 100 / (data['total'] ?? 1)).round(),
        'questions': state.questions.map((q) => {
          'id': q.id,
          'question': q.text,
          'correctAnswer': q.correct,
          'selectedAnswer': state.answers[q.id]?.selected ?? '',
          'explanation': q.explanation,
        }).toList(),
      };
      onComplete(finalData);
    } catch (_) {
      _submitting = false;
      state = state.copyWith(submitted: false);
    }
  }

  int _calculateCorrect() {
    int correct = 0;
    for (final q in state.questions) {
      final ans = state.answers[q.id];
      if (ans != null && ans.selected == q.correct) correct++;
    }
    return correct;
  }

  // ── SESSION MAPPING (mirrors saveSessionMapping in React)
  Future<void> _saveSessionMapping(String attemptId, int sessionId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(kSessionMapKey) ?? '{}';
      // Simple key-value store
      final map = <String, String>{};
      // Parse simple JSON-like string
      final entries = raw
          .replaceAll('{', '')
          .replaceAll('}', '')
          .split(',')
          .where((s) => s.contains(':'));
      for (final e in entries) {
        final parts = e.split(':');
        if (parts.length == 2) {
          map[parts[0].trim().replaceAll('"', '')] =
              parts[1].trim().replaceAll('"', '');
        }
      }
      map[attemptId] = sessionId.toString();
      // Keep only last 50 entries
      if (map.length > 50) map.remove(map.keys.first);
      final jsonStr = '{${map.entries.map((e) => '"${e.key}":"${e.value}"').join(',')}}';
      await prefs.setString(kSessionMapKey, jsonStr);
    } catch (_) {}
  }

  @override
  void dispose() {
    _timer?.cancel();
    _analyticsTimer?.cancel();
    super.dispose();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MockTest Provider factory
// ─────────────────────────────────────────────────────────────────────────────
final mockTestProvider = StateNotifierProvider.autoDispose
    .family<MockTestNotifier, MockTestState, _MockTestParams>(
        (ref, params) {
  final api = ref.read(dioClientProvider);
  return MockTestNotifier(
    api: api,
    mode: params.mode,
    topicId: params.topicId,
    examId: params.examId,
    groupExamId: params.groupExamId,
    onComplete: params.onComplete,
    onGroupComplete: params.onGroupComplete,
  );
});

class _MockTestParams {
  final TestMode mode;
  final String? topicId, examId, groupExamId;
  final void Function(Map<String, dynamic>?) onComplete;
  final void Function(String) onGroupComplete;

  const _MockTestParams({
    required this.mode,
    this.topicId,
    this.examId,
    this.groupExamId,
    required this.onComplete,
    required this.onGroupComplete,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MockTest SCREEN
// ─────────────────────────────────────────────────────────────────────────────
class MockTestScreen extends ConsumerStatefulWidget {
  final TestMode mode;
  final String? examId;
  final String? topicId;
  final String? groupExamId;

  const MockTestScreen({
    super.key,
    this.mode = TestMode.solo,
    this.examId,
    this.topicId,
    this.groupExamId,
  });

  @override
  ConsumerState<MockTestScreen> createState() => _MockTestScreenState();
}

class _MockTestScreenState extends ConsumerState<MockTestScreen>
    with WidgetsBindingObserver {
  _MockTestParams? _params;
  bool _antiCheatSetup = false;

  @override
  void initState() {
    super.initState();
    // Enter fullscreen (mirrors enterFullscreen() in React useEffect)
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersive);

    // Register lifecycle observer for anti-cheat tab detection
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _params ??= _MockTestParams(
      mode: widget.mode,
      topicId: widget.topicId ?? GoRouterState.of(context).pathParameters['topicId'],
      examId: widget.examId ?? GoRouterState.of(context).pathParameters['examId'],
      groupExamId: widget.groupExamId,
      onComplete: (data) => context.go('/result', extra: data),
      onGroupComplete: (id) => context.go('/group-exams/$id/leaderboard'),
    );
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    super.dispose();
  }

  // ── AppLifecycle: detect app backgrounded (mirrors document.visibilityChange)
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.inactive) {
      if (_params != null) {
        ref.read(mockTestProvider(_params!).notifier).registerViolation(
              'App switched to background — possible tab switch',
            );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_params == null) return const Scaffold(backgroundColor: AppColors.background);
    final testState = ref.watch(mockTestProvider(_params!));
    final notifier = ref.read(mockTestProvider(_params!).notifier);

    if (testState.loading) {
      return const Scaffold(
        backgroundColor: AppColors.background,
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircularProgressIndicator(color: AppColors.primary),
              SizedBox(height: 16),
              Text('Loading questions…', style: TextStyle(color: AppColors.primary)),
            ],
          ),
        ),
      );
    }

    if (testState.questions.isEmpty) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('No questions found.'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => context.go('/home'),
                child: const Text('Go Home'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      body: Stack(
        children: [
          Column(
            children: [
              // ── Test Header (timer + exam name)
              TestHeader(
                examName: testState.examName,
                duration: testState.duration,
                onTimeUp: notifier.handleSubmit,
                analyticsNudges: testState.nudges,
              ),

              // ── Main body: Question + Scratch + Palette
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Question panel
                      Expanded(
                        flex: 5,
                        child: QuestionPanel(
                          question: testState.questions[testState.currentQ],
                          index: testState.currentQ,
                          answers: testState.answers,
                          onAnswerChange: (qId, selected) =>
                              notifier.handleAnswerChange(qId, selected),
                        ),
                      ),
                      const SizedBox(width: 12),
                      // Scratch pad
                      const Expanded(
                        flex: 2,
                        child: ScratchPad(),
                      ),
                      const SizedBox(width: 12),
                      // Question palette
                      SizedBox(
                        width: 220,
                        child: QuestionPalette(
                          questions: testState.questions,
                          currentQ: testState.currentQ,
                          answers: testState.answers,
                          review: testState.review,
                          onSelect: notifier.setCurrentQ,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // ── Footer controls
              FooterControls(
                currentQ: testState.currentQ,
                total: testState.questions.length,
                onPrev: notifier.prevQuestion,
                onNext: notifier.nextQuestion,
                isReview: testState.review
                    .contains(testState.questions[testState.currentQ].id),
                onToggleReview: () => notifier.toggleReview(
                    testState.questions[testState.currentQ].id),
                onSubmit: notifier.handleSubmit,
              ),
            ],
          ),

          // ── Face proctoring camera (overlaid, top-right)
          Positioned(
            top: 80,
            right: 16,
            child: FaceProctoringWidget(
              onViolation: (reason) => notifier.registerViolation(reason),
            ),
          ),

          // ── Violation counter (top-right below camera)
          Positioned(
            top: 210,
            right: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFFEE2E2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'Violations: ${testState.violations} / $kMaxViolations',
                style: const TextStyle(
                    color: Color(0xFFB91C1C), fontSize: 12, fontWeight: FontWeight.w700),
              ),
            ),
          ),

          // ── AI Nudge Toast
          if (testState.nudges.isNotEmpty)
            Positioned(
              top: 80,
              left: 16,
              child: NudgeToast(nudges: testState.nudges),
            ),
        ],
      ),
    );
  }
}
