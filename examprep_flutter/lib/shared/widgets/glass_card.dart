import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:examprep_app/core/theme/app_theme.dart';

/// GlassCard — translucent frosted glass card (replicates CSS backdrop-filter:blur)
class GlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final double borderRadius;
  final Color? glassBg;
  final Color? borderColor;
  final Color? shadowColor;
  final double shadowBlurRadius;
  final double blurSigma;

  const GlassCard({
    super.key,
    required this.child,
    this.padding,
    this.borderRadius = 18,
    this.glassBg,
    this.borderColor,
    this.shadowColor,
    this.shadowBlurRadius = 48,
    this.blurSigma = 28,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blurSigma, sigmaY: blurSigma),
        child: Container(
          padding: padding,
          decoration: BoxDecoration(
            color: glassBg ?? Colors.white.withOpacity(0.88),
            borderRadius: BorderRadius.circular(borderRadius),
            border: Border.all(
              color: borderColor ?? AppColors.primary.withOpacity(0.14),
              width: 1.5,
            ),
            boxShadow: [
              if (shadowColor != null)
                BoxShadow(
                  color: shadowColor!,
                  blurRadius: shadowBlurRadius,
                ),
              BoxShadow(
                color: Colors.white.withOpacity(0.98),
                blurRadius: 0,
                spreadRadius: 0,
                offset: const Offset(0, 1),
              ),
            ],
          ),
          child: child,
        ),
      ),
    );
  }
}
