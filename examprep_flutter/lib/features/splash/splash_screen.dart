import 'dart:math';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  // Controllers
  late AnimationController _bgController;
  late AnimationController _logoController;
  late AnimationController _textController;
  late AnimationController _particleController;
  late AnimationController _progressController;
  late AnimationController _exitController;
  late AnimationController _pulseController;

  // Logo animations
  late Animation<double> _logoScale;
  late Animation<double> _logoOpacity;
  late Animation<double> _logoGlow;

  // Text animations
  late Animation<double> _titleOpacity;
  late Animation<Offset> _titleSlide;
  late Animation<double> _subtitleOpacity;
  late Animation<Offset> _subtitleSlide;

  // Progress animations
  late Animation<double> _progressWidth;
  late Animation<double> _progressOpacity;

  // Exit animation
  late Animation<double> _exitScale;
  late Animation<double> _exitOpacity;

  // Features text
  late Animation<double> _featuresOpacity;

  // Particle system
  final List<_Particle> _particles = [];
  final Random _random = Random();

  @override
  void initState() {
    super.initState();
    _initParticles();
    _initAnimations();
    _startAnimationSequence();
  }

  bool _disposed = false;

  void _initParticles() {
    for (int i = 0; i < 40; i++) {
      _particles.add(_Particle(
        x: _random.nextDouble(),
        y: _random.nextDouble(),
        size: _random.nextDouble() * 8 + 3,
        speed: _random.nextDouble() * 0.3 + 0.1,
        opacity: _random.nextDouble() * 0.6 + 0.2,
        color: [
          const Color(0xFF6366F1), // Indigo
          const Color(0xFF8B5CF6), // Violet
          const Color(0xFF06B6D4), // Cyan
          const Color(0xFFEC4899), // Pink
          const Color(0xFFF59E0B), // Amber
          const Color(0xFF10B981), // Emerald
          const Color(0xFF3B82F6), // Blue
          const Color(0xFFF97316), // Orange
        ][_random.nextInt(8)],
      ));
    }
  }

  void _initAnimations() {
    // Background gradient rotation
    _bgController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 6),
    )..repeat();

    // Pulse effect for logo
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);

    // Particle animation
    _particleController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 15),
    )..repeat();

    // Logo entrance
    _logoController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    _logoScale = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 0.0, end: 1.2), weight: 50),
      TweenSequenceItem(tween: Tween(begin: 1.2, end: 0.9), weight: 25),
      TweenSequenceItem(tween: Tween(begin: 0.9, end: 1.0), weight: 25),
    ]).animate(CurvedAnimation(parent: _logoController, curve: Curves.easeOut));

    _logoOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _logoController,
        curve: const Interval(0.0, 0.35, curve: Curves.easeIn),
      ),
    );

    _logoGlow = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _logoController,
        curve: const Interval(0.5, 1.0, curve: Curves.easeOut),
      ),
    );

    // Text entrance
    _textController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );

    _titleOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _textController,
        curve: const Interval(0.0, 0.5, curve: Curves.easeOut),
      ),
    );

    _titleSlide = Tween<Offset>(
      begin: const Offset(0, 0.4),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _textController,
      curve: const Interval(0.0, 0.5, curve: Curves.easeOutCubic),
    ));

    _subtitleOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _textController,
        curve: const Interval(0.25, 0.7, curve: Curves.easeOut),
      ),
    );

    _subtitleSlide = Tween<Offset>(
      begin: const Offset(0, 0.5),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _textController,
      curve: const Interval(0.25, 0.7, curve: Curves.easeOutCubic),
    ));

    _featuresOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _textController,
        curve: const Interval(0.5, 1.0, curve: Curves.easeOut),
      ),
    );

    // Progress bar
    _progressController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1600),
    );

    _progressWidth = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _progressController, curve: Curves.easeInOut),
    );

    _progressOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _progressController,
        curve: const Interval(0.0, 0.15, curve: Curves.easeIn),
      ),
    );

    // Exit animation
    _exitController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );

    _exitScale = Tween<double>(begin: 1.0, end: 1.4).animate(
      CurvedAnimation(parent: _exitController, curve: Curves.easeInCubic),
    );

    _exitOpacity = Tween<double>(begin: 1.0, end: 0.0).animate(
      CurvedAnimation(parent: _exitController, curve: Curves.easeInCubic),
    );
  }

  Future<void> _startAnimationSequence() async {
    await Future.delayed(const Duration(milliseconds: 300));
    if (_disposed || !mounted) return;
    _logoController.forward();

    await Future.delayed(const Duration(milliseconds: 800));
    if (_disposed || !mounted) return;
    _textController.forward();

    await Future.delayed(const Duration(milliseconds: 700));
    if (_disposed || !mounted) return;
    _progressController.forward();

    await Future.delayed(const Duration(milliseconds: 1900));
    if (_disposed || !mounted) return;
    await _exitController.forward();

    if (!_disposed && mounted) {
      context.go('/');
    }
  }

  @override
  void dispose() {
    _disposed = true;
    _bgController.dispose();
    _logoController.dispose();
    _textController.dispose();
    _particleController.dispose();
    _progressController.dispose();
    _exitController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AnimatedBuilder(
        animation: Listenable.merge([
          _bgController,
          _logoController,
          _textController,
          _particleController,
          _progressController,
          _exitController,
          _pulseController,
        ]),
        builder: (context, _) {
          return Transform.scale(
            scale: _exitScale.value,
            child: Opacity(
              opacity: _exitOpacity.value,
              child: Stack(
                children: [
                  _buildBackground(),
                  _buildParticles(),
                  _buildContent(),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildBackground() {
    final angle = _bgController.value * 2 * pi;
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment(cos(angle) * 0.8, sin(angle) * 0.8),
          end: Alignment(-cos(angle) * 0.8, -sin(angle) * 0.8),
          colors: const [
            Color(0xFFEEF0FF), // lavender white
            Color(0xFFE0E7FF), // indigo-100
            Color(0xFFF0EAFF), // violet tint
            Color(0xFFFCE8F3), // pink-50
            Color(0xFFE0F2FE), // sky-100
            Color(0xFFECFDF5), // emerald-50
          ],
          stops: const [0.0, 0.2, 0.4, 0.6, 0.8, 1.0],
        ),
      ),
      child: Container(
        decoration: BoxDecoration(
          gradient: RadialGradient(
            center: Alignment(
              sin(angle) * 0.5,
              cos(angle) * 0.5,
            ),
            radius: 1.2,
            colors: [
              const Color(0xFF6366F1).withOpacity(0.08),
              Colors.transparent,
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildParticles() {
    return CustomPaint(
      size: MediaQuery.of(context).size,
      painter: _ParticlePainter(
        particles: _particles,
        progress: _particleController.value,
      ),
    );
  }

  Widget _buildContent() {
    return SafeArea(
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Spacer(flex: 3),
            _buildLogo(),
            const SizedBox(height: 36),
            _buildTitle(),
            const SizedBox(height: 10),
            _buildSubtitle(),
            const SizedBox(height: 28),
            _buildFeatureChips(),
            const Spacer(flex: 2),
            _buildProgressBar(),
            const SizedBox(height: 20),
            _buildVersionText(),
            const Spacer(flex: 1),
          ],
        ),
      ),
    );
  }

  Widget _buildLogo() {
    final pulseValue = _pulseController.value;
    return Transform.scale(
      scale: _logoScale.value,
      child: Opacity(
        opacity: _logoOpacity.value,
        child: Container(
          width: 130,
          height: 130,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(34),
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color(0xFF6366F1),
                Color(0xFF8B5CF6),
                Color(0xFFEC4899),
              ],
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF6366F1)
                    .withOpacity(0.35 * _logoGlow.value + pulseValue * 0.15),
                blurRadius: 30 + pulseValue * 15,
                spreadRadius: 2 + pulseValue * 5,
              ),
              BoxShadow(
                color: const Color(0xFFEC4899)
                    .withOpacity(0.2 * _logoGlow.value + pulseValue * 0.1),
                blurRadius: 50 + pulseValue * 10,
                spreadRadius: 5 + pulseValue * 3,
                offset: const Offset(10, 10),
              ),
              BoxShadow(
                color: const Color(0xFF06B6D4)
                    .withOpacity(0.15 * _logoGlow.value + pulseValue * 0.1),
                blurRadius: 40 + pulseValue * 10,
                spreadRadius: 3 + pulseValue * 3,
                offset: const Offset(-10, 5),
              ),
            ],
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Inner glass effect
              Container(
                margin: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(31),
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Colors.white.withOpacity(0.25),
                      Colors.white.withOpacity(0.05),
                    ],
                  ),
                ),
              ),
              // Icon
              const Icon(
                Icons.school_rounded,
                color: Colors.white,
                size: 58,
              ),
              // Top-left shine
              Positioned(
                top: 12,
                left: 12,
                child: Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(14),
                    gradient: RadialGradient(
                      colors: [
                        Colors.white.withOpacity(0.5),
                        Colors.white.withOpacity(0.0),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTitle() {
    return SlideTransition(
      position: _titleSlide,
      child: Opacity(
        opacity: _titleOpacity.value,
        child: ShaderMask(
          shaderCallback: (bounds) => const LinearGradient(
            colors: [
              Color(0xFF6366F1),
              Color(0xFF8B5CF6),
              Color(0xFFEC4899),
            ],
          ).createShader(bounds),
          child: Text(
            'ExamPrep',
            style: GoogleFonts.plusJakartaSans(
              fontSize: 44,
              fontWeight: FontWeight.w900,
              color: Colors.white,
              letterSpacing: -1.5,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSubtitle() {
    return SlideTransition(
      position: _subtitleSlide,
      child: Opacity(
        opacity: _subtitleOpacity.value,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            color: const Color(0xFF6366F1).withOpacity(0.08),
            border: Border.all(
              color: const Color(0xFF6366F1).withOpacity(0.15),
            ),
          ),
          child: Text(
            '✨ AI-Powered Learning Platform',
            style: GoogleFonts.plusJakartaSans(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF4F46E5),
              letterSpacing: 0.5,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFeatureChips() {
    final features = [
      _FeatureItem('🎯', 'Smart Exams'),
      _FeatureItem('🎙️', 'Voice AI Tutor'),
      _FeatureItem('🎮', 'Learn & Play'),
    ];

    return Opacity(
      opacity: _featuresOpacity.value,
      child: Wrap(
        alignment: WrapAlignment.center,
        spacing: 10,
        runSpacing: 10,
        children: features.map((feature) {
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              color: Colors.white.withOpacity(0.85),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF6366F1).withOpacity(0.08),
                  blurRadius: 10,
                  spreadRadius: 1,
                ),
              ],
              border: Border.all(
                color: const Color(0xFF6366F1).withOpacity(0.1),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(feature.emoji, style: const TextStyle(fontSize: 14)),
                const SizedBox(width: 5),
                Text(
                  feature.label,
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF4338CA),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildProgressBar() {
    return Opacity(
      opacity: _progressOpacity.value,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 70),
        child: Container(
          height: 4,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(2),
            color: const Color(0xFF6366F1).withOpacity(0.1),
          ),
          child: Align(
            alignment: Alignment.centerLeft,
            child: FractionallySizedBox(
              widthFactor: _progressWidth.value,
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(2),
                  gradient: const LinearGradient(
                    colors: [
                      Color(0xFF6366F1),
                      Color(0xFF8B5CF6),
                      Color(0xFFEC4899),
                      Color(0xFF06B6D4),
                    ],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF8B5CF6).withOpacity(0.4),
                      blurRadius: 8,
                      spreadRadius: 0,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildVersionText() {
    return Opacity(
      opacity: _progressOpacity.value * 0.6,
      child: Text(
        'v1.0.0  •  Made with 💜',
        style: GoogleFonts.plusJakartaSans(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: const Color(0xFF6366F1).withOpacity(0.5),
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

// ─── Feature Item ──────────────────────────────────────────────────────────────

class _FeatureItem {
  final String emoji;
  final String label;
  _FeatureItem(this.emoji, this.label);
}

// ─── Particle System ───────────────────────────────────────────────────────────

class _Particle {
  double x;
  double y;
  final double size;
  final double speed;
  final double opacity;
  final Color color;

  _Particle({
    required this.x,
    required this.y,
    required this.size,
    required this.speed,
    required this.opacity,
    required this.color,
  });
}

class _ParticlePainter extends CustomPainter {
  final List<_Particle> particles;
  final double progress;

  _ParticlePainter({required this.particles, required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    for (final particle in particles) {
      final adjustedY = (particle.y + progress * particle.speed) % 1.0;
      final dx = particle.x * size.width +
          sin(progress * 2 * pi + particle.x * 8) * 15;
      final dy = adjustedY * size.height;

      final paint = Paint()
        ..color = particle.color.withOpacity(particle.opacity * 0.4)
        ..maskFilter = MaskFilter.blur(BlurStyle.normal, particle.size * 0.6);

      canvas.drawCircle(Offset(dx, dy), particle.size, paint);

      // Inner bright core
      final corePaint = Paint()
        ..color = particle.color.withOpacity(particle.opacity * 0.7);
      canvas.drawCircle(Offset(dx, dy), particle.size * 0.35, corePaint);
    }
  }

  @override
  bool shouldRepaint(covariant _ParticlePainter oldDelegate) => true;
}
