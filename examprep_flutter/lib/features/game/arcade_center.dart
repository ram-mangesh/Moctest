import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:examprep_app/core/api/dio_client.dart';

class ArcadeCenter extends ConsumerStatefulWidget {
  const ArcadeCenter({super.key});
  @override
  ConsumerState<ArcadeCenter> createState() => _ArcadeCenterState();
}

class _ArcadeCenterState extends ConsumerState<ArcadeCenter> {
  String? _selectedGame;

  @override
  Widget build(BuildContext context) {
    if (_selectedGame != null) {
      return _GameEngine(mode: _selectedGame!, onBack: () => setState(() => _selectedGame = null));
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
        child: Column(
          children: [
            const Text('SUPREME ARCADE HUB', style: TextStyle(fontSize: 40, fontWeight: FontWeight.w900, color: Colors.indigoAccent, letterSpacing: -1.5)),
            const Text('The ultimate gamified learning experience!', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
            const SizedBox(height: 40),

            _sectionHeader('Featured Native Missions'),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 1.3,
              children: [
                _gameCard('Snake & Ladder', '🪜', 'Climb to success with correct answers.', Colors.green, () => context.push('/game/snake-ladder')),
                _gameCard('Heist Master', '🔐', 'Crack the vault with your knowledge.', Colors.amber, () => context.push('/game/heist-master')),
                _gameCard('Space Mission', '🚀', 'Native galaxy defense challenge.', Colors.cyan, () => context.push('/game/space-defender')),
                _gameCard('Magic Potion', '🧪', 'Mix the right answers for progress.', Colors.purple, () => context.push('/game/magic-potion')),
                _gameCard('Train Express', '🚂', 'Keep the learning train on track!', Colors.orange, () => context.push('/game/train-express')),
              ],
            ),

            const SizedBox(height: 48),
            _sectionHeader('Hardcore Elite Trials', color: Colors.redAccent),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 1.5,
              children: [
                _gameCard('Hellbound', '🩸', 'Survive the underworld trials.', Colors.red.shade900, () => setState(() => _selectedGame = 'HELLBOUND')),
                _gameCard('Cyber Breach', '💾', 'Bypass military level firewalls.', Colors.green, () => setState(() => _selectedGame = 'CYBER')),
                _gameCard('Wasteland', '☢️', 'Strategic sniper zone mission.', Colors.yellow.shade800, () => setState(() => _selectedGame = 'WASTELAND')),
              ],
            ),

            const SizedBox(height: 48),
            _sectionHeader('Legacy Retro Classic'),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 1.5,
              children: [
                _gameCard('City Runner', '🏃‍♂️', 'Original sprint challenge.', Colors.lightBlue, () => setState(() => _selectedGame = 'RUNNER')),
                _gameCard('Ninja Strike', '🥷', 'Legacy combat knowledge test.', Colors.red, () => setState(() => _selectedGame = 'NINJA')),
              ],
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _sectionHeader(String t, {Color color = Colors.blueGrey}) => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(t.toUpperCase(), style: TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 16, letterSpacing: 2.5)), Container(height: 2, width: 60, color: color, margin: const EdgeInsets.only(top: 8, bottom: 20))]);

  Widget _gameCard(String title, String icon, String desc, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(32),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(color: color.withOpacity(0.05), borderRadius: BorderRadius.circular(32), border: Border.all(color: color.withOpacity(0.3), width: 1.5)),
        child: Stack(
          children: [
            Positioned(right: -10, bottom: -10, child: Opacity(opacity: 0.15, child: Text(icon, style: const TextStyle(fontSize: 70)))),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(color: color, fontSize: 20, fontWeight: FontWeight.w900)),
                const SizedBox(height: 6),
                Expanded(child: Text(desc, style: TextStyle(color: color.withOpacity(0.7), fontSize: 11, fontWeight: FontWeight.bold))),
                Container(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6), decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(20)), child: const Text('LAUNCH', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 9))),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _GameEngine extends ConsumerStatefulWidget {
  final String mode;
  final VoidCallback onBack;
  const _GameEngine({required this.mode, required this.onBack});
  @override
  ConsumerState<_GameEngine> createState() => _GameEngineState();
}

class _GameEngineState extends ConsumerState<_GameEngine> {
  String _gameState = 'MENU';
  List<dynamic> _exams = [], _questions = [];
  int _hp = 3, _score = 0, _qIndex = 0;
  double _progress = 0, _speed = 1.0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _loadExams();
  }

  Future<void> _loadExams() async {
    final res = await ref.read(dioClientProvider).get('/user/exams');
    if (mounted) setState(() => _exams = res.data ?? []);
  }

  void _startGame(String examId) async {
    setState(() => _gameState = 'LOADING');
    try {
      final res = await ref.read(dioClientProvider).get('/user/questions?topicId=$examId');
      final qs = (res.data as List).toList()..shuffle();
      _questions = qs.take(15).toList();
      _hp = 3; _score = 0; _progress = 0; _speed = 1.0; _qIndex = 0;
      setState(() => _gameState = 'PLAYING');
      _timer = Timer.periodic(const Duration(milliseconds: 50), (timer) {
        if (_gameState == 'PLAYING') {
          setState(() {
            _progress += 2 * _speed;
            if (_progress % 350 <= (2 * _speed) && _progress > 10 && _qIndex < _questions.length) {
              _gameState = 'QUESTION';
            }
          });
        }
      });
    } catch (_) { setState(() => _gameState = 'MENU'); }
  }

  void _handleAnswer(int choiceIdx) {
    if (_gameState != 'QUESTION') return;
    final q = _questions[_qIndex];
    
    bool isCorrect = false;
    final dynamic correct = q['correct'] ?? q['correctAnswer'];
    final List options = q['options'] ?? [];
    
    if (choiceIdx.toString() == correct.toString()) {
      isCorrect = true;
    } else if (options.length > choiceIdx && options[choiceIdx].toString() == correct.toString()) {
      isCorrect = true;
    } else {
      String letter = String.fromCharCode(65 + choiceIdx);
      if (letter == correct.toString()) isCorrect = true;
    }

    if (isCorrect) {
      _score += (150 * _speed).round();
      _speed = (_speed + 0.2).clamp(1.0, 3.0);
    } else {
      _hp--;
      _speed = 1.0;
    }
    _qIndex++;
    if (_hp <= 0) {
      _gameState = 'GAMEOVER';
      _timer?.cancel();
    } else if (_qIndex >= _questions.length) {
      _gameState = 'WIN';
      _timer?.cancel();
    } else {
      _gameState = 'PLAYING';
    }
    setState(() {});
  }

  @override
  void dispose() { _timer?.cancel(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          _buildBackground(),
          _buildCharacter(),
          _buildObstacle(),
          _buildHUD(),
          if (_gameState == 'MENU') _buildMenu(),
          if (_gameState == 'QUESTION') _buildQuestionOverlay(),
          if (_gameState == 'GAMEOVER') _buildGameOver(),
          if (_gameState == 'WIN') _buildWin(),
          Positioned(top: 10, left: 10, child: IconButton(icon: const Icon(Icons.arrow_back, color: Colors.white), onPressed: widget.onBack)),
        ],
      ),
    );
  }

  Widget _buildBackground() {
    switch (widget.mode) {
      case 'HELLBOUND': return Container(color: const Color(0xFF450A0A));
      case 'CYBER': return Container(color: const Color(0xFF022C22));
      case 'WASTELAND': return Container(color: const Color(0xFF422006));
      case 'RUNNER': return Container(color: Colors.blueGrey.shade900);
      case 'NINJA': return Container(color: const Color(0xFF1E1B4B));
      default: return Container(color: Colors.black);
    }
  }

  Widget _buildCharacter() {
    if (_gameState == 'MENU') return const SizedBox();
    String icon = '🏃‍♂️';
    if (widget.mode == 'NINJA') icon = '🥷';
    if (widget.mode == 'HELLBOUND') icon = '🩸';
    if (widget.mode == 'CYBER') icon = '💾';
    if (widget.mode == 'WASTELAND') icon = '☢️';
    return Positioned(left: 60, bottom: 100, child: Text(icon, style: const TextStyle(fontSize: 80)));
  }

  Widget _buildObstacle() {
    if (_gameState != 'PLAYING' && _gameState != 'QUESTION') return const SizedBox();
    double diff = ((_qIndex + 1) * 350) - _progress;
    if (diff < 0 || diff > 800) return const SizedBox();
    return Positioned(left: 60 + diff * 1.5, bottom: 100, child: const Text('🚧', style: TextStyle(fontSize: 70)));
  }

  Widget _buildHUD() {
    if (_gameState == 'MENU') return const SizedBox();
    return Positioned(top: 40, left: 20, right: 20, child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Row(children: List.generate(3, (i) => Icon(Icons.favorite, color: i < _hp ? Colors.red : Colors.grey, size: 28))),
      Container(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8), decoration: BoxDecoration(color: Colors.amber, borderRadius: BorderRadius.circular(20)), child: Text('SCORE: $_score', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18))),
    ]));
  }

  Widget _buildMenu() {
    return Container(color: Colors.black87, child: Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
      Text(widget.mode, style: const TextStyle(color: Colors.white, fontSize: 40, fontWeight: FontWeight.w900)),
      const SizedBox(height: 20),
      const Text('CHOOSE YOUR SUBJECT', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold, letterSpacing: 1)),
      const SizedBox(height: 20),
      ConstrainedBox(
        constraints: const BoxConstraints(maxHeight: 400),
        child: SingleChildScrollView(
          child: Column(
            children: _exams.map((e) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: ElevatedButton(onPressed: () => _startGame(e['id'].toString()), style: ElevatedButton.styleFrom(backgroundColor: Colors.indigo, foregroundColor: Colors.white, minimumSize: const Size(250, 50)), child: Text(e['name'])),
            )).toList(),
          ),
        ),
      ),
    ])));
  }

  Widget _buildQuestionOverlay() {
    final q = _questions[_qIndex];
    final opts = q['options'] as List? ?? [];
    return Container(color: Colors.black87, child: Center(child: Container(margin: const EdgeInsets.all(20), padding: const EdgeInsets.all(24), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24)), child: Column(mainAxisSize: MainAxisSize.min, children: [
      Text('QUESTION ${_qIndex+1}', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.indigo)),
      const SizedBox(height: 12),
      Text(q['question'] ?? '', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black), textAlign: TextAlign.center),
      const SizedBox(height: 24),
      ...List.generate(opts.length, (i) => Padding(padding: const EdgeInsets.only(bottom: 10), child: ElevatedButton(onPressed: () => _handleAnswer(i), style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 50)), child: Text(opts[i]))))
    ]))));
  }

  Widget _buildGameOver() => Container(color: Colors.black.withOpacity(0.9), child: Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [const Text('GAME OVER', style: TextStyle(color: Colors.red, fontSize: 50, fontWeight: FontWeight.w900)), Text('SCORE: $_score', style: const TextStyle(color: Colors.white)), const SizedBox(height: 20), ElevatedButton(onPressed: () => setState(() => _gameState = 'MENU'), child: const Text('RETRY'))])));
  Widget _buildWin() => Container(color: Colors.indigo.withOpacity(0.9), child: Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [const Text('VICTORY!', style: TextStyle(color: Colors.white, fontSize: 50, fontWeight: FontWeight.w900)), Text('FINAL SCORE: $_score', style: const TextStyle(color: Colors.white)), const SizedBox(height: 20), ElevatedButton(onPressed: () => setState(() => _gameState = 'MENU'), child: const Text('CONTINUE'))])));
}
