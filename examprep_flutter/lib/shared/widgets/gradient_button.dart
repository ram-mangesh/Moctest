import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:examprep_app/core/theme/app_theme.dart';

/// GradientButton — replicates React's .lx-btn with shimmer + gradient
class GradientButton extends StatefulWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool loading;
  final bool disabled;
  final Gradient? gradient;
  final Color? shadow;
  final double borderRadius;
  final double fontSize;

  const GradientButton({
    super.key,
    required this.label,
    this.onPressed,
    this.loading = false,
    this.disabled = false,
    this.gradient,
    this.shadow,
    this.borderRadius = 14,
    this.fontSize = 15.5,
  });

  @override
  State<GradientButton> createState() => _GradientButtonState();
}

class _GradientButtonState extends State<GradientButton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _shimmer;

  @override
  void initState() {
    super.initState();
    _shimmer = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();
  }

  @override
  void dispose() {
    _shimmer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final grad = widget.gradient ??
        const LinearGradient(
          colors: [AppColors.primary, AppColors.secondary, AppColors.accent],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );

    return AnimatedOpacity(
      opacity: widget.disabled ? 0.65 : 1.0,
      duration: const Duration(milliseconds: 200),
      child: GestureDetector(
        onTap: widget.disabled ? null : widget.onPressed,
        child: Container(
          width: double.infinity,
          height: 52,
          decoration: BoxDecoration(
            gradient: grad,
            borderRadius: BorderRadius.circular(widget.borderRadius),
            boxShadow: [
              BoxShadow(
                color: (widget.shadow ?? AppColors.primary).withOpacity(0.42),
                blurRadius: 28,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Stack(
            children: [
              // Shimmer overlay
              AnimatedBuilder(
                animation: _shimmer,
                builder: (_, __) => Positioned.fill(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(widget.borderRadius),
                    child: Transform.translate(
                      offset: Offset(-200 + _shimmer.value * 600, 0),
                      child: Container(
                        width: 80,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Colors.white.withOpacity(0),
                              Colors.white.withOpacity(0.22),
                              Colors.white.withOpacity(0),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              // Content
              Center(
                child: widget.loading
                    ? Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const SizedBox(
                            width: 18, height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.5,
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Text(
                            widget.label,
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: widget.fontSize,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                              letterSpacing: 0.02,
                            ),
                          ),
                        ],
                      )
                    : Text(
                        widget.label,
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: widget.fontSize,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          letterSpacing: 0.02,
                        ),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
