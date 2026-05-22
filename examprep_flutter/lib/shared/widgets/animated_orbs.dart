import 'package:flutter/material.dart';
import 'package:examprep_app/core/theme/app_theme.dart';

/// AnimatedBackground — replicates the animated mesh orbs from Login/Register
/// Matches React's: .lx-orb1, .lx-orb2, .lx-orb3, .lx-orb4 + dot grid + particles
class AnimatedBackground extends StatefulWidget {
  final bool purpleVariant; // true = registration page purple tones
  const AnimatedBackground({super.key, this.purpleVariant = false});

  @override
  State<AnimatedBackground> createState() => _AnimatedBackgroundState();
}

class _AnimatedBackgroundState extends State<AnimatedBackground>
    with TickerProviderStateMixin {
  late final AnimationController _orb1;
  late final AnimationController _orb2;
  late final AnimationController _orb3;

  @override
  void initState() {
    super.initState();
    _orb1 = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 20),
    )..repeat(reverse: true);
    _orb2 = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 25),
    )..repeat(reverse: true);
    _orb3 = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 16),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _orb1.dispose();
    _orb2.dispose();
    _orb3.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final purple = widget.purpleVariant;

    return Positioned.fill(
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: purple
                ? const [
                    Color(0xFFF5F0FF),
                    Color(0xFFEDE8FF),
                    Color(0xFFF8F0FF),
                    Color(0xFFFDE7F3),
                    Color(0xFFFFF0FB),
                  ]
                : const [
                    Color(0xFFEEF0FF),
                    Color(0xFFE8ECFF),
                    Color(0xFFF0EAFF),
                    Color(0xFFFCE8F3),
                    Color(0xFFFEF3FB),
                  ],
            stops: const [0.0, 0.28, 0.55, 0.82, 1.0],
          ),
        ),
        child: Stack(
          children: [
            // Dot grid
            Positioned.fill(
              child: CustomPaint(painter: _DotGridPainter(purple: purple)),
            ),

            // Orb 1 — top left
            AnimatedBuilder(
              animation: _orb1,
              builder: (_, __) => Positioned(
                left: -120 + _orb1.value * 50,
                top: -180 + _orb1.value * 70,
                child: _Orb(
                  size: 620,
                  color: purple
                      ? const Color(0xFF7C3AED).withOpacity(0.18)
                      : const Color(0xFF6366F1).withOpacity(0.20),
                ),
              ),
            ),

            // Orb 2 — bottom right
            AnimatedBuilder(
              animation: _orb2,
              builder: (_, __) => Positioned(
                right: -90 + _orb2.value * -45,
                bottom: -120 + _orb2.value * 55,
                child: _Orb(
                  size: 500,
                  color: purple
                      ? const Color(0xFFEC4899).withOpacity(0.15)
                      : const Color(0xFFA855F7).withOpacity(0.16),
                ),
              ),
            ),

            // Orb 3 — center
            AnimatedBuilder(
              animation: _orb3,
              builder: (_, __) => Positioned(
                left: size.width * 0.42 + _orb3.value * -35,
                top: size.height * 0.38 + _orb3.value * -45,
                child: _Orb(
                  size: 320,
                  color: const Color(0xFFEC4899).withOpacity(0.12),
                ),
              ),
            ),

            // Rising particles
            ...List.generate(14, (i) => _Particle(index: i, purple: purple)),
          ],
        ),
      ),
    );
  }
}

class _Orb extends StatelessWidget {
  final double size;
  final Color color;
  const _Orb({required this.size, required this.color});

  @override
  Widget build(BuildContext context) => Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: RadialGradient(
            colors: [color, Colors.transparent],
            stops: const [0.0, 0.65],
          ),
        ),
      );
}

class _DotGridPainter extends CustomPainter {
  final bool purple;
  _DotGridPainter({this.purple = false});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = (purple ? const Color(0xFF7C3AED) : const Color(0xFF6366F1))
          .withOpacity(0.17)
      ..style = PaintingStyle.fill;

    const spacing = 30.0;
    const radius = 1.0;

    for (double x = 0; x < size.width; x += spacing) {
      for (double y = 0; y < size.height; y += spacing) {
        canvas.drawCircle(Offset(x, y), radius, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _Particle extends StatefulWidget {
  final int index;
  final bool purple;
  const _Particle({required this.index, this.purple = false});

  @override
  State<_Particle> createState() => _ParticleState();
}

class _ParticleState extends State<_Particle> with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    final duration = Duration(milliseconds: 11000 + widget.index * 600);
    _ctrl = AnimationController(vsync: this, duration: duration)
      ..repeat();
    _anim = CurvedAnimation(parent: _ctrl, curve: Curves.linear);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final i = widget.index;
    final x = (i * 0.066 + 0.01) * size.width;
    final particleSize = 1.5 + i * 0.35;

    return AnimatedBuilder(
      animation: _anim,
      builder: (_, __) {
        final y = size.height - _anim.value * (size.height + 50);
        final opacity = _anim.value < 0.08
            ? _anim.value / 0.08
            : _anim.value > 0.88
                ? (1.0 - _anim.value) / 0.12
                : 0.18;

        return Positioned(
          left: x,
          top: y,
          child: Opacity(
            opacity: opacity.clamp(0.0, 1.0),
            child: Container(
              width: particleSize,
              height: particleSize,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: (widget.purple ? const Color(0xFF7C3AED) : const Color(0xFF6366F1))
                    .withOpacity(0.07 + i * 0.009),
              ),
            ),
          ),
        );
      },
    );
  }
}
