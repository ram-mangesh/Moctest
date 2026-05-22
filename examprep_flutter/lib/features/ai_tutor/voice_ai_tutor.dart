import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:examprep_app/core/api/dio_client.dart';
import 'package:examprep_app/core/theme/app_theme.dart';

enum _CallScreen { idle, calling, active }
enum _MicMode { idle, listening, thinking, speaking }

class VoiceAiTutor extends ConsumerStatefulWidget {
  const VoiceAiTutor({super.key});
  @override
  ConsumerState<VoiceAiTutor> createState() => _VoiceAiTutorState();
}

class _VoiceAiTutorState extends ConsumerState<VoiceAiTutor> with TickerProviderStateMixin {
  // State
  _CallScreen _screen = _CallScreen.idle;
  _MicMode _mode = _MicMode.idle;
  bool _muted = false;
  bool _speakerOn = true;
  bool _showType = false;
  int _callTimer = 0;
  String _transcript = '';
  String _lastResponse = '';
  String _studentName = 'Student';
  
  // Controllers
  final _typeCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  Timer? _timerTick;
  
  // Services
  final _tts = FlutterTts();
  final _stt = stt.SpeechToText();
  bool _sttAvailable = false;

  // Animations
  late AnimationController _pulseCtrl;
  late AnimationController _waveCtrl;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 2))..repeat();
    _waveCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 600))..repeat();
    _loadInitialData();
    _initTts();
  }

  Future<void> _loadInitialData() async {
    final name = await AuthStorage.getName();
    if (mounted) setState(() => _studentName = name ?? 'Student');
    
    try {
      final res = await ref.read(dioClientProvider).get('/user/ai/teacher-context');
      if (res.data != null && res.data['name'] != null) {
        if (mounted) setState(() => _studentName = res.data['name']);
      }
    } catch (_) {}
  }

  Future<void> _initTts() async {
    await _tts.setLanguage('en-IN');
    await _tts.setSpeechRate(0.45);
    await _tts.setVolume(1.0);
    await _tts.setPitch(1.0);
    
    _tts.setStartHandler(() => setState(() => _mode = _MicMode.speaking));
    _tts.setCompletionHandler(() => setState(() => _mode = _MicMode.idle));
    _tts.setErrorHandler((_) => setState(() => _mode = _MicMode.idle));
    
    _sttAvailable = await _stt.initialize();
  }

  void _startCallSequence() {
    setState(() => _screen = _CallScreen.calling);
    Future.delayed(const Duration(milliseconds: 1900), () {
      if (mounted) {
        setState(() {
          _screen = _CallScreen.active;
          _callTimer = 0;
        });
        _timerTick = Timer.periodic(const Duration(seconds: 1), (t) {
          if (mounted) setState(() => _callTimer++);
        });
      }
    });
  }

  void _endCall() {
    _timerTick?.cancel();
    _tts.stop();
    _stt.stop();
    setState(() {
      _screen = _CallScreen.idle;
      _mode = _MicMode.idle;
      _callTimer = 0;
      _transcript = '';
      _lastResponse = '';
    });
  }

  Future<void> _speak(String text) async {
    if (!_speakerOn) return;
    final clean = text.replaceAll(RegExp(r'[*#_`~>]'), '').trim();
    await _tts.speak(clean);
  }

  Future<void> _askAi(String text) async {
    if (text.trim().isEmpty) return;
    setState(() {
      _mode = _MicMode.thinking;
      _transcript = text;
    });

    try {
      final res = await ref.read(dioClientProvider).postText('/user/ai/teacher-call', text);
      final answer = res.data?.toString() ?? 'I could not connect. Please try again.';
      if (mounted) {
        setState(() {
          _lastResponse = answer;
        });
        await _speak(answer);
      }
    } catch (_) {
      if (mounted) {
        setState(() => _mode = _MicMode.idle);
        await _speak("Sorry, I'm having trouble connecting right now.");
      }
    }
  }

  Future<void> _toggleMic() async {
    if (_mode == _MicMode.listening) {
      await _stt.stop();
      setState(() => _mode = _MicMode.idle);
      return;
    }
    if (_mode == _MicMode.speaking) {
      await _tts.stop();
      setState(() => _mode = _MicMode.idle);
      return;
    }
    
    if (_sttAvailable) {
      setState(() => _mode = _MicMode.listening);
      await _stt.listen(
        onResult: (res) {
          setState(() => _transcript = res.recognizedWords);
          if (res.finalResult) {
            _askAi(_transcript);
          }
        },
        localeId: 'en_IN',
      );
    }
  }

  void _handleGreet() {
    _speak("Hello $_studentName! I am your personalised AI Teacher. I have already reviewed your exam history and performance. You can ask me about your weak topics, study plans, or any concept.");
  }

  Future<void> _toggleType() async {
    setState(() => _showType = !_showType);
    if (_showType) {
      // Small delay to let the UI update, then scroll to bottom
      Future.delayed(const Duration(milliseconds: 100), () {
        if (_scrollCtrl.hasClients) {
          _scrollCtrl.animateTo(
            _scrollCtrl.position.maxScrollExtent,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
          );
        }
      });
    }
  }

  @override
  void dispose() {
    _timerTick?.cancel();
    _pulseCtrl.dispose();
    _waveCtrl.dispose();
    _typeCtrl.dispose();
    _scrollCtrl.dispose();
    _tts.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          _buildBackground(),
          SafeArea(
            child: switch (_screen) {
              _CallScreen.idle => _buildIdleView(),
              _CallScreen.calling => _buildCallingView(),
              _CallScreen.active => _buildActiveView(),
            },
          ),
        ],
      ),
    );
  }

  Widget _buildBackground() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFFF0F2FF), Color(0xFFFDFCFE)],
          begin: Alignment.topLeft, end: Alignment.bottomRight,
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            top: -100, left: -100,
            child: _BlurredOrb(color: Colors.indigo.withOpacity(0.1), size: 400),
          ),
          Positioned(
            bottom: -50, right: -50,
            child: _BlurredOrb(color: Colors.purple.withOpacity(0.08), size: 350),
          ),
          Opacity(
            opacity: 0.03,
            child: Image.network(
              'https://www.transparenttextures.com/patterns/cubes.png',
              repeat: ImageRepeat.repeat,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIdleView() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Center(
          child: Column(
            children: [
              _HeroAvatar(pulseCtrl: _pulseCtrl, emoji: '🧑‍🏫'),
              const SizedBox(height: 32),
              Text('AI Personal Teacher', 
                style: GoogleFonts.plusJakartaSans(fontSize: 28, fontWeight: FontWeight.w900, color: const Color(0xFF1A1740))),
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 40),
                child: Text('Get personalised guidance, doubt clearing, and study plans via voice call.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.plusJakartaSans(fontSize: 15, color: Colors.indigo.withOpacity(0.6), height: 1.6)),
              ),
              const SizedBox(height: 48),
              _ActionButton(
                onTap: _startCallSequence,
                icon: Icons.call,
                label: 'Start Session',
                color: const Color(0xFF4F46E5),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCallingView() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _HeroAvatar(pulseCtrl: _pulseCtrl, emoji: '🧑‍🏫', isCalling: true),
          const SizedBox(height: 40),
          const _CallingBadge(),
          const SizedBox(height: 16),
          Text('AI Teacher', style: GoogleFonts.plusJakartaSans(fontSize: 26, fontWeight: FontWeight.w900)),
          Text('Personalised for $_studentName', style: GoogleFonts.plusJakartaSans(fontSize: 14, color: Colors.indigo.withOpacity(0.5))),
          const SizedBox(height: 60),
          _ActionButton(
            onTap: _endCall,
            icon: Icons.call_end,
            label: 'Decline',
            color: Colors.redAccent,
          ),
        ],
      ),
    );
  }

  Widget _buildActiveView() {
    return Column(
      children: [
        _buildTopBar(),
        Expanded(
          child: SingleChildScrollView(
            controller: _scrollCtrl,
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(height: 10),
                _buildAvatarCard(),
                const SizedBox(height: 20),
                if (_transcript.isNotEmpty) _buildTranscriptBubble('You', _transcript),
                if (_lastResponse.isNotEmpty && _mode != _MicMode.speaking) 
                  _buildTranscriptBubble('AI Teacher', _lastResponse, isAi: true),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
        if (_showType) _buildTypeInput(),
        _buildControlPanel(),
      ],
    );
  }

  Widget _buildTopBar() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.8),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.indigo.withOpacity(0.1)),
            ),
            child: Row(
              children: [
                const _StatusDot(),
                const SizedBox(width: 8),
                Text('ON CALL', style: GoogleFonts.plusJakartaSans(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.indigo.withOpacity(0.6))),
              ],
            ),
          ),
          Text(_formatTime(_callTimer), style: GoogleFonts.plusJakartaSans(fontSize: 16, fontWeight: FontWeight.w800, color: const Color(0xFF4F46E5))),
          IconButton(
            onPressed: () => Navigator.pop(context),
            icon: const Icon(Icons.close, color: Color(0xFF1A1740)),
          ),
        ],
      ),
    );
  }

  Widget _buildAvatarCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.9),
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: Colors.indigo.withOpacity(0.1)),
        boxShadow: [BoxShadow(color: Colors.indigo.withOpacity(0.05), blurRadius: 40)],
      ),
      child: Column(
        children: [
          _HeroAvatar(pulseCtrl: _pulseCtrl, emoji: '🧑‍🏫', small: true, isSpeaking: _mode == _MicMode.speaking),
          const SizedBox(height: 16),
          Text('AI Teacher', style: GoogleFonts.plusJakartaSans(fontSize: 20, fontWeight: FontWeight.w900)),
          Text('Ready to help you $_studentName', style: GoogleFonts.plusJakartaSans(fontSize: 12, color: Colors.indigo.withOpacity(0.4))),
          const SizedBox(height: 24),
          _Waveform(mode: _mode, waveCtrl: _waveCtrl),
          const SizedBox(height: 12),
          Text(_getStatusText(), 
            style: GoogleFonts.plusJakartaSans(fontSize: 13, fontWeight: FontWeight.w700, color: _getStatusColor())),
          if (_lastResponse.isEmpty && _mode == _MicMode.idle)
            TextButton(onPressed: _handleGreet, child: const Text("👋 Tap for greeting")),
        ],
      ),
    );
  }

  Widget _buildTranscriptBubble(String role, String text, {bool isAi = false}) {
    return Container(
      margin: const EdgeInsets.only(top: 12),
      padding: const EdgeInsets.all(16),
      width: double.infinity,
      decoration: BoxDecoration(
        color: isAi ? const Color(0xFFEEF0FF).withOpacity(0.8) : Colors.white.withOpacity(0.8),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.indigo.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(role.toUpperCase(), style: GoogleFonts.plusJakartaSans(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.indigo.withOpacity(0.4))),
          const SizedBox(height: 4),
          Text(text, maxLines: 3, overflow: TextOverflow.ellipsis,
               style: GoogleFonts.plusJakartaSans(fontSize: 13, fontWeight: FontWeight.w600, color: const Color(0xFF1A1740), height: 1.5)),
        ],
      ),
    );
  }

  Widget _buildTypeInput() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.indigo.withOpacity(0.1), blurRadius: 20, offset: const Offset(0, -5))],
        border: Border.all(color: Colors.indigo.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _typeCtrl,
              autofocus: true,
              style: GoogleFonts.plusJakartaSans(fontSize: 14, fontWeight: FontWeight.w600),
              decoration: const InputDecoration(
                hintText: 'Type your question...',
                border: InputBorder.none,
                isDense: true,
              ),
              onSubmitted: (s) {
                _askAi(s);
                _typeCtrl.clear();
                setState(() => _showType = false);
              },
            ),
          ),
          _SmallCircleBtn(
            icon: Icons.send,
            onTap: () {
              _askAi(_typeCtrl.text);
              _typeCtrl.clear();
              setState(() => _showType = false);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildControlPanel() {
    return Container(
      padding: const EdgeInsets.fromLTRB(32, 24, 32, 48),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.9),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(40)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20)],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _IconBtn(icon: _muted ? Icons.mic_off : Icons.mic, label: 'Mute', active: _muted, onTap: () => setState(() => _muted = !_muted)),
              _IconBtn(icon: _speakerOn ? Icons.volume_up : Icons.volume_off, label: 'Speaker', active: _speakerOn, onTap: () => setState(() => _speakerOn = !_speakerOn)),
              _IconBtn(icon: Icons.keyboard, label: 'Type', active: _showType, onTap: _toggleType),
            ],
          ),
          const SizedBox(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _LargeMicBtn(mode: _mode, onTap: _toggleMic),
              const SizedBox(width: 48),
              _LargeEndBtn(onTap: _endCall),
            ],
          ),
        ],
      ),
    );
  }

  String _formatTime(int seconds) {
    final m = seconds ~/ 60;
    final s = seconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  String _getStatusText() {
    return switch (_mode) {
      _MicMode.idle => 'Tap to ask a question',
      _MicMode.listening => 'Listening... speak now',
      _MicMode.thinking => 'AI Teacher is thinking...',
      _MicMode.speaking => 'AI is speaking...',
    };
  }

  Color _getStatusColor() {
    return switch (_mode) {
      _MicMode.idle => Colors.indigo.withOpacity(0.4),
      _MicMode.listening => Colors.redAccent,
      _MicMode.thinking => Colors.orange,
      _MicMode.speaking => Colors.green,
    };
  }
}

// --- SUB WIDGETS ---

class _BlurredOrb extends StatelessWidget {
  final Color color;
  final double size;
  const _BlurredOrb({required this.color, required this.size});
  @override
  Widget build(BuildContext context) => Container(
    width: size, height: size,
    decoration: BoxDecoration(color: color, shape: BoxShape.circle),
  );
}

class _HeroAvatar extends StatelessWidget {
  final AnimationController pulseCtrl;
  final String emoji;
  final bool isCalling, small, isSpeaking;
  const _HeroAvatar({required this.pulseCtrl, required this.emoji, this.isCalling = false, this.small = false, this.isSpeaking = false});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: pulseCtrl,
      builder: (context, child) {
        final val = (isCalling || isSpeaking) ? pulseCtrl.value : 0.0;
        return Stack(
          alignment: Alignment.center,
          children: [
            for (var i = 1; i <= 3; i++)
              Container(
                width: (small ? 80 : 120) * (1 + val * 0.3 * i),
                height: (small ? 80 : 120) * (1 + val * 0.3 * i),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFF4F46E5).withOpacity(0.2 / i)),
                ),
              ),
            Container(
              width: small ? 80 : 120, height: small ? 80 : 120,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)]),
              ),
              child: Center(child: Text(emoji, style: TextStyle(fontSize: small ? 36 : 56))),
            ),
          ],
        );
      },
    );
  }
}

class _ActionButton extends StatelessWidget {
  final VoidCallback onTap;
  final IconData icon;
  final String label;
  final Color color;
  const _ActionButton({required this.onTap, required this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Column(
      children: [
        Container(
          width: 72, height: 72,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle, boxShadow: [BoxShadow(color: color.withOpacity(0.3), blurRadius: 20)]),
          child: Icon(icon, color: Colors.white, size: 30),
        ),
        const SizedBox(height: 12),
        Text(label, style: GoogleFonts.plusJakartaSans(fontSize: 13, fontWeight: FontWeight.w700, color: color)),
      ],
    ),
  );
}

class _CallingBadge extends StatelessWidget {
  const _CallingBadge();
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
    decoration: BoxDecoration(color: const Color(0xFFEEF0FF), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.indigo.withOpacity(0.1))),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        const SizedBox(width: 8, height: 8, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF4F46E5))),
        const SizedBox(width: 10),
        Text('CALLING', style: GoogleFonts.plusJakartaSans(fontSize: 11, fontWeight: FontWeight.w800, color: const Color(0xFF4F46E5))),
      ],
    ),
  );
}

class _StatusDot extends StatelessWidget {
  const _StatusDot();
  @override
  Widget build(BuildContext context) => Container(
    width: 8, height: 8,
    decoration: const BoxDecoration(color: Colors.green, shape: BoxShape.circle, boxShadow: [BoxShadow(color: Colors.green, blurRadius: 4)]),
  );
}

class _Waveform extends StatelessWidget {
  final _MicMode mode;
  final AnimationController waveCtrl;
  const _Waveform({required this.mode, required this.waveCtrl});

  @override
  Widget build(BuildContext context) {
    if (mode == _MicMode.idle) {
      return Row(mainAxisAlignment: MainAxisAlignment.center, children: List.generate(7, (i) => _WaveBar(height: 8, color: Colors.indigo.withOpacity(0.1))));
    }
    return AnimatedBuilder(
      animation: waveCtrl,
      builder: (context, child) {
        return Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(7, (i) {
            final h = mode == _MicMode.listening ? (10 + (waveCtrl.value * 20)) : (15 + (waveCtrl.value * 25));
            return _WaveBar(height: h, color: mode == _MicMode.listening ? Colors.redAccent : Colors.indigo);
          }),
        );
      },
    );
  }
}

class _WaveBar extends StatelessWidget {
  final double height;
  final Color color;
  const _WaveBar({required this.height, required this.color});
  @override
  Widget build(BuildContext context) => Container(
    width: 4, height: height, margin: const EdgeInsets.symmetric(horizontal: 2),
    decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(2)),
  );
}

class _IconBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool active;
  final VoidCallback onTap;
  const _IconBtn({required this.icon, required this.label, required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Column(
      children: [
        Container(
          width: 56, height: 56,
          decoration: BoxDecoration(
            color: active ? const Color(0xFF4F46E5).withOpacity(0.1) : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: active ? const Color(0xFF4F46E5).withOpacity(0.3) : Colors.indigo.withOpacity(0.05)),
          ),
          child: Icon(icon, color: active ? const Color(0xFF4F46E5) : Colors.indigo.withOpacity(0.4)),
        ),
        const SizedBox(height: 6),
        Text(label, style: GoogleFonts.plusJakartaSans(fontSize: 11, fontWeight: FontWeight.w700, color: active ? const Color(0xFF4F46E5) : Colors.indigo.withOpacity(0.4))),
      ],
    ),
  );
}

class _LargeMicBtn extends StatelessWidget {
  final _MicMode mode;
  final VoidCallback onTap;
  const _LargeMicBtn({required this.mode, required this.onTap});

  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(
      width: 80, height: 80,
      decoration: BoxDecoration(
        color: mode == _MicMode.listening ? Colors.redAccent : Colors.white,
        shape: BoxShape.circle,
        boxShadow: [BoxShadow(color: (mode == _MicMode.listening ? Colors.redAccent : Colors.black).withOpacity(0.1), blurRadius: 20)],
        border: Border.all(color: (mode == _MicMode.listening ? Colors.redAccent : Colors.indigo).withOpacity(0.1), width: 4),
      ),
      child: Icon(
        mode == _MicMode.listening ? Icons.stop : (mode == _MicMode.speaking ? Icons.volume_up : Icons.mic),
        color: mode == _MicMode.listening ? Colors.white : const Color(0xFF4F46E5),
        size: 32,
      ),
    ),
  );
}

class _LargeEndBtn extends StatelessWidget {
  final VoidCallback onTap;
  const _LargeEndBtn({required this.onTap});
  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(
      width: 80, height: 80,
      decoration: BoxDecoration(
        color: const Color(0xFFFEF2F2),
        shape: BoxShape.circle,
        border: Border.all(color: Colors.redAccent.withOpacity(0.2), width: 4),
      ),
      child: const Icon(Icons.call_end, color: Colors.redAccent, size: 32),
    ),
  );
}

class _SmallCircleBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _SmallCircleBtn({required this.icon, required this.onTap});
  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(
      padding: const EdgeInsets.all(12),
      decoration: const BoxDecoration(color: Color(0xFF4F46E5), shape: BoxShape.circle),
      child: Icon(icon, color: Colors.white, size: 18),
    ),
  );
}
