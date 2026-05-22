import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:examprep_app/core/services/voice_service.dart';
import 'package:examprep_app/core/api/dio_client.dart';

enum CallState { idle, calling, active }

class VoiceAiTutor extends ConsumerStatefulWidget {
  const VoiceAiTutor({super.key});
  @override
  ConsumerState<VoiceAiTutor> createState() => _VoiceAiTutorState();
}

class _VoiceAiTutorState extends ConsumerState<VoiceAiTutor> {
  final VoiceService _voice = VoiceService();
  CallState _state = CallState.idle;
  String _transcript = "";
  String _lastResponse = "";
  int _seconds = 0;
  Timer? _timer;
  bool _isListening = false;
  bool _isSpeaking = false;

  @override
  void initState() {
    super.initState();
    _voice.init();
  }

  void _startCall() {
    setState(() => _state = CallState.calling);
    Future.delayed(const Duration(seconds: 2), () {
      setState(() {
        _state = CallState.active;
        _seconds = 0;
        _timer = Timer.periodic(const Duration(seconds: 1), (t) => setState(() => _seconds++));
      });
      _voice.speak("Hello! I am your personalized AI Teacher. How can I help you today?");
    });
  }

  void _endCall() {
    _voice.stop();
    _timer?.cancel();
    setState(() => _state = CallState.idle);
  }

  void _toggleMic() {
    if (_isListening) {
      _voice.stopListening();
      setState(() => _isListening = false);
      _sendToAi(_transcript);
    } else {
      _voice.startListening((s) => setState(() => _transcript = s));
      setState(() => _isListening = true);
    }
  }

  Future<void> _sendToAi(String text) async {
    if (text.isEmpty) return;
    try {
      final res = await ref.read(dioClientProvider).post('/user/ai/teacher-call', data: text);
      setState(() => _lastResponse = res.data.toString());
      _voice.speak(_lastResponse);
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    if (_state == CallState.idle) return _buildFab();
    return Scaffold(
      body: Stack(
        children: [
          _buildBackground(),
          if (_state == CallState.calling) _buildCallingScreen(),
          if (_state == CallState.active) _buildActiveCall(),
        ],
      ),
    );
  }

  Widget _buildFab() {
    return Positioned(
      bottom: 100,
      right: 20,
      child: FloatingActionButton.large(
        onPressed: _startCall,
        backgroundColor: Colors.indigo,
        child: const Icon(Icons.call, color: Colors.white, size: 32),
      ),
    );
  }

  Widget _buildBackground() {
    return Container(
      decoration: const BoxDecoration(gradient: LinearGradient(colors: [Color(0xFFF0F2FF), Color(0xFFFCE8F3)], begin: Alignment.topLeft, end: Alignment.bottomRight)),
      child: Stack(
        children: [
          Positioned(top: -100, left: -100, child: Container(width: 400, height: 400, decoration: BoxDecoration(color: Colors.indigo.withOpacity(0.05), shape: BoxShape.circle))),
          Positioned(bottom: -100, right: -100, child: Container(width: 400, height: 400, decoration: BoxDecoration(color: Colors.purple.withOpacity(0.05), shape: BoxShape.circle))),
        ],
      ),
    );
  }

  Widget _buildCallingScreen() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _avatarCircle(128, 58),
          const SizedBox(height: 32),
          Text('AI Teacher', style: GoogleFonts.plusJakartaSans(fontSize: 32, fontWeight: FontWeight.w900)),
          const Text('Connecting...', style: TextStyle(color: Colors.grey, letterSpacing: 1.2)),
          const SizedBox(height: 100),
          _endButton(),
        ],
      ),
    );
  }

  Widget _buildActiveCall() {
    return SafeArea(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(24),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _pill('ON CALL'),
                Text('${(_seconds ~/ 60).toString().padLeft(2, '0')}:${(_seconds % 60).toString().padLeft(2, '0')}', style: const TextStyle(fontWeight: FontWeight.bold)),
                const Icon(Icons.settings, color: Colors.grey),
              ],
            ),
          ),
          const Spacer(),
          _avatarCircle(160, 64),
          const SizedBox(height: 16),
          const Text('AI Teacher', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
          const Text('Personalized for you', style: TextStyle(color: Colors.grey, fontSize: 13)),
          const Spacer(),
          if (_transcript.isNotEmpty) _bubble(context, 'You: $_transcript', Colors.white, Colors.black87),
          const SizedBox(height: 48),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _circleBtn(Icons.mic, _toggleMic, _isListening ? Colors.red : Colors.indigo),
              _circleBtn(Icons.call_end, _endCall, Colors.red),
              _circleBtn(Icons.keyboard, () {}, Colors.indigo),
            ],
          ),
          const SizedBox(height: 48),
        ],
      ),
    );
  }

  Widget _avatarCircle(double size, double fontSize) => Container(width: size, height: size, decoration: BoxDecoration(gradient: const LinearGradient(colors: [Colors.indigo, Colors.deepPurple]), shape: BoxShape.circle, boxShadow: [BoxShadow(color: Colors.indigo.withOpacity(0.3), blurRadius: 20, spreadRadius: 5)]), child: Center(child: Text('🧑‍🏫', style: TextStyle(fontSize: fontSize))));

  Widget _pill(String t) => Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4), decoration: BoxDecoration(color: Colors.green.withOpacity(0.1), borderRadius: BorderRadius.circular(20)), child: Row(children: [const CircleAvatar(radius: 3, backgroundColor: Colors.green), const SizedBox(width: 8), Text(t, style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 10))]));

  Widget _bubble(BuildContext context, String t, Color bg, Color tc) => Container(margin: const EdgeInsets.symmetric(horizontal: 32), padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)]), child: Text(t, style: TextStyle(color: tc, fontStyle: FontStyle.italic)));

  Widget _circleBtn(IconData icon, VoidCallback tap, Color c) => InkWell(onTap: tap, child: Container(width: 70, height: 70, decoration: BoxDecoration(color: c.withOpacity(0.1), shape: BoxShape.circle, border: Border.all(color: c.withOpacity(0.2))), child: Icon(icon, color: c, size: 28)));

  Widget _endButton() => InkWell(onTap: _endCall, child: Container(width: 80, height: 80, decoration: BoxDecoration(color: Colors.red.withOpacity(0.1), shape: BoxShape.circle, border: Border.all(color: Colors.red, width: 2)), child: const Icon(Icons.call_end, color: Colors.red, size: 32)));
}
