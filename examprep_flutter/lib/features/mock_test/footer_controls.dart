import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:examprep_app/core/theme/app_theme.dart';

// ── FooterControls — mirrors FooterControls.jsx
// Prev | Mark Review | [Q indicator] | Next | Submit
class FooterControls extends StatelessWidget {
  final int currentQ;
  final int total;
  final VoidCallback onPrev;
  final VoidCallback onNext;
  final bool isReview;
  final VoidCallback onToggleReview;
  final VoidCallback onSubmit;

  const FooterControls({
    super.key,
    required this.currentQ,
    required this.total,
    required this.onPrev,
    required this.onNext,
    required this.isReview,
    required this.onToggleReview,
    required this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          // Previous
          _FooterBtn(
            label: '← Prev',
            onTap: currentQ > 0 ? onPrev : null,
            outlined: true,
          ),

          const SizedBox(width: 8),

          // Mark for review
          _FooterBtn(
            label: isReview ? '🟡 Marked' : '🔖 Mark Review',
            onTap: onToggleReview,
            outlined: true,
            color: AppColors.warning,
          ),

          // Center question indicator
          Expanded(
            child: Center(
              child: Text(
                '${currentQ + 1} / $total',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  color: AppColors.inkDark,
                ),
              ),
            ),
          ),

          // Next
          _FooterBtn(
            label: 'Next →',
            onTap: currentQ < total - 1 ? onNext : null,
            outlined: true,
          ),

          const SizedBox(width: 8),

          // Submit
          _FooterBtn(
            label: 'Submit',
            onTap: onSubmit,
            filled: true,
            color: AppColors.error,
          ),
        ],
      ),
    );
  }
}

class _FooterBtn extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;
  final bool outlined;
  final bool filled;
  final Color? color;

  const _FooterBtn({
    required this.label,
    this.onTap,
    this.outlined = false,
    this.filled = false,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final c = color ?? AppColors.primary;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedOpacity(
        opacity: onTap == null ? 0.4 : 1.0,
        duration: const Duration(milliseconds: 200),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: filled ? c : (outlined ? c.withOpacity(0.08) : Colors.transparent),
            borderRadius: BorderRadius.circular(10),
            border: outlined ? Border.all(color: c.withOpacity(0.3)) : null,
          ),
          child: Text(
            label,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: filled ? Colors.white : c,
            ),
          ),
        ),
      ),
    );
  }
}
