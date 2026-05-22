import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:dio/dio.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:examprep_app/core/api/dio_client.dart';

class MagicPotionGame extends ConsumerStatefulWidget {
  final VoidCallback onBack;
  const MagicPotionGame({super.key, required this.onBack});

  @override
  ConsumerState<MagicPotionGame> createState() => _MagicPotionGameState();
}

class _MagicPotionGameState extends ConsumerState<MagicPotionGame> with TickerProviderStateMixin {
  String gameState = "MENU"; // MENU, LOADING, PLAYING, WIN
  double potionLevel = 0; // 0.0 - 100.0
  int potionStage = 0;
  int score = 0;
  int combo = 0;
  int qIndex = 0;
  List<dynamic> questions = [];
  List<dynamic> exams = [];
  Map<String, dynamic>? selectedExam;


  
  List<Particle> bubbles = [];
  List<FallingIngredient> ingredients = [];
  Timer? bubbleTimer;

  final List<Map<String, dynamic>> potionColors = [
    {'name': "Love Potion", 'liquid': Color(0xFFEC4899), 'glow': Color(0xFFF9A8D4)},
    {'name': "Dream Spell", 'liquid': Color(0xFFA855F7), 'glow': Color(0xFFD8B4FE)},
    {'name': "Ice Crystal", 'liquid': Color(0xFF0EA5E9), 'glow': Color(0xFF93C5FD)},
    {'name': "Forest Magic", 'liquid': Color(0xFF10B981), 'glow': Color(0xFF34D399)},
    {'name': "Sun Charm", 'liquid': Color(0xFFF59E0B), 'glow': Color(0xFFFDE68A)},
    {'name': "Phoenix Flame", 'liquid': Color(0xFFF43F5E), 'glow': Color(0xFFFDA4AF)},
  ];

  @override
  void initState() {
    super.initState();
    fetchExams();
  }

  @override
  void dispose() {
    bubbleTimer?.cancel();
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
        questions = qs.take(20).toList();
        qIndex = 0; score = 0; combo = 0;
        potionLevel = 0; potionStage = 0;
        gameState = "PLAYING";
      });
      startBubbling();
    } catch (e) {
      setState(() => gameState = "MENU");
    }
  }

  void startBubbling() {
    bubbleTimer = Timer.periodic(const Duration(milliseconds: 200), (t) {
      if (gameState == "PLAYING" && potionLevel > 5) {
        setState(() {
          bubbles.add(Particle(
            x: Random().nextDouble() * 0.4 + 0.3,
            y: 0.7,
            life: 1.0,
            speed: Random().nextDouble() * 0.02 + 0.01,
          ));
          bubbles.removeWhere((b) => b.life <= 0);
          for (var b in bubbles) {
            b.y -= b.speed;
            b.life -= 0.02;
          }
        });
      }
      if (ingredients.isNotEmpty) {
        setState(() {
          for (var i in ingredients) {
            i.y += 0.03;
            i.life -= 0.02;
          }
          ingredients.removeWhere((i) => i.life <= 0);
        });
      }
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
        double gain = Random().nextDouble() * 5 + 5;
        potionLevel = (potionLevel + gain).clamp(0, 100).toDouble();
        potionStage = (potionLevel / 17).floor().clamp(0, 5);
        score += 300 * (combo >= 3 ? 2 : 1);
        
        ingredients.add(FallingIngredient(
          emoji: ["🌸", "⭐", "🦋", "🌙", "💎", "🌈", "✨", "🍄"][Random().nextInt(8)],
          x: 0.5, y: -0.1, life: 1.0,
        ));

        if (potionLevel >= 100) {
          gameState = "WIN";
        }
      });
    } else {
      setState(() {
        combo = 0;
        potionLevel = (potionLevel - 10).clamp(0, 100).toDouble();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1A0533),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (gameState == "MENU") return _buildMenu();
    if (gameState == "LOADING") return _buildLoading();
    if (gameState == "WIN") return _buildWin();
    return _buildGame();
  }

  Widget _buildMenu() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(colors: [Color(0xFF1A0533), Color(0xFF2D0A4E)]),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            IconButton(onPressed: widget.onBack, icon: const Icon(LucideIcons.arrowLeft, color: Colors.pinkAccent)),
            const Text("🔮", style: TextStyle(fontSize: 100)),
            Text(
              "MAGIC POTION",
              style: GoogleFonts.plusJakartaSans(
                fontSize: 40, fontWeight: FontWeight.w900, color: Colors.pinkAccent,
                shadows: [const Shadow(color: Colors.pinkAccent, blurRadius: 20)],
              ),
            ),
            const SizedBox(height: 10),
            const Text("WITCH'S CAULDRON", style: TextStyle(color: Colors.white54, letterSpacing: 2)),
            const SizedBox(height: 40),
            Container(
              constraints: BoxConstraints(maxWidth: 400),
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                children: exams.map((ex) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.purple.withOpacity(0.2),
                      foregroundColor: Colors.pinkAccent,
                      padding: const EdgeInsets.all(20),
                      side: const BorderSide(color: Colors.pinkAccent),
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
    );
  }

  Widget _buildLoading() {
    return const Center(child: Text("Mixing Spells... ✨", style: TextStyle(color: Colors.pinkAccent, fontSize: 30, fontWeight: FontWeight.bold)));
  }

  Widget _buildWin() {
    return Container(
      color: Colors.black,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text("✨", style: TextStyle(fontSize: 100)),
            Text("SPELL BREWED!", style: GoogleFonts.plusJakartaSans(fontSize: 40, fontWeight: FontWeight.w900, color: Colors.pinkAccent)),
            Text(potionColors[potionStage]['name'], style: const TextStyle(fontSize: 24, color: Colors.yellowAccent)),
            const SizedBox(height: 40),
            ElevatedButton(onPressed: () => startGame(selectedExam!), child: const Text("Brew Again")),
            TextButton(onPressed: widget.onBack, child: const Text("Leave Village", style: TextStyle(color: Colors.white))),
          ],
        ),
      ),
    );
  }

  Widget _buildGame() {
    final currentQ = questions[qIndex % questions.length];
    final pc = potionColors[potionStage];

    return Column(
      children: [
        // Cauldron Area
        Expanded(
          flex: 4,
          child: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(colors: [Color(0xFF1A0533), Color(0xFF0F062A)], begin: Alignment.topCenter, end: Alignment.bottomCenter),
            ),
            child: Stack(
              children: [
                _buildHUD(pc),
                Center(
                  child: CustomPaint(
                    size: const Size(200, 220),
                    painter: CauldronPainter(potionLevel, pc['liquid'], pc['glow'], bubbles, ingredients),
                  ),
                ),
                _buildProgress(pc),
              ],
            ),
          ),
        ),
        // Question Area
        Expanded(
          flex: 6,
          child: Container(
            padding: const EdgeInsets.all(20),
            child: _buildQuestionArea(currentQ, pc),
          ),
        ),
      ],
    );
  }

  Widget _buildHUD(Map<String, dynamic> pc) {
    return Positioned(
      top: 40, left: 20, right: 20,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(onPressed: widget.onBack, icon: const Icon(LucideIcons.arrowLeft, color: Colors.purpleAccent)),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(pc['name'], style: TextStyle(color: pc['glow'], fontWeight: FontWeight.bold, letterSpacing: 1.5)),
              Text("${score.toString()} ⭐", style: const TextStyle(color: Colors.yellowAccent, fontSize: 24, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildProgress(Map<String, dynamic> pc) {
    return Positioned(
      bottom: 10, left: 40, right: 40,
      child: Column(
        children: [
          Text("${potionLevel.toInt()}% Brewed", style: TextStyle(color: pc['glow'], fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          LinearProgressIndicator(
            value: potionLevel / 100,
            backgroundColor: Colors.white10,
            valueColor: AlwaysStoppedAnimation(pc['liquid']),
            minHeight: 10,
          ),
        ],
      ),
    );
  }

  Widget _buildQuestionArea(dynamic q, Map<String, dynamic> pc) {
    List options = q['options'] ?? [];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(q['question'] ?? "", style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 24),
        Expanded(
          child: ListView.builder(
            itemCount: options.length,
            itemBuilder: (context, i) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: ListTile(
                onTap: () => handleAnswer(i),
                tileColor: pc['liquid'].withOpacity(0.1),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15), side: BorderSide(color: pc['liquid'], width: 1)),
                title: Text(options[i], style: const TextStyle(color: Colors.white)),
                leading: Text(String.fromCharCode(65 + i), style: TextStyle(color: pc['glow'], fontWeight: FontWeight.bold)),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class Particle { double x, y, life, speed; Particle({required this.x, required this.y, required this.life, required this.speed}); }
class FallingIngredient { String emoji; double x, y, life; FallingIngredient({required this.emoji, required this.x, required this.y, required this.life}); }

class CauldronPainter extends CustomPainter {
  final double level;
  final Color liquidColor;
  final Color glowColor;
  final List<Particle> bubbles;
  final List<FallingIngredient> ingredients;

  CauldronPainter(this.level, this.liquidColor, this.glowColor, this.bubbles, this.ingredients);

  @override
  void paint(Canvas canvas, Size size) {
    double cx = size.width / 2;
    double cy = size.height / 2;
    
    // Body
    Paint bodyPaint = Paint()..color = const Color(0xFF1E1B4B);
    canvas.drawOval(Rect.fromCenter(center: Offset(cx, cy + 50), width: 140, height: 160), bodyPaint);
    
    // Liquid
    if (level > 0) {
      double lHeight = (level / 100) * 120;
      Paint liquidPaint = Paint()..color = liquidColor.withOpacity(0.8);
      canvas.drawRect(Rect.fromLTWH(cx - 50, cy + 90 - lHeight, 100, lHeight), liquidPaint);
    }
    
    // Rim
    Paint rimPaint = Paint()..color = const Color(0xFF312E81)..style = PaintingStyle.stroke..strokeWidth = 8;
    canvas.drawOval(Rect.fromCenter(center: Offset(cx, cy - 20), width: 140, height: 40), rimPaint);
    
    // Particles
    for (var b in bubbles) {
      Paint bPaint = Paint()..color = glowColor.withOpacity(b.life);
      canvas.drawCircle(Offset(b.x * size.width, (0.5 + b.y * 0.4) * size.height), 4, bPaint);
    }
    
    for (var i in ingredients) {
      _drawEmoji(canvas, i.emoji, Offset(i.x * size.width, i.y * size.height), 40);
    }
  }

  void _drawEmoji(Canvas canvas, String emoji, Offset center, double size) {
    final tp = TextPainter(text: TextSpan(text: emoji, style: TextStyle(fontSize: size)), textDirection: TextDirection.ltr)..layout();
    tp.paint(canvas, Offset(center.dx - tp.width/2, center.dy - tp.height/2));
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => true;
}
