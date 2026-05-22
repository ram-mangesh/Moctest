import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:dio/dio.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:examprep_app/core/api/dio_client.dart';

class HeistMasterGame extends ConsumerStatefulWidget {
  final VoidCallback onBack;
  const HeistMasterGame({super.key, required this.onBack});

  @override
  ConsumerState<HeistMasterGame> createState() => _HeistMasterGameState();
}

class _HeistMasterGameState extends ConsumerState<HeistMasterGame> with TickerProviderStateMixin {
  final int totalTumblers = 6;
  List<bool> tumblers = List.filled(6, false);
  String gameState = "MENU"; // MENU, LOADING, PLAYING, ALARM, WIN, DEAD
  int alarmCount = 0;
  int score = 0;
  int timer = 90;
  int qIndex = 0;
  List<dynamic> questions = [];
  List<dynamic> exams = [];
  int? spinningTumbler;
  Timer? gameTimer;
  Map<String, dynamic>? selectedExam;



  @override
  void initState() {
    super.initState();
    fetchExams();
  }

  @override
  void dispose() {
    gameTimer?.cancel();
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
        tumblers = List.filled(6, false);
        alarmCount = 0;
        score = 0;
        timer = 90;
        gameState = "PLAYING";
      });
      startTimer();
    } catch (e) {
      setState(() => gameState = "MENU");
    }
  }

  void startTimer() {
    gameTimer?.cancel();
    gameTimer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (timer <= 1) {
        t.cancel();
        setState(() => gameState = "DEAD");
      } else if (gameState == "PLAYING") {
        setState(() => timer--);
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
      int nextIdx = tumblers.indexOf(false);
      if (nextIdx == -1) {
        setState(() => gameState = "WIN");
        return;
      }

      setState(() {
        spinningTumbler = nextIdx;
        score += (timer * 10).toInt();
      });

      Future.delayed(const Duration(milliseconds: 700), () {
        if (mounted) {
          setState(() {
            tumblers[nextIdx] = true;
            spinningTumbler = null;
            if (tumblers.every((t) => t)) {
              gameState = "WIN";
            }
          });
        }
      });
    } else {
      setState(() {
        alarmCount++;
        timer = (timer - 10).clamp(0, 90);
        gameState = "ALARM";
      });
      Future.delayed(const Duration(seconds: 1), () {
        if (mounted) {
          if (alarmCount >= 3) {
            setState(() => gameState = "DEAD");
          } else {
            setState(() => gameState = "PLAYING");
          }
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (gameState == "MENU") return _buildMenu();
    if (gameState == "LOADING") return _buildLoading();
    if (gameState == "WIN") return _buildWin();
    if (gameState == "DEAD") return _buildDead();
    return _buildGame();
  }

  Widget _buildMenu() {
    return Container(
      decoration: const BoxDecoration(color: Color(0xFF0A0A0A)),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            IconButton(onPressed: widget.onBack, icon: const Icon(LucideIcons.arrowLeft, color: Colors.yellowAccent)),
            const VaultDoorWidget(size: 160, tumblers: [false, false, false, false, false, false]),
            const SizedBox(height: 20),
            Text("HEIST MASTER", style: GoogleFonts.plusJakartaSans(fontSize: 48, fontWeight: FontWeight.w900, color: Colors.yellowAccent)),
            const SizedBox(height: 40),
            Container(
              constraints: BoxConstraints(maxWidth: 400),
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                children: exams.map((ex) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.yellow.withOpacity(0.1),
                      foregroundColor: Colors.yellowAccent,
                      padding: const EdgeInsets.all(20),
                      side: const BorderSide(color: Colors.yellowAccent, width: 1),
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
    return Container(
      color: Colors.black,
      child: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text("🔐", style: TextStyle(fontSize: 60)),
            SizedBox(height: 20),
            Text("Casing the joint...", style: TextStyle(color: Colors.yellowAccent, fontSize: 24, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildWin() {
    return Container(
      decoration: const BoxDecoration(color: Colors.black),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text("💰", style: TextStyle(fontSize: 100)),
            Text("VAULT CRACKED!", style: GoogleFonts.plusJakartaSans(fontSize: 40, fontWeight: FontWeight.w900, color: Colors.yellowAccent)),
            Text("Score: \$${score.toString()}", style: const TextStyle(fontSize: 30, color: Colors.white, fontWeight: FontWeight.bold)),
            const SizedBox(height: 40),
            ElevatedButton(onPressed: () => startGame(selectedExam!), child: const Text("New Heist")),
            TextButton(onPressed: widget.onBack, child: const Text("Back to Arcade", style: TextStyle(color: Colors.white))),
          ],
        ),
      ),
    );
  }

  Widget _buildDead() {
    return Container(
      color: Colors.black,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text("🚔", style: TextStyle(fontSize: 100)),
            Text("BUSTED!", style: GoogleFonts.plusJakartaSans(fontSize: 60, fontWeight: FontWeight.w900, color: Colors.redAccent)),
            const SizedBox(height: 40),
            ElevatedButton(onPressed: () => startGame(selectedExam!), child: const Text("Try Again")),
            TextButton(onPressed: widget.onBack, child: const Text("Abort", style: TextStyle(color: Colors.white))),
          ],
        ),
      ),
    );
  }

  Widget _buildGame() {
    final currentQ = questions[qIndex % questions.length];
    final isAlarm = gameState == "ALARM";

    return Container(
      color: isAlarm ? const Color(0xFF450A0A) : const Color(0xFF0A0A0A),
      child: Stack(
        children: [
          if (isAlarm) ...[
            Container(color: Colors.red.withOpacity(0.3)).animate(onPlay: (c) => c.repeat()).fadeOut(duration: const Duration(milliseconds: 200)),
          ],
          Column(
            children: [
              // HUD
              Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    IconButton(onPressed: widget.onBack, icon: const Icon(LucideIcons.arrowLeft, color: Colors.yellowAccent)),
                    Row(
                      children: [
                        _buildAlarms(),
                        const SizedBox(width: 20),
                        _buildStat("⏱️ ${timer}s", timer < 20 ? Colors.redAccent : Colors.yellowAccent),
                        const SizedBox(width: 20),
                        _buildStat("\$${score.toString()}", Colors.yellowAccent),
                      ],
                    ),
                  ],
                ),
              ),
              // Vault
              VaultDoorWidget(
                size: 220,
                tumblers: tumblers,
                spinningTumbler: spinningTumbler,
              ),
              const SizedBox(height: 10),
              Text("${tumblers.where((t)=>t).length}/$totalTumblers Tumblers Cracked", style: const TextStyle(color: Colors.yellowAccent, fontWeight: FontWeight.bold)),
              const SizedBox(height: 20),
              // Question Area
              if (isAlarm) ...[
                const Padding(
                  padding: EdgeInsets.all(40),
                  child: Column(
                    children: [
                      Text("🚨", style: TextStyle(fontSize: 80)),
                      Text("ALARM TRIGGERED!", style: TextStyle(color: Colors.redAccent, fontSize: 32, fontWeight: FontWeight.bold)),
                      Text("-10 seconds penalty!", style: TextStyle(color: Colors.white70)),
                    ],
                  ),
                ),
              ] else ...[
                Expanded(
                  child: SingleChildScrollView(
                    child: _buildQuestionArea(currentQ),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAlarms() {
    return Row(
      children: List.generate(3, (i) => Container(
        margin: const EdgeInsets.only(right: 4),
        width: 24, height: 24,
        decoration: BoxDecoration(
          color: i < alarmCount ? Colors.red : Colors.grey[900],
          shape: BoxShape.circle,
          border: Border.all(color: i < alarmCount ? Colors.redAccent : Colors.grey[800]!),
        ),
        child: i < alarmCount ? const Center(child: Text("🚨", style: TextStyle(fontSize: 12))) : null,
      )),
    );
  }

  Widget _buildStat(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        border: Border.all(color: color, width: 1.5),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(text, style: TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 18)),
    );
  }

  Widget _buildQuestionArea(dynamic q) {
    List options = q['options'] ?? [];
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.yellow.withOpacity(0.05),
              border: Border.all(color: Colors.yellowAccent.withOpacity(0.2)),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(q['question'] ?? "", style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 24),
                ...options.asMap().entries.map((entry) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: InkWell(
                    onTap: () => handleAnswer(entry.key),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.yellow.withOpacity(0.05),
                        border: Border.all(color: Colors.yellow.withOpacity(0.3)),
                        borderRadius: BorderRadius.circular(15),
                      ),
                      child: Row(
                        children: [
                          Text("${String.fromCharCode(65 + entry.key)}. ", style: const TextStyle(color: Colors.yellowAccent, fontWeight: FontWeight.bold)),
                          Expanded(child: Text(entry.value, style: const TextStyle(color: Colors.white))),
                        ],
                      ),
                    ),
                  ),
                )).toList(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class VaultDoorWidget extends StatelessWidget {
  final double size;
  final List<bool> tumblers;
  final int? spinningTumbler;
  const VaultDoorWidget({super.key, required this.size, required this.tumblers, this.spinningTumbler});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: VaultPainter(tumblers, spinningTumbler),
      ),
    );
  }
}

class VaultPainter extends CustomPainter {
  final List<bool> tumblers;
  final int? spinningTumbler;
  VaultPainter(this.tumblers, this.spinningTumbler);

  @override
  void paint(Canvas canvas, Size size) {
    double cx = size.width / 2;
    double cy = size.height / 2;
    double r = size.width * 0.4;

    Paint doorPaint = Paint()..color = const Color(0xFF1C1917)..style = PaintingStyle.fill;
    Paint ringPaint = Paint()..color = const Color(0xFF78350F)..style = PaintingStyle.stroke..strokeWidth = 4;

    canvas.drawCircle(Offset(cx, cy), r, doorPaint);
    canvas.drawCircle(Offset(cx, cy), r, ringPaint);

    for (int i = 0; i < 6; i++) {
      double angle = (i / 6) * 2 * pi - pi / 2;
      double tr = r * 0.65;
      double tx = cx + tr * cos(angle);
      double ty = cy + tr * sin(angle);

      Paint tumblerPaint = Paint()..color = tumblers[i] ? Colors.green : const Color(0xFF0A0A0A);
      canvas.drawCircle(Offset(tx, ty), r * 0.18, tumblerPaint);
      
      if (spinningTumbler == i) {
        // Simple spin effect
      } else if (tumblers[i]) {
        _drawText(canvas, "✓", Offset(tx, ty), r * 0.15, Colors.white);
      } else {
        _drawText(canvas, "🔐", Offset(tx, ty), r * 0.15, Colors.yellow[800]!);
      }
    }

    // Handle
    bool cracked = tumblers.every((t) => t);
    Paint handlePaint = Paint()..color = cracked ? Colors.green : const Color(0xFF292524)..style = PaintingStyle.fill;
    canvas.drawCircle(Offset(cx, cy), r * 0.25, handlePaint);
    _drawText(canvas, cracked ? "💰" : "🔒", Offset(cx, cy), r * 0.2, Colors.white);
  }

  void _drawText(Canvas canvas, String text, Offset center, double size, Color color) {
    final tp = TextPainter(
      text: TextSpan(text: text, style: TextStyle(fontSize: size, color: color)),
      textDirection: TextDirection.ltr,
    );
    tp.layout();
    tp.paint(canvas, Offset(center.dx - tp.width/2, center.dy - tp.height/2));
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => true;
}
