import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';

class StudentLanding extends StatefulWidget {
  const StudentLanding({super.key});
  @override
  State<StudentLanding> createState() => _StudentLandingState();
}

class _StudentLandingState extends State<StudentLanding> {
  final PageController _pageController = PageController();
  int _currentIndex = 0;
  Timer? _timer;

  final List<Map<String, dynamic>> _slides = [
    {
      'title': 'Ace Every',
      'highlight': 'Exam.',
      'desc': 'Smart preparation with AI-powered tests and detailed analytics.',
      'features': ['AI-powered question bank', 'Topic-wise deep practice', 'Real exam simulation'],
      'emoji': '🎯',
      'accent': const Color(0xFF6366F1),
    },
    {
      'title': 'AI Virtual',
      'highlight': 'Tutor.',
      'desc': 'Get 24/7 help from our advanced AI chat companion.',
      'features': ['Instant hint generation', 'Concept explanation', 'Step-by-step solutions'],
      'emoji': '🤖',
      'accent': const Color(0xFF8B5CF6),
    },
    {
      'title': 'Deep Performance',
      'highlight': 'Insights.',
      'desc': 'Track your progress across all topics with visual charts.',
      'features': ['Wellbeing tracking', 'Adaptive difficulty', 'Global leaderboard'],
      'emoji': '📊',
      'accent': const Color(0xFF06B6D4),
    },
  ];

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 5), (timer) {
      if (_currentIndex < _slides.length - 1) {
         _currentIndex++;
      } else {
         _currentIndex = 0;
      }
      if (_pageController.hasClients) {
        _pageController.animateToPage(_currentIndex, duration: const Duration(milliseconds: 600), curve: Curves.easeInOut);
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          _buildAnimatedBackground(),
          _buildResponsiveLayout(),
        ],
      ),
    );
  }

  Widget _buildAnimatedBackground() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(colors: [Color(0xFFEEF0FF), Color(0xFFFCE8F3)], begin: Alignment.topLeft, end: Alignment.bottomRight),
      ),
      child: Stack(
        children: [
          // Simulated Orbs
          Positioned(top: -100, left: -100, child: Container(width: 400, height: 400, decoration: BoxDecoration(color: _slides[_currentIndex]['accent'].withOpacity(0.12), shape: BoxShape.circle))),
          Positioned(bottom: -100, right: -100, child: Container(width: 400, height: 400, decoration: BoxDecoration(color: Colors.purple.withOpacity(0.08), shape: BoxShape.circle))),
        ],
      ),
    );
  }

  Widget _buildResponsiveLayout() {
    return Column(
      children: [
        _buildNavbar(),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 20),
            child: ConstrainedBox(
              constraints: BoxConstraints(minHeight: MediaQuery.of(context).size.height - 150),
              child: LayoutBuilder(builder: (context, constraints) {
                if (constraints.maxWidth > 800) {
                  return Row(
                    children: [
                      Expanded(flex: 5, child: _buildHeroText()),
                      const SizedBox(width: 60),
                      Expanded(flex: 4, child: _buildHeroPanel()),
                    ],
                  );
                }
                return Column(
                  children: [
                    _buildHeroText(),
                    const SizedBox(height: 60),
                    _buildHeroPanel(),
                  ],
                );
              }),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildNavbar() {
    return Container(
      height: 70,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.8),
          border: Border(
              bottom: BorderSide(color: Colors.indigo.withOpacity(0.1)))),
      child: Row(
        children: [
          Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                  gradient: const LinearGradient(
                      colors: [Color(0xFF6366F1), Color(0xFFEC4899)]),
                  borderRadius: BorderRadius.circular(8)),
              child: const Center(child: Text('🎓', style: TextStyle(fontSize: 16)))),
          const Spacer(),
          TextButton(
              onPressed: () => context.go('/login'),
              child: const Text('Login',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13))),
          const SizedBox(width: 8),
          ElevatedButton(
              onPressed: () => context.go('/register'),
              style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF6366F1),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10))),
              child: const Text('Get Started', style: TextStyle(fontSize: 12))),
        ],
      ),
    );
  }

  Widget _buildHeroText() {
    final slide = _slides[_currentIndex];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(30), border: Border.all(color: slide['accent'].withOpacity(0.2))), child: Row(mainAxisSize: MainAxisSize.min, children: [Container(width: 8, height: 8, decoration: BoxDecoration(color: slide['accent'], shape: BoxShape.circle)), const SizedBox(width: 8), Text('SMART PREPARATION', style: TextStyle(color: slide['accent'], fontWeight: FontWeight.w900, fontSize: 11, letterSpacing: 1))])),
        const SizedBox(height: 24),
        Text(slide['title'], style: GoogleFonts.sora(fontSize: 56, fontWeight: FontWeight.w800, color: const Color(0xFF1E1B4B), height: 1.1)),
        ShaderMask(shaderCallback: (bounds) => LinearGradient(colors: [slide['accent'], Colors.purple, Colors.cyan]).createShader(bounds), child: Text(slide['highlight'], style: GoogleFonts.sora(fontSize: 56, fontWeight: FontWeight.w800, color: Colors.white, height: 1.1))),
        const SizedBox(height: 24),
        Text(slide['desc'], style: TextStyle(fontSize: 16, color: Colors.indigo.shade900.withOpacity(0.6), height: 1.6)),
        const SizedBox(height: 32),
        Wrap(
          children: [
            ElevatedButton(onPressed: () => context.go('/register'), style: ElevatedButton.styleFrom(backgroundColor: slide['accent'], foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 20), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)), elevation: 10, shadowColor: slide['accent'].withOpacity(0.5)), child: const Text('Start Practicing Free →', style: TextStyle(fontWeight: FontWeight.bold))),
          ],
        ),
        const SizedBox(height: 40),
        Wrap(
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            _avatarGroup(),
            const SizedBox(width: 12),
            const Text('Joined by 50,000+ students this year', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold, fontSize: 12)),
          ],
        ),
      ],
    );
  }

  Widget _buildHeroPanel() {
    final slide = _slides[_currentIndex];
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(color: Colors.white.withOpacity(0.5), borderRadius: BorderRadius.circular(32), border: Border.all(color: Colors.white.withOpacity(0.5))),
      child: Container(
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(28), boxShadow: [BoxShadow(color: slide['accent'].withOpacity(0.1), blurRadius: 40)]),
        child: Column(
          children: [
            Container(height: 4, width: double.infinity, decoration: BoxDecoration(gradient: LinearGradient(colors: [slide['accent'], Colors.purple, Colors.cyan]), borderRadius: const BorderRadius.vertical(top: Radius.circular(28)))),
            Padding(
              padding: const EdgeInsets.all(24),
              child: Row(
                children: [
                  Container(width: 48, height: 48, decoration: BoxDecoration(color: slide['accent'].withOpacity(0.1), borderRadius: BorderRadius.circular(14)), child: Center(child: Text(slide['emoji'], style: const TextStyle(fontSize: 24)))),
                  const SizedBox(width: 16),
                  Text('Core Features', style: GoogleFonts.sora(fontWeight: FontWeight.w800, fontSize: 18)),
                ],
              ),
            ),
            _buildSlideContent(),
          ],
        ),
      ),
    );
  }

  Widget _buildSlideContent() {
    final features = _slides[_currentIndex]['features'] as List;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
      child: Column(
        children: features.asMap().entries.map((e) => Container(margin: const EdgeInsets.only(bottom: 12), padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: _slides[_currentIndex]['accent'].withOpacity(0.05), borderRadius: BorderRadius.circular(14), border: Border.all(color: _slides[_currentIndex]['accent'].withOpacity(0.1))), child: Row(children: [Container(width: 24, height: 24, decoration: BoxDecoration(color: _slides[_currentIndex]['accent'], borderRadius: BorderRadius.circular(8)), child: Center(child: Text('${e.key + 1}', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)))), const SizedBox(width: 16), Expanded(child: Text(e.value, style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF374151))))]))).toList(),
      ),
    );
  }

  Widget _avatarGroup() {
    return SizedBox(
      width: 100,
      height: 30,
      child: Stack(
        children: List.generate(4, (i) => Positioned(left: i * 20, child: CircleAvatar(radius: 15, backgroundColor: Colors.white, child: CircleAvatar(radius: 13, backgroundColor: Colors.blue.shade100, child: Text(['A','S','R','M'][i], style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)))))),
      ),
    );
  }
}
