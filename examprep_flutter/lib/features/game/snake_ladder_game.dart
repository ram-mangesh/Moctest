import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:dio/dio.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:examprep_app/core/api/dio_client.dart';

// --- DATA STRUCTURES ---

final ladders = {
  4: 25,
  9: 31,
  20: 38,
  28: 84,
  40: 59,
  51: 67,
  63: 81,
  71: 91,
};

final snakes = {
  17: 7,
  54: 34,
  62: 19,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  99: 78,
};

// --- LOGIC HELPER ---

Map<String, int> posToRC(int pos) {
  int idx = pos - 1;
  int row = idx ~/ 10;
  int col = (row % 2 == 0) ? (idx % 10) : (9 - (idx % 10));
  return {'row': 9 - row, 'col': col};
}

class SnakeLadderGame extends ConsumerStatefulWidget {
  final VoidCallback onBack;
  const SnakeLadderGame({super.key, required this.onBack});

  @override
  ConsumerState<SnakeLadderGame> createState() => _SnakeLadderGameState();
}

class _SnakeLadderGameState extends ConsumerState<SnakeLadderGame> with TickerProviderStateMixin {
  List<dynamic> exams = [];
  List<dynamic> questions = [];
  int qIndex = 0;
  int playerPos = 1;
  String gameState = "MENU"; // MENU, LOADING, PLAYING, WIN
  String message = "🎲 Roll! Answer to move.";
  Color msgColor = Colors.indigoAccent;
  int score = 0;
  bool isAnimating = false;
  Map<String, dynamic>? selectedExam;



  @override
  void initState() {
    super.initState();
    fetchExams();
  }

  Future<void> fetchExams() async {
    try {
      final dio = ref.read(dioClientProvider);
      final res = await dio.get("/user/exams");
      setState(() {
        exams = res.data ?? [];
      });
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
        questions = qs.take(30).toList();
        qIndex = 0;
        playerPos = 1;
        score = 0;
        message = "🎲 Game Started! Reach 100 to win.";
        msgColor = Colors.indigoAccent;
        gameState = "PLAYING";
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Error fetching questions")));
      setState(() => gameState = "MENU");
    }
  }

  void handleAnswer(int choiceIdx) {
    if (gameState != "PLAYING") return;
    final q = questions[qIndex % questions.length];
    
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

    int steps = isCorrect ? Random().nextInt(4) + 3 : -(Random().nextInt(3) + 1);
    int newPos = (playerPos + steps).clamp(1, 100);

    setState(() {
      isAnimating = true;
      qIndex++;
    });

    String extraMsg = "";
    if (isCorrect) {
      score += 100;
      if (ladders.containsKey(newPos)) {
        extraMsg = " 🪜 LADDER! Climbed to ${ladders[newPos]}!";
        newPos = ladders[newPos]!;
      }
      message = "✅ Correct! +${steps.abs()} steps$extraMsg";
      msgColor = Colors.greenAccent;
    } else {
      if (snakes.containsKey(newPos)) {
        extraMsg = " 🐍 SNAKE! Slid to ${snakes[newPos]}!";
        newPos = snakes[newPos]!;
      }
      message = "❌ Wrong! -${steps.abs()} steps$extraMsg";
      msgColor = Colors.redAccent;
    }

    Future.delayed(const Duration(milliseconds: 800), () {
      if (mounted) {
        setState(() {
          playerPos = newPos;
          isAnimating = false;
          if (playerPos >= 100) {
            gameState = "WIN";
          }
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (gameState == "MENU") return _buildMenu();
    if (gameState == "LOADING") return _buildLoading();
    if (gameState == "WIN") return _buildWin();
    return _buildGame();
  }

  Widget _buildMenu() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF1E1B4B), Color(0xFF312E81), Color(0xFF4C1D95)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                onPressed: widget.onBack,
                icon: const Icon(LucideIcons.arrowLeft, color: Colors.indigoAccent),
                alignment: Alignment.topLeft,
              ),
              Text("🐍🪜", style: const TextStyle(fontSize: 80)),
              Text(
                "SNAKES & LADDERS",
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 40,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  shadows: [const Shadow(color: Colors.indigoAccent, blurRadius: 20)],
                ),
              ),
              const SizedBox(height: 10),
              Text(
                "Answer correctly → Climb the ladder!",
                style: GoogleFonts.plusJakartaSans(color: Colors.indigoAccent, fontWeight: FontWeight.bold),
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
                        backgroundColor: Colors.indigo.withOpacity(0.6),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.all(20),
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
      ),
    );
  }

  Widget _buildLoading() {
    return Container(
      color: const Color(0xFF1E1B4B),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text("🎲", style: TextStyle(fontSize: 60)).animate().shake(),
            const SizedBox(height: 20),
            const Text("Setting up board...", style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildWin() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(colors: [Color(0xFF064E3B), Color(0xFF065F46)]),
      ),
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text("🏆", style: TextStyle(fontSize: 100)),
              Text("YOU WIN!", style: GoogleFonts.plusJakartaSans(fontSize: 60, fontWeight: FontWeight.w900, color: Colors.yellowAccent)),
              Text("Score: $score", style: const TextStyle(fontSize: 30, color: Colors.white, fontWeight: FontWeight.bold)),
              const SizedBox(height: 40),
              ElevatedButton(
                onPressed: () => startGame(selectedExam!),
                child: const Text("Play Again"),
              ),
              TextButton(onPressed: widget.onBack, child: const Text("Back to Arcade", style: TextStyle(color: Colors.white))),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGame() {
    final currentQ = questions[qIndex % questions.length];
    return Scaffold(
      backgroundColor: const Color(0xFF1E1B4B),
      body: Row(
        children: [
          // Board Left
          Expanded(
            flex: 6,
            child: SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Row(
                      children: [
                        IconButton(onPressed: widget.onBack, icon: const Icon(LucideIcons.arrowLeft, color: Colors.white)),
                        Text("Snake & Ladder", style: GoogleFonts.plusJakartaSans(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 10),
                    _buildBoard(),
                    const SizedBox(height: 20),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: msgColor.withOpacity(0.2),
                        border: Border.all(color: msgColor),
                        borderRadius: BorderRadius.circular(15),
                      ),
                      child: Text(message, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                    ),
                  ],
                ),
              ),
            ),
          ),
          // Questions Right
          Expanded(
            flex: 4,
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.3),
                border: const Border(left: BorderSide(color: Colors.white10)),
              ),
              child: Column(
                children: [
                  Text("Question ${qIndex + 1}", style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 20),
                  _buildQuestion(currentQ),
                  const Spacer(),
                  _buildProgressBar(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBoard() {
    return AspectRatio(
      aspectRatio: 1,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.indigoAccent, width: 4),
        ),
        child: Stack(
          children: [
            CustomPaint(
              size: Size.infinite,
              painter: BoardPainter(playerPos),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuestion(dynamic q) {
    List options = q['options'] ?? [];
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white24),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(q['question'] ?? "", style: const TextStyle(color: Colors.white, fontSize: 16)),
          const SizedBox(height: 20),
          ...options.asMap().entries.map((entry) => Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: InkWell(
              onTap: () => handleAnswer(entry.key),
              child: Container(
                padding: const EdgeInsets.all(15),
                decoration: BoxDecoration(
                  color: Colors.indigo.withOpacity(0.2),
                  border: Border.all(color: Colors.indigoAccent),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  children: [
                    Text("${String.fromCharCode(65 + entry.key)}. ", style: const TextStyle(color: Colors.indigoAccent, fontWeight: FontWeight.bold)),
                    Expanded(child: Text(entry.value, style: const TextStyle(color: Colors.white))),
                  ],
                ),
              ),
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildProgressBar() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text("Progress", style: TextStyle(color: Colors.white70)),
            Text("$playerPos%", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 10),
        LinearProgressIndicator(
          value: playerPos / 100,
          backgroundColor: Colors.white10,
          valueColor: const AlwaysStoppedAnimation(Colors.pinkAccent),
          minHeight: 10,
        ),
      ],
    );
  }
}

class BoardPainter extends CustomPainter {
  final int playerPos;
  BoardPainter(this.playerPos);

  @override
  void paint(Canvas canvas, Size size) {
    double cellSize = size.width / 10;
    Paint cellPaint = Paint()..style = PaintingStyle.fill;
    Paint borderPaint = Paint()..color = Colors.black12..style = PaintingStyle.stroke..strokeWidth = 0.5;

    // Draw grid
    for (int pos = 1; pos <= 100; pos++) {
      var rc = posToRC(pos);
      double x = rc['col']! * cellSize;
      double y = rc['row']! * cellSize;

      cellPaint.color = (pos % 2 == 0) ? const Color(0xFFE0E7EF) : const Color(0xFFF8FAFC);
      if (ladders.containsKey(pos)) cellPaint.color = const Color(0xFFBBF7D0);
      if (snakes.containsKey(pos)) cellPaint.color = const Color(0xFFFECACA);

      canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(x, y, cellSize, cellSize), const Radius.circular(4)), cellPaint);
      canvas.drawRect(Rect.fromLTWH(x, y, cellSize, cellSize), borderPaint);

      final textSpan = TextSpan(
        text: pos.toString(),
        style: const TextStyle(color: Colors.grey, fontSize: 8),
      );
      final textPainter = TextPainter(text: textSpan, textDirection: TextDirection.ltr);
      textPainter.layout();
      textPainter.paint(canvas, Offset(x + 2, y + 2));
      
      if (ladders.containsKey(pos)) {
        _drawIcon(canvas, "🪜", Offset(x + cellSize/2, y + cellSize/2), cellSize);
      }
      if (snakes.containsKey(pos)) {
        _drawIcon(canvas, "🐍", Offset(x + cellSize/2, y + cellSize/2), cellSize);
      }
    }

    // Draw player
    var playerRC = posToRC(playerPos);
    double px = playerRC['col']! * cellSize + cellSize/2;
    double py = playerRC['row']! * cellSize + cellSize/2;

    Paint playerPaint = Paint()..color = Colors.indigo..style = PaintingStyle.fill;
    canvas.drawCircle(Offset(px, py), cellSize * 0.35, playerPaint);
    _drawIcon(canvas, "🧑", Offset(px, py + 2), cellSize * 1.2);
  }

  void _drawIcon(Canvas canvas, String icon, Offset center, double size) {
    final textSpan = TextSpan(
        text: icon,
        style: TextStyle(fontSize: size * 0.5),
      );
      final textPainter = TextPainter(text: textSpan, textDirection: TextDirection.ltr);
      textPainter.layout();
      textPainter.paint(canvas, Offset(center.dx - textPainter.width/2, center.dy - textPainter.height/2));
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => true;
}
