import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:examprep_app/core/api/dio_client.dart';
import 'package:camera/camera.dart';
import 'package:examprep_app/core/services/face_proctoring_service.dart';
import 'widgets/test_header.dart';
import 'widgets/question_panel.dart';
import 'widgets/question_palette.dart';
import 'widgets/footer_controls.dart';
import 'widgets/scratch_pad.dart';

final testStateProvider = StateProvider.autoDispose<TestSessionState?>((ref) => null);

class TestSessionState {
  final List<dynamic> questions;
  int currentQIndex;
  Map<int, dynamic> answers;
  Set<int> review;
  int violations;
  int secondsRemaining;
  final int totalSeconds;

  TestSessionState({
    required this.questions,
    this.currentQIndex = 0,
    this.answers = const {},
    this.review = const {},
    this.violations = 0,
    required this.secondsRemaining,
    required this.totalSeconds,
  });

  TestSessionState copyWith({
    int? currentQIndex,
    Map<int, dynamic>? answers,
    Set<int>? review,
    int? violations,
    int? secondsRemaining,
  }) {
    return TestSessionState(
      questions: questions,
      currentQIndex: currentQIndex ?? this.currentQIndex,
      answers: answers ?? this.answers,
      review: review ?? this.review,
      violations: violations ?? this.violations,
      secondsRemaining: secondsRemaining ?? this.secondsRemaining,
      totalSeconds: totalSeconds,
    );
  }
}

class MockTestScreen extends ConsumerStatefulWidget {
  final String topicId;
  final String mode;
  const MockTestScreen({super.key, required this.topicId, this.mode = "SOLO"});

  @override
  ConsumerState<MockTestScreen> createState() => _MockTestScreenState();
}

class _MockTestScreenState extends ConsumerState<MockTestScreen> with WidgetsBindingObserver {
  Timer? _timer;
  bool _submitted = false;
  final _faceProctoring = FaceProctoringService();
  CameraController? _cameraController;
  bool _isProctoringActive = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadQuestions();
    _enterFullscreen();
    _initCamera();
  }

  Future<void> _initCamera() async {
    try {
      final cameras = await availableCameras();
      final frontCamera = cameras.firstWhere((c) => c.lensDirection == CameraLensDirection.front);
      _cameraController = CameraController(frontCamera, ResolutionPreset.low, enableAudio: false);
      await _cameraController!.initialize();
      if (mounted) {
        setState(() => _isProctoringActive = true);
        _cameraController!.startImageStream((image) {
          _faceProctoring.processImage(image, frontCamera.sensorOrientation, (violation) {
            _registerViolation(violation);
          });
        });
      }
    } catch (_) {}
  }

  void _enterFullscreen() {
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
  }

  Future<void> _loadQuestions() async {
    try {
      final res = await ref.read(dioClientProvider).get('/user/questions?topicId=${widget.topicId}');
      final qs = res.data as List;
      final duration = qs.length * 60;
      ref.read(testStateProvider.notifier).state = TestSessionState(
        questions: qs,
        secondsRemaining: duration,
        totalSeconds: duration,
      );
      _startTimer();
    } catch (_) {
      if (mounted) context.pop();
    }
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      final state = ref.read(testStateProvider);
      if (state != null && state.secondsRemaining > 0) {
        ref.read(testStateProvider.notifier).state = state.copyWith(secondsRemaining: state.secondsRemaining - 1);
      } else if (state != null && state.secondsRemaining <= 0) {
        _submit();
      }
    });
  }

  Future<void> _submit() async {
    if (_submitted) return;
    _submitted = true;
    _timer?.cancel();
    final state = ref.read(testStateProvider);
    if (state == null) return;

    try {
      final res = await ref.read(dioClientProvider).post('/user/test/submit?topicId=${widget.topicId}', data: {'answers': state.answers});
      if (mounted) context.pushReplacement('/result', extra: res.data);
    } catch (_) {
      _submitted = false;
    }
  }

  void _registerViolation(String reason) {
    final state = ref.read(testStateProvider);
    if (state == null) return;
    final next = state.violations + 1;
    ref.read(testStateProvider.notifier).state = state.copyWith(violations: next);

    if (next >= 3) {
      _submit();
      _showViolationAlert('Too many violations. Auto-submitting test.');
    } else {
      _showViolationAlert('Warning ($next/3): $reason');
    }
  }

  void _showViolationAlert(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg), backgroundColor: Colors.red, behavior: SnackBarBehavior.floating));
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.inactive || state == AppLifecycleState.paused) {
      _registerViolation('Test window lost focus.');
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _cameraController?.dispose();
    _faceProctoring.dispose();
    _timer?.cancel();
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(testStateProvider);
    if (state == null) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    return SplitScreenDetector(
      onViolation: (reason) => _registerViolation(reason),
      onSplitActive: (active) => debugPrint('Split screen active: $active'),
      child: CallbackShortcuts(
        bindings: {
          const SingleActivator(LogicalKeyboardKey.keyC, control: true): () => _registerViolation('Copy attempt'),
          const SingleActivator(LogicalKeyboardKey.keyV, control: true): () => _registerViolation('Paste attempt'),
        },
        child: Focus(
          autofocus: true,
          child: Scaffold(
            backgroundColor: const Color(0xFFF1F5F9),
            body: Column(
              children: [
                TestHeader(
                  secondsRemaining: state.secondsRemaining,
                  totalSeconds: state.totalSeconds,
                  violations: state.violations,
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          flex: 3,
                          child: QuestionPanel(
                            question: state.questions[state.currentQIndex],
                            index: state.currentQIndex,
                            onAnswer: (ans) {
                               final newAns = Map<int, dynamic>.from(state.answers);
                               final qId = state.questions[state.currentQIndex]['id'];
                               newAns[qId] = ans;
                               ref.read(testStateProvider.notifier).state = state.copyWith(answers: newAns);
                               // Parity logic: Track behavioral data for AI analysis
                               ref.read(dioClientProvider).post('/user/test/track', data: {
                                 'questionId': qId,
                                 'timestamp': DateTime.now().toIso8601String(),
                                 'action': 'select_option'
                               });
                            },
                          ),
                        ),
                      const SizedBox(width: 16),
                      const ScratchPadWidget(),
                      const SizedBox(width: 16),
                      QuestionPalette(
                        count: state.questions.length,
                        current: state.currentQIndex,
                        answers: state.answers.keys.toList(),
                        review: state.review.toList(),
                      ),
                    ],
                  ),
                ),
              ),
              FooterControls(
                onSubmit: _submit,
                onNext: state.currentQIndex < state.questions.length - 1 ? () => ref.read(testStateProvider.notifier).state = state.copyWith(currentQIndex: state.currentQIndex + 1) : null,
                onPrev: state.currentQIndex > 0 ? () => ref.read(testStateProvider.notifier).state = state.copyWith(currentQIndex: state.currentQIndex - 1) : null,
                onReview: () {
                  final newReview = Set<int>.from(state.review);
                  if (newReview.contains(state.currentQIndex)) newReview.remove(state.currentQIndex);
                  else newReview.add(state.currentQIndex);
                  ref.read(testStateProvider.notifier).state = state.copyWith(review: newReview);
                },
                isReviewed: state.review.contains(state.currentQIndex),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
