import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:dio/dio.dart';
import 'package:examprep_app/core/api/dio_client.dart';

class TrainExpressGame extends ConsumerStatefulWidget {
  final VoidCallback onBack;
  const TrainExpressGame({super.key, required this.onBack});

  @override
  ConsumerState<TrainExpressGame> createState() => _TrainExpressGameState();
}

class _TrainExpressGameState extends ConsumerState<TrainExpressGame> with TickerProviderStateMixin {
  List<dynamic> exams = [];
  List<dynamic> questions = [];
  int qIndex = 0;
  double journey = 0; // 0.0 - 100.0
  double speed = 0;
  int score = 0;
  String gameState = "MENU"; // MENU, LOADING, PLAYING, WIN
  
  late AnimationController _trainBobController;
  late AnimationController _smokeController;
  late AnimationController _bgScrollController;
  

  Map<String, dynamic>? selectedExam;

  @override
  void initState() {
    super.initState();
    fetchExams();
    _trainBobController = AnimationController(vsync: this, duration: const Duration(milliseconds: 600))..repeat(reverse: true);
    _smokeController = AnimationController(vsync: this, duration: const Duration(seconds: 1))..repeat();
    _bgScrollController = AnimationController(vsync: this, duration: const Duration(seconds: 10))..repeat();
  }

  @override
  void dispose() {
    _trainBobController.dispose();
    _smokeController.dispose();
    _bgScrollController.dispose();
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
        qIndex = 0;
        journey = 0;
        score = 0;
        speed = 0;
        gameState = "PLAYING";
      });
    } catch (e) {
      setState(() => gameState = "MENU");
    }
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
      double advance = Random().nextDouble() * 8 + 8; // 8-15
      setState(() {
        journey = (journey + advance).clamp(0, 100.0);
        speed = (speed + 20).clamp(0, 180.0);
        score += (advance * 100).toInt();
        if (journey >= 100) {
          Future.delayed(const Duration(milliseconds: 800), () {
            if (mounted) setState(() => gameState = "WIN");
          });
        }
      });
    } else {
      setState(() {
        speed = (speed - 30).clamp(0, 180.0);
      });
    }
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
        gradient: LinearGradient(colors: [Color(0xFF0F172A), Color(0xFF1E3A5F), Color(0xFF0F172A)]),
      ),
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(onPressed: widget.onBack, icon: const Icon(LucideIcons.arrowLeft, color: Colors.blueAccent)),
              const Text("🚂", style: TextStyle(fontSize: 100)),
              Text("TRAIN EXPRESS", style: GoogleFonts.plusJakartaSans(fontSize: 48, fontWeight: FontWeight.w900, color: Colors.blueAccent)),
              const SizedBox(height: 40),
              Container(
                constraints: BoxConstraints(maxWidth: 400),
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  children: exams.map((ex) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue.withOpacity(0.1),
                        foregroundColor: Colors.blueAccent,
                        padding: const EdgeInsets.all(20),
                        side: const BorderSide(color: Colors.blueAccent),
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
      color: const Color(0xFF0F172A),
      child: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text("🚂", style: TextStyle(fontSize: 60)),
            SizedBox(height: 20),
            Text("Boarding passengers...", style: TextStyle(color: Colors.blueAccent, fontSize: 24, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildWin() {
    return Container(
      decoration: const BoxDecoration(
        gradient: RadialGradient(colors: [Color(0xFF1E3A5F), Color(0xFF0F172A)]),
      ),
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text("🏁", style: TextStyle(fontSize: 100)),
              Text("ARRIVED!", style: GoogleFonts.plusJakartaSans(fontSize: 60, fontWeight: FontWeight.w900, color: Colors.blueAccent)),
              Text("Score: $score", style: const TextStyle(fontSize: 30, color: Colors.white, fontWeight: FontWeight.bold)),
              const SizedBox(height: 40),
              ElevatedButton(onPressed: () => startGame(selectedExam!), child: const Text("New Journey")),
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
      backgroundColor: const Color(0xFF0F172A),
      body: Column(
        children: [
          // Background/Train Area
          Expanded(
            flex: 5,
            child: Stack(
              children: [
                _buildParallaxBackground(),
                _buildHUD(),
                _buildTrain(),
                _buildDestinationFlag(),
              ],
            ),
          ),
          // Progress Bar
          _buildJourneyStatus(),
          // Question Area
          Expanded(
            flex: 4,
            child: Container(
              padding: const EdgeInsets.all(20),
              child: _buildQuestionArea(currentQ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildParallaxBackground() {
    return AnimatedBuilder(
      animation: _bgScrollController,
      builder: (context, child) {
        double offset = _bgScrollController.value * speed;
        return Stack(
          children: [
            // Sky
            Container(decoration: const BoxDecoration(gradient: LinearGradient(colors: [Color(0xFF0C1445), Color(0xFF2563EB)], begin: Alignment.topCenter, end: Alignment.bottomCenter))),
            // Clouds (Very slow)
            _buildLayer("☁️", offset * 0.1, 50, 20),
            // Mountains (Slow)
            _buildLayer("⛰️", offset * 0.3, 150, 60),
            // Trees (Faster)
            _buildLayer("🌲", offset * 0.8, 200, 100),
            // Ground/Track
            Positioned(
              bottom: 0, left: 0, right: 0, height: 40,
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.grey[900],
                  border: const Border(top: BorderSide(color: Colors.grey, width: 2)),
                ),
                child: CustomPaint(painter: TrackPainter(offset * 2)),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildLayer(String emoji, double offset, double yOffset, double fontSize) {
    return Positioned(
      bottom: yOffset,
      left: 0, right: 0,
      child: Transform.translate(
        offset: Offset(-(offset % 400), 0),
        child: Row(
          children: List.generate(5, (i) => SizedBox(
            width: 400,
            child: Text(emoji * 10, style: TextStyle(fontSize: fontSize, color: Colors.white.withOpacity(0.3))),
          )),
        ),
      ),
    );
  }

  Widget _buildHUD() {
    return Positioned(
      top: 20, right: 20,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(15), border: Border.all(color: Colors.blueAccent)),
            child: Text("${speed.toInt()} km/h", style: const TextStyle(color: Colors.blueAccent, fontSize: 24, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(15), border: Border.all(color: Colors.yellowAccent)),
            child: Text("\$${score.toString()}", style: const TextStyle(color: Colors.yellowAccent, fontSize: 20, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildTrain() {
    return Positioned(
      bottom: 25, left: 50,
      child: AnimatedBuilder(
        animation: _trainBobController,
        builder: (context, child) {
          return Transform.translate(
            offset: Offset(0, -_trainBobController.value * 5),
            child: const Text("🚂", style: TextStyle(fontSize: 80)),
          );
        },
      ),
    );
  }

  Widget _buildDestinationFlag() {
    double flagPos = 400 - (journey * 4); // Simplified positioning
    return Positioned(
      bottom: 40, right: flagPos,
      child: Column(
        children: [
          Text("🏁", style: TextStyle(fontSize: 40)),
          Container(width: 4, height: 100, color: Colors.blueAccent),
        ],
      ),
    );
  }

  Widget _buildJourneyStatus() {
    return Container(
      color: Colors.black45,
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("🚉 Start", style: TextStyle(color: Colors.blueAccent)),
              Text("${journey.toInt()}% Complete", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              const Text("🏁 Goal", style: TextStyle(color: Colors.blueAccent)),
            ],
          ),
          const SizedBox(height: 8),
          LinearProgressIndicator(
            value: journey / 100,
            backgroundColor: Colors.blue.withOpacity(0.1),
            valueColor: const AlwaysStoppedAnimation(Colors.blueAccent),
            minHeight: 12,
          ),
        ],
      ),
    );
  }

  Widget _buildQuestionArea(dynamic q) {
    List options = q['options'] ?? [];
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.blue.withOpacity(0.05), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.blueAccent.withOpacity(0.3))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(q['question'] ?? "", style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),
          ...options.asMap().entries.map((entry) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: InkWell(
              onTap: () => handleAnswer(entry.key),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.blue.withOpacity(0.1), border: Border.all(color: Colors.blueAccent), borderRadius: BorderRadius.circular(12)),
                child: Row(
                  children: [
                    Text("${String.fromCharCode(65 + entry.key)}. ", style: const TextStyle(color: Colors.blueAccent, fontWeight: FontWeight.bold)),
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
}

class TrackPainter extends CustomPainter {
  final double offset;
  TrackPainter(this.offset);

  @override
  void paint(Canvas canvas, Size size) {
    Paint trackPaint = Paint()..color = Colors.white24..strokeWidth = 2;
    for (double x = -(offset % 100); x < size.width; x += 100) {
      canvas.drawLine(Offset(x, 10), Offset(x + 50, 40), trackPaint);
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => true;
}
