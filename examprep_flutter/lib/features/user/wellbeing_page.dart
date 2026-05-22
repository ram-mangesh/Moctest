import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:examprep_app/core/api/dio_client.dart';

class WellbeingPage extends ConsumerStatefulWidget {
  const WellbeingPage({super.key});

  @override
  ConsumerState<WellbeingPage> createState() => _WellbeingPageState();
}

class _WellbeingPageState extends ConsumerState<WellbeingPage> {
  Map<String, dynamic> _config = {
    "driftStressDelta": 10,
    "optionChangeStressCap": 16,
    "longTimeThresholdSeconds": 90,
    "calmUiStressThreshold": 50,
    "mistakeRiskStressThreshold": 30,
    "mistakeRiskConfidenceThreshold": 40
  };
  Map<String, dynamic>? _behaviorSummary;
  List<dynamic> _attempts = [];
  bool _loading = true;

  // Breathing state
  bool _breathing = false;
  int _bStep = 0;
  int _bTimer = 4;
  int _bCycles = 0;
  Timer? _ticker;

  final List<Map<String, dynamic>> _breathSteps = [
    { "label": "Breathe IN", "dur": 4, "color": Colors.blue, "scale": 1.35 },
    { "label": "Hold", "dur": 7, "color": Colors.purple, "scale": 1.35 },
    { "label": "Breathe OUT", "dur": 8, "color": Colors.green, "scale": 1.0 },
  ];

  final List<Map<String, String>> _tips = [
    { "icon": "💧", "tip": "Drink water before studying — hydration boosts focus by 14%." },
    { "icon": "🧘", "tip": "Take a 2-min breathing break every 25 minutes (Pomodoro technique)." },
    { "icon": "🌿", "tip": "A 10-minute walk increases blood flow and sharpens memory." },
    { "icon": "😴", "tip": "Sleep 7-9 hours. Memory consolidation happens during deep sleep." },
  ];
  int _tipIdx = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final dio = ref.read(dioClientProvider);
      final cfgRes = await dio.get("/api/user/stress-config");
      if (cfgRes.data != null) _config = {..._config, ...cfgRes.data};

      final attRes = await dio.get("/user/test/attempts");
      final attempts = attRes.data ?? [];
      _attempts = attempts;

      if (attempts.isNotEmpty) {
        final sorted = List.from(attempts)..sort((a, b) => DateTime.parse(b['attemptedAt']).compareTo(DateTime.parse(a['attemptedAt'])));
        final latestId = sorted[0]['sessionId'] ?? sorted[0]['id'];
        final behRes = await dio.get("/api/user/behavior/summary/$latestId");
        if (behRes.data != null && behRes.data['message'] == null) {
          _behaviorSummary = behRes.data;
        }
      }
      if (mounted) setState(() => _loading = false);
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _toggleBreathing() {
    if (_breathing) {
      _ticker?.cancel();
      setState(() => _breathing = false);
    } else {
      setState(() {
        _breathing = true;
        _bStep = 0;
        _bTimer = _breathSteps[0]['dur'];
        _bCycles = 0;
      });
      _startTicker();
    }
  }

  void _startTicker() {
    _ticker = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_bTimer > 1) {
        setState(() => _bTimer--);
      } else {
        setState(() {
          _bStep = (_bStep + 1) % 3;
          if (_bStep == 0) _bCycles++;
          _bTimer = _breathSteps[_bStep]['dur'];
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    final wellbeing = _computeWellbeing();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text('Wellbeing Hub', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _eyebrow("💚 WELLBEING MONITORING"),
            const SizedBox(height: 8),
            Text("Your Wellbeing Dashboard", style: GoogleFonts.plusJakartaSans(fontSize: 26, fontWeight: FontWeight.w900)),
            const SizedBox(height: 24),

            _statusCard(wellbeing),
            const SizedBox(height: 18),

            _breathingCard(),
            const SizedBox(height: 18),

            _tipCard(),
            const SizedBox(height: 24),

            Text("⚙️ Stress Detection Settings", style: GoogleFonts.plusJakartaSans(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            _configGrid(),
            const SizedBox(height: 20),
            Center(
              child: ElevatedButton.icon(
                onPressed: () => _saveConfig(),
                icon: const Icon(LucideIcons.save),
                label: const Text("Save Preferences"),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.indigo, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Map<String, dynamic> _computeWellbeing() {
    if (_attempts.isEmpty) return {"label": "No data yet", "color": Colors.grey, "score": 50, "icon": "❓", "source": "none"};
    
    final sorted = List.from(_attempts)..sort((a, b) => DateTime.parse(b['attemptedAt']).compareTo(DateTime.parse(a['attemptedAt'])));
    final daysAgo = DateTime.now().difference(DateTime.parse(sorted[0]['attemptedAt'])).inDays;

    if (_behaviorSummary != null) {
      double avgTime = (_behaviorSummary!['avgTimePerQuestion'] ?? 0).toDouble();
      int changes = _behaviorSummary!['totalOptionChanges'] ?? 0;
      int revisits = _behaviorSummary!['totalRevisits'] ?? 0;
      double acc = (_behaviorSummary!['accuracy'] ?? 60).toDouble();

      double longTimeStress = avgTime > (_config['longTimeThresholdSeconds'] ?? 90) ? 25 : 0;
      double indecisionStress = (changes / (_config['optionChangeStressCap'] ?? 16)).clamp(0, 1.0) * 20;
      double revisitStress = (revisits / 10).clamp(0, 1.0) * 20;
      double accuracyBonus = acc > 70 ? 10 : acc < 40 ? -10 : 0;
      double inactivityPenalty = daysAgo > 7 ? 15 : 0;

      double score = (80 - longTimeStress - indecisionStress - revisitStress + accuracyBonus - inactivityPenalty).clamp(0, 100);
      
      if (score >= 70) return {"label": "Good — Relaxed 🌟", "color": Colors.green, "score": score.toInt(), "icon": "🌟", "source": "real"};
      if (score >= 40) return {"label": "Moderate Stress 💛", "color": Colors.orange, "score": score.toInt(), "icon": "💛", "source": "real"};
      return {"label": "High Stress — Rest ❤️‍🩹", "color": Colors.red, "score": score.toInt(), "icon": "❤️‍🩹", "source": "real"};
    } else {
      double avg = (_attempts.take(5).fold<num>(0, (s, a) => s + (a['scorePercent'] ?? 0)) / (_attempts.length > 5 ? 5 : _attempts.length)).toDouble();
      double score = (60.0 + (avg > 70 ? 20.0 : avg < 40 ? -20.0 : 0.0) - (daysAgo > 7 ? 20.0 : 0.0)).clamp(0.0, 100.0);
      if (score >= 70) return {"label": "Good 🌟", "color": Colors.green, "score": score.toInt(), "icon": "🌟", "source": "estimate"};
      if (score >= 40) return {"label": "Moderate 💛", "color": Colors.orange, "score": score.toInt(), "icon": "💛", "source": "estimate"};
      return {"label": "High Stress ❤️‍🩹", "color": Colors.red, "score": score.toInt(), "icon": "❤️‍🩹", "source": "estimate"};
    }
  }

  Widget _eyebrow(String text) => Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4), decoration: BoxDecoration(color: Colors.green.withOpacity(0.1), borderRadius: BorderRadius.circular(20)), child: Text(text, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.green, letterSpacing: 1)));

  Widget _statusCard(Map<String, dynamic> wb) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(color: wb['color'].withOpacity(0.05), borderRadius: BorderRadius.circular(20), border: Border.all(color: wb['color'].withOpacity(0.15))),
      child: Row(
        children: [
          Container(width: 60, height: 60, decoration: BoxDecoration(color: wb['color'], shape: BoxShape.circle), child: Center(child: Text(wb['icon'], style: const TextStyle(fontSize: 30)))),
          const SizedBox(width: 18),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(wb['label'], style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: wb['color'])),
            const SizedBox(height: 4),
            Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2), decoration: BoxDecoration(color: Colors.black.withOpacity(0.05), borderRadius: BorderRadius.circular(20)), child: Text(wb['source'] == 'real' ? "🟢 LIVE BEHAVIORAL DATA" : "🟡 SCORE ESTIMATE", style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold))),
            const SizedBox(height: 10),
            LinearProgressIndicator(value: wb['score'] / 100, backgroundColor: Colors.black.withOpacity(0.1), valueColor: AlwaysStoppedAnimation(wb['color'])),
            const SizedBox(height: 4),
            Text("${wb['score']}/100 Score", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: wb['color'])),
          ])),
        ],
      ),
    );
  }

  Widget _breathingCard() {
    final step = _breathSteps[_bStep];
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.indigo.withOpacity(0.1))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("🫁 4-7-8 Breathing Exercise", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              GestureDetector(
                onTap: _toggleBreathing,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 800),
                  width: 120, height: 120,
                  decoration: BoxDecoration(shape: BoxShape.circle, color: _breathing ? step['color'].withOpacity(0.1) : Colors.indigo.withOpacity(0.05), border: Border.all(color: _breathing ? step['color'] : Colors.indigo, width: 3)),
                  transform: _breathing ? Matrix4.diagonal3Values(step['scale'], step['scale'], 1.0) : Matrix4.identity(),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(_breathing ? LucideIcons.wind : LucideIcons.play, color: _breathing ? step['color'] : Colors.indigo),
                      Text(_breathing ? step['label'] : "Start", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: _breathing ? step['color'] : Colors.indigo)),
                      if (_breathing) Text("${_bTimer}s", style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: step['color'])),
                    ],
                  ),
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: _breathSteps.map((s) => Padding(padding: const EdgeInsets.only(bottom: 8), child: Row(children: [Container(width: 8, height: 8, decoration: BoxDecoration(color: s['color'], shape: BoxShape.circle)), const SizedBox(width: 8), Text("${s['label']} (${s['dur']}s)", style: TextStyle(color: s['color'], fontWeight: FontWeight.bold, fontSize: 12))]))).toList(),
              ),
            ],
          ),
          if (_bCycles > 0) Padding(padding: const EdgeInsets.only(top: 10), child: Center(child: Text("✓ $_bCycles cycles completed", style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold)))),
        ],
      ),
    );
  }

  Widget _tipCard() {
    final tip = _tips[_tipIdx];
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.indigo.withOpacity(0.05), borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.indigo.withOpacity(0.1))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("💡 WELLBEING TIP", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.indigo, letterSpacing: 1)),
          const SizedBox(height: 8),
          Text("${tip['icon']} ${tip['tip']}", style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
          TextButton(onPressed: () => setState(() => _tipIdx = (_tipIdx + 1) % _tips.length), child: const Text("Next tip →", style: TextStyle(fontSize: 12))),
        ],
      ),
    );
  }

  Widget _configGrid() {
    return Wrap(
      spacing: 12, runSpacing: 12,
      children: _config.entries.where((e) => e.value is num).map((e) {
        return Container(
          width: (MediaQuery.of(context).size.width - 70) / 2,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.indigo.withOpacity(0.1))),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(e.key.replaceFirst(e.key[0], e.key[0].toUpperCase()), style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.grey)),
              const SizedBox(height: 6),
              TextField(
                decoration: const InputDecoration(isDense: true, border: InputBorder.none),
                controller: TextEditingController(text: e.value.toString())..selection = TextSelection.fromPosition(TextPosition(offset: e.value.toString().length)),
                keyboardType: TextInputType.number,
                onChanged: (v) => _config[e.key] = num.tryParse(v) ?? e.value,
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Future<void> _saveConfig() async {
    try {
      await ref.read(dioClientProvider).post("/api/user/stress-config", data: _config);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('✓ Wellbeing preferences saved.')));
    } catch (_) {}
  }
}
