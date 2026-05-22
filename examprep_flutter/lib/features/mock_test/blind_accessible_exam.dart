import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import 'package:examprep_app/core/api/dio_client.dart';
import 'package:examprep_app/core/services/voice_service.dart';

enum BlindPhase { loading, welcome, question, listening, confirm, submitting, result }

class BlindAccessibleExam extends ConsumerStatefulWidget {
  final String topicId;
  const BlindAccessibleExam({super.key, required this.topicId});
  @override
  ConsumerState<BlindAccessibleExam> createState() => _BlindAccessibleExamState();
}

class _BlindAccessibleExamState extends ConsumerState<BlindAccessibleExam> {
  final VoiceService _voice = VoiceService();
  BlindPhase _phase = BlindPhase.loading;
  List<dynamic> _questions = [];
  int _currentIdx = 0;
  final Map<String, String> _answers = {};
  String? _pendingAnswer;
  String _statusText = "Loading exam...";
  String _transcript = "";

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    await _voice.init();
    await _loadQuestions();
  }

  Future<void> _loadQuestions() async {
    try {
      final res = await ref.read(dioClientProvider).get('/user/questions?topicId=${widget.topicId}');
      setState(() {
        _questions = res.data as List;
        _phase = BlindPhase.welcome;
      });
      _welcome();
    } catch (_) {}
  }

  void _welcome() {
    final text = "Welcome to the accessible voice exam. This exam has ${_questions.length} questions. Say READY to begin.";
    setState(() => _statusText = text);
    _voice.speak(text).then((_) => _startListening());
  }

  void _readQuestion() {
    if (_currentIdx >= _questions.length) {
      _finish();
      return;
    }
    final q = _questions[_currentIdx];
    final options = q['options'] as List;
    final text = "Question ${_currentIdx + 1} of ${_questions.length}. ${q['question']}. Option A: ${options[0]}. Option B: ${options[1]}. Option C: ${options[2]}. Option D: ${options[3]}. Please say the option letter.";
    setState(() {
      _statusText = text;
      _phase = BlindPhase.question;
    });
    _voice.speak(text).then((_) {
      setState(() => _phase = BlindPhase.listening);
      _startListening();
    });
  }

  void _startListening() {
    _voice.startListening((s) {
      setState(() => _transcript = s.toLowerCase());
      _handleCommand(s.toLowerCase());
    });
  }

  void _handleCommand(String cmd) {
    // Normalization: Remove dots, trim spaces
    final cleanCmd = cmd.replaceAll('.', '').trim();
    if (cleanCmd.isEmpty) return;

    if (_phase == BlindPhase.welcome && (cleanCmd.contains('ready') || cleanCmd.contains('start') || cleanCmd.contains('begin') || cleanCmd.contains('go') || cleanCmd.contains('okay'))) {
      _voice.stopListening();
      _readQuestion();
    } else if (_phase == BlindPhase.listening) {
      if (cleanCmd.endsWith(' a') || cleanCmd == 'a' || cleanCmd == 'alpha') {
        _confirmAnswer('A');
      } else if (cleanCmd.endsWith(' b') || cleanCmd == 'b' || cleanCmd == 'bravo') {
        _confirmAnswer('B');
      } else if (cleanCmd.endsWith(' c') || cleanCmd == 'c' || cleanCmd == 'charlie') {
        _confirmAnswer('C');
      } else if (cleanCmd.endsWith(' d') || cleanCmd == 'd' || cleanCmd == 'delta') {
        _confirmAnswer('D');
      } else if (cleanCmd.contains('repeat')) {
        _voice.stopListening();
        _readQuestion();
      }
    } else if (_phase == BlindPhase.confirm && (cleanCmd.contains('yes') || cleanCmd.contains('confirm') || cleanCmd.contains('yeah') || cleanCmd.contains('correct'))) {
      _voice.stopListening();
      _answers[_questions[_currentIdx]['id'].toString()] = _pendingAnswer!;
      _currentIdx++;
      _readQuestion();
    } else if (_phase == BlindPhase.confirm && (cleanCmd.contains('no') || cleanCmd.contains('change') || cleanCmd.contains('repeat'))) {
       _voice.stopListening();
       _readQuestion();
    }
  }

  void _confirmAnswer(String ans) {
    _voice.stopListening();
    _pendingAnswer = ans;
    setState(() => _phase = BlindPhase.confirm);
    final text = "You chose option $ans. Say YES to confirm or NO to change.";
    _voice.speak(text).then((_) => _startListening());
  }

  void _finish() {
    setState(() => _phase = BlindPhase.submitting);
    final text = "Exam complete. Say SUBMIT to submit your answers.";
    _voice.speak(text).then((_) => _startListening());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F1117),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _statusIcon(),
              const SizedBox(height: 32),
              Text(_statusText, textAlign: TextAlign.center, style: GoogleFonts.plusJakartaSans(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w500)),
              if (_transcript.isNotEmpty) ...[const SizedBox(height: 16), Text('You said: "$_transcript"', style: const TextStyle(color: Colors.white54, fontStyle: FontStyle.italic))],
            ],
          ),
        ),
      ),
    );
  }

  Widget _statusIcon() {
    IconData icon;
    Color color;
    switch (_phase) {
      case BlindPhase.listening: icon = Icons.mic; color = Colors.red; break;
      case BlindPhase.confirm: icon = Icons.help_outline; color = Colors.orange; break;
      default: icon = Icons.volume_up; color = Colors.indigo;
    }
    return Container(width: 100, height: 100, decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle, border: Border.all(color: color, width: 2)), child: Icon(icon, color: color, size: 48));
  }
}
