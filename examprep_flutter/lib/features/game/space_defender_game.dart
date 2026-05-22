import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:dio/dio.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:examprep_app/core/api/dio_client.dart';

class SpaceDefenderGame extends ConsumerStatefulWidget {
  final VoidCallback onBack;
  const SpaceDefenderGame({super.key, required this.onBack});

  @override
  ConsumerState<SpaceDefenderGame> createState() => _SpaceDefenderGameState();
}

class _SpaceDefenderGameState extends ConsumerState<SpaceDefenderGame> with TickerProviderStateMixin {
  String gameState = "MENU"; // MENU, LOADING, PLAYING, WIN, GAMEOVER
  int score = 0;
  int shields = 3;
  int combo = 0;
  int wave = 1;
  int qIndex = 0;
  List<dynamic> questions = [];
  List<dynamic> exams = [];
  Map<String, dynamic>? selectedExam;


  
  List<Asteroid> asteroids = [];
  List<Explosion> explosions = [];
  List<Laser> lasers = [];
  Timer? gameTick;
  Timer? spawnTimer;

  @override
  void initState() {
    super.initState();
    fetchExams();
  }

  @override
  void dispose() {
    gameTick?.cancel();
    spawnTimer?.cancel();
    super.dispose();
  }

  Future<void> fetchExams() async {
    try {
      final dio = ref.read(dioClientProvider);
      final res = await dio.get("/user/exams");
      setState(() => exams = res.data ?? []);
    } catch (e) {
      debugPrint("Exams fetch failed");
    }
  }

  Future<void> startGame(Map<String, dynamic> exam) async {
    setState(() {
      gameState = "LOADING";
      selectedExam = exam;
    });
    try {
      final dio = ref.read(dioClientProvider);
      final res = await dio.get("/user/questions?topicId=${exam['id']}");
      final qs = (res.data as List).toList()..shuffle();
      setState(() {
        questions = qs.take(25).toList();
        qIndex = 0; score = 0; shields = 3; combo = 0; wave = 1;
        asteroids = []; explosions = []; lasers = [];
        gameState = "PLAYING";
      });
      startLoop();
    } catch (e) {
      setState(() => gameState = "MENU");
    }
  }

  void startLoop() {
    gameTick?.cancel();
    spawnTimer?.cancel();
    
    gameTick = Timer.periodic(const Duration(milliseconds: 30), (t) {
      if (gameState == "PLAYING") {
        updateGame();
      }
    });

    spawnTimer = Timer.periodic(const Duration(milliseconds: 1500), (t) {
      if (gameState == "PLAYING") {
        spawnAsteroid();
      }
    });
  }

  void spawnAsteroid() {
    setState(() {
      asteroids.add(Asteroid(
        id: Random().nextInt(100000),
        x: Random().nextDouble() * 0.9 + 0.05,
        y: -0.1,
        size: Random().nextDouble() * 30 + 20,
        speed: Random().nextDouble() * 0.01 + 0.005 + (wave * 0.002),
        isAlien: Random().nextDouble() > 0.8,
      ));
    });
  }

  void updateGame() {
    setState(() {
      for (var a in asteroids) {
        a.y += a.speed;
      }
      asteroids.removeWhere((a) => a.y > 1.1);
      
      // Cleanup lasers and explosions
      lasers.removeWhere((l) => l.life <= 0);
      for (var l in lasers) l.life -= 0.1;
      
      explosions.removeWhere((e) => e.life <= 0);
      for (var e in explosions) e.life -= 0.05;
    });
  }

  void handleAnswer(int choiceIdx) {
    if (gameState != "PLAYING") return;
    final q = questions[qIndex % questions.length];
    
    // Robust Answer Checking
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

    setState(() => qIndex++);

    if (isCorrect) {
      setState(() {
        combo++;
        int multiplier = (1 + (combo ~/ 3)).clamp(1, 5);
        score += 500 * multiplier;
        if (combo % 5 == 0) wave++;
        
        // Fire laser and destroy asteroid
        lasers.add(Laser(life: 1.0));
        if (asteroids.isNotEmpty) {
          final target = asteroids.first;
          explosions.add(Explosion(x: target.x, y: target.y, life: 1.0));
          asteroids.removeAt(0);
        }
        
        if (qIndex >= questions.length) {
          gameState = "WIN";
        }
      });
    } else {
      setState(() {
        combo = 0;
        shields--;
        if (shields <= 0) {
          gameState = "GAMEOVER";
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF020617),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (gameState == "MENU") return _buildMenu();
    if (gameState == "LOADING") return _buildLoading();
    if (gameState == "WIN") return _buildWin();
    if (gameState == "GAMEOVER") return _buildGameOver();
    return _buildGame();
  }

  Widget _buildMenu() {
    return Container(
      decoration: const BoxDecoration(
        gradient: RadialGradient(colors: [Color(0xFF0C1445), Color(0xFF020617)]),
      ),
      child: Stack(
        children: [
          const StarfieldBackground(),
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(onPressed: widget.onBack, icon: const Icon(LucideIcons.arrowLeft, color: Colors.cyanAccent)),
                const Text("🚀", style: TextStyle(fontSize: 100)),
                Text(
                  "SPACE DEFENDER",
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 40, fontWeight: FontWeight.w900, color: Colors.cyanAccent,
                    shadows: [const Shadow(color: Colors.cyanAccent, blurRadius: 20)],
                  ),
                ),
                const SizedBox(height: 40),
                Container(
                  constraints: BoxConstraints(maxWidth: 400),
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    children: exams.map((ex) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.indigo.withOpacity(0.3),
                          foregroundColor: Colors.cyanAccent,
                          padding: const EdgeInsets.all(20),
                          side: const BorderSide(color: Colors.cyanAccent),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                        ),
                        onPressed: () => startGame(ex as Map<String, dynamic>),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(ex['name'] ?? ""),
                            const Icon(LucideIcons.play),
                          ],
                        ),
                      ),
                    )).toList(),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoading() {
    return const Center(child: Text(" Warp Speed... ⚡", style: TextStyle(color: Colors.cyanAccent, fontSize: 30, fontWeight: FontWeight.bold)));
  }

  Widget _buildWin() {
    return Container(
      color: Colors.black,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text("🏆", style: TextStyle(fontSize: 100)),
            Text("GALAXY SAVED!", style: GoogleFonts.plusJakartaSans(fontSize: 40, fontWeight: FontWeight.w900, color: Colors.cyanAccent)),
            Text("Score: $score", style: const TextStyle(fontSize: 30, color: Colors.white, fontWeight: FontWeight.bold)),
            const SizedBox(height: 40),
            ElevatedButton(onPressed: () => startGame(selectedExam!), child: const Text("New Mission")),
            TextButton(onPressed: widget.onBack, child: const Text("Back", style: TextStyle(color: Colors.white))),
          ],
        ),
      ),
    );
  }

  Widget _buildGameOver() {
    return Container(
      color: Colors.red[900],
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text("💥", style: TextStyle(fontSize: 100)),
            Text("SHIP DESTROYED!", style: GoogleFonts.plusJakartaSans(fontSize: 40, fontWeight: FontWeight.w900, color: Colors.white)),
            const SizedBox(height: 40),
            ElevatedButton(onPressed: () => startGame(selectedExam!), child: const Text("Retry")),
            TextButton(onPressed: widget.onBack, child: const Text("Abort", style: TextStyle(color: Colors.white))),
          ],
        ),
      ),
    );
  }

  Widget _buildGame() {
    final currentQ = questions[qIndex % questions.length];
    return Column(
      children: [
        // Game Viewport
        Expanded(
          flex: 6,
          child: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(colors: [Color(0xFF020617), Color(0xFF0C1445)], begin: Alignment.topCenter, end: Alignment.bottomCenter),
            ),
            child: Stack(
              children: [
                const StarfieldBackground(),
                CustomPaint(
                  size: Size.infinite,
                  painter: GameAreaPainter(asteroids, lasers, explosions),
                ),
                _buildHUD(),
              ],
            ),
          ),
        ),
        // Question Area
        Expanded(
          flex: 4,
          child: Container(
            padding: const EdgeInsets.all(20),
            color: const Color(0xFF020617),
            child: _buildQuestionArea(currentQ),
          ),
        ),
      ],
    );
  }

  Widget _buildHUD() {
    return Positioned(
      top: 40, left: 20, right: 20,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(children: List.generate(3, (i) => Icon(LucideIcons.shield, color: i < shields ? Colors.cyanAccent : Colors.grey, size: 28))),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(score.toString(), style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
              if (combo > 0) Text("🔥 $combo x Combo", style: const TextStyle(color: Colors.orangeAccent, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuestionArea(dynamic q) {
    List options = q['options'] ?? [];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(q['question'] ?? "", style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 20),
        Expanded(
          child: ListView.builder(
            itemCount: options.length,
            itemBuilder: (context, i) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: ListTile(
                onTap: () => handleAnswer(i),
                tileColor: Colors.indigo.withOpacity(0.2),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15), side: const BorderSide(color: Colors.cyanAccent, width: 0.5)),
                title: Text(options[i], style: const TextStyle(color: Colors.white)),
                leading: Text(String.fromCharCode(65 + i), style: const TextStyle(color: Colors.cyanAccent, fontWeight: FontWeight.bold)),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class Asteroid {
  final int id;
  double x, y, size, speed;
  bool isAlien;
  Asteroid({required this.id, required this.x, required this.y, required this.size, required this.speed, required this.isAlien});
}

class Laser { double life; Laser({required this.life}); }
class Explosion { double x, y, life; Explosion({required this.x, required this.y, required this.life}); }

class GameAreaPainter extends CustomPainter {
  final List<Asteroid> asteroids;
  final List<Laser> lasers;
  final List<Explosion> explosions;
  GameAreaPainter(this.asteroids, this.lasers, this.explosions);

  @override
  void paint(Canvas canvas, Size size) {
    for (var a in asteroids) {
      _drawEmoji(canvas, a.isAlien ? "👾" : "☄️", Offset(a.x * size.width, a.y * size.height), a.size);
    }
    for (var l in lasers) {
      Paint laserPaint = Paint()..color = Colors.cyanAccent.withOpacity(l.life)..strokeWidth = 4;
      canvas.drawLine(Offset(size.width / 2, size.height * 0.9), Offset(size.width / 2, size.height * (0.9 - (1.0 - l.life)*5)), laserPaint);
    }
    for (var e in explosions) {
      _drawEmoji(canvas, "💥", Offset(e.x * size.width, e.y * size.height), 50 * e.life);
    }
    _drawEmoji(canvas, "🚀", Offset(size.width / 2, size.height * 0.9), 80);
  }

  void _drawEmoji(Canvas canvas, String emoji, Offset center, double size) {
    final tp = TextPainter(text: TextSpan(text: emoji, style: TextStyle(fontSize: size)), textDirection: TextDirection.ltr)..layout();
    tp.paint(canvas, Offset(center.dx - tp.width/2, center.dy - tp.height/2));
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => true;
}

class StarfieldBackground extends StatelessWidget {
  const StarfieldBackground({super.key});
  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size.infinite,
      painter: StarPainter(),
    );
  }
}

class StarPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final rand = Random(42);
    Paint starPaint = Paint()..color = Colors.white.withOpacity(0.5);
    for (int i = 0; i < 100; i++) {
      canvas.drawCircle(Offset(rand.nextDouble() * size.width, rand.nextDouble() * size.height), rand.nextDouble() * 2, starPaint);
    }
  }
  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
