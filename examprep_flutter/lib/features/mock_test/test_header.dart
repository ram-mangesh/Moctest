import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:examprep_app/core/theme/app_theme.dart';
import 'mock_test_screen.dart';

// ── TestHeader — mirrors TestHeader.jsx
// Shows: exam name | countdown timer | live analytics indicator
class TestHeader extends StatefulWidget {
  final String examName;
  final int duration; // seconds
  final VoidCallback onTimeUp;
  final List<String> analyticsNudges;

  const TestHeader({
    super.key,
    required this.examName,
    required this.duration,
    required this.onTimeUp,
    this.analyticsNudges = const [],
  });

  @override
  State<TestHeader> createState() => _TestHeaderState();
}

class _TestHeaderState extends State<TestHeader> {
  String _fmtTime(int secs) {
    final h = secs ~/ 3600;
    final m = (secs % 3600) ~/ 60;
    final s = secs % 60;
    if (h > 0) {
      return '${h.toString().padLeft(2, '0')}:${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
    }
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  Color get _timerColor {
    if (widget.duration < 60) return AppColors.error;
    if (widget.duration < 300) return AppColors.warning;
    return AppColors.primary;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          // Back button
          IconButton(
            icon: const Icon(Icons.arrow_back_ios_new, size: 18),
            onPressed: () {},
          ),
          // Exam name
          Expanded(
            child: Text(
              widget.examName,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: AppColors.inkDark,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          // Nudge indicator
          if (widget.analyticsNudges.isNotEmpty)
            Container(
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.warning.withOpacity(0.12),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.warning.withOpacity(0.3)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('💡', style: TextStyle(fontSize: 12)),
                  const SizedBox(width: 4),
                  Text('AI Nudge',
                      style: GoogleFonts.plusJakartaSans(
                          fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.warning)),
                ],
              ),
            ),
          // Timer
          AnimatedContainer(
            duration: const Duration(milliseconds: 500),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: _timerColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: _timerColor.withOpacity(0.3)),
            ),
            child: Row(
              children: [
                Icon(Icons.timer_outlined, size: 16, color: _timerColor),
                const SizedBox(width: 6),
                Text(
                  _fmtTime(widget.duration),
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: _timerColor,
                    letterSpacing: 0.05,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
