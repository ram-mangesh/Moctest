import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:examprep_app/core/theme/app_theme.dart';
import 'mock_test_screen.dart';

// ── QuestionPalette — mirrors QuestionPalette.jsx
// Grid of question numbers, color-coded:
//   Green  = answered
//   Orange = marked for review
//   Gray   = not visited
//   Blue   = current
class QuestionPalette extends StatelessWidget {
  final List<Question> questions;
  final int currentQ;
  final Map<int, AnswerPayload> answers;
  final Set<int> review;
  final void Function(int) onSelect;

  const QuestionPalette({
    super.key,
    required this.questions,
    required this.currentQ,
    required this.answers,
    required this.review,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    final total = questions.length;
    final answered = answers.length;
    final notAnswered = total - answered;
    final markedReview = review.length;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: AppColors.primary.withOpacity(0.06), blurRadius: 16),
        ],
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.05),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              border: Border(
                  bottom: BorderSide(color: AppColors.primary.withOpacity(0.1))),
            ),
            child: Text(
              'Question Palette',
              style: GoogleFonts.plusJakartaSans(
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  color: AppColors.inkDark),
            ),
          ),

          // Legend
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              children: [
                _Legend('Answered', AppColors.success),
                const SizedBox(height: 4),
                _Legend('Not Answered', const Color(0xFF9CA3AF)),
                const SizedBox(height: 4),
                _Legend('Marked Review', AppColors.warning),
                const SizedBox(height: 4),
                _Legend('Current', AppColors.primary),
              ],
            ),
          ),

          // Stats row
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _Stat('$answered', 'Answered', AppColors.success),
                _Stat('$notAnswered', 'Remaining', const Color(0xFF9CA3AF)),
                _Stat('$markedReview', 'Review', AppColors.warning),
              ],
            ),
          ),

          // Grid
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.all(12),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 5,
                childAspectRatio: 1,
                crossAxisSpacing: 6,
                mainAxisSpacing: 6,
              ),
              itemCount: questions.length,
              itemBuilder: (_, i) {
                final q = questions[i];
                final isCurrent = i == currentQ;
                final isAnswered = answers.containsKey(q.id);
                final isReview = review.contains(q.id);

                Color bgColor;
                Color textColor = Colors.white;
                if (isCurrent) {
                  bgColor = AppColors.primary;
                } else if (isAnswered && isReview) {
                  bgColor = AppColors.warning;
                } else if (isAnswered) {
                  bgColor = AppColors.success;
                } else if (isReview) {
                  bgColor = AppColors.warning.withOpacity(0.7);
                } else {
                  bgColor = const Color(0xFFF3F4F6);
                  textColor = AppColors.inkMuted;
                }

                return GestureDetector(
                  onTap: () => onSelect(i),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    decoration: BoxDecoration(
                      color: bgColor,
                      borderRadius: BorderRadius.circular(8),
                      border: isCurrent
                          ? Border.all(color: AppColors.primaryDark, width: 2)
                          : null,
                    ),
                    child: Center(
                      child: Text(
                        '${i + 1}',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: textColor,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _Legend extends StatelessWidget {
  final String label;
  final Color color;
  const _Legend(this.label, this.color);

  @override
  Widget build(BuildContext context) => Row(
        children: [
          Container(
              width: 12, height: 12,
              decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(3))),
          const SizedBox(width: 6),
          Text(label,
              style: GoogleFonts.plusJakartaSans(
                  fontSize: 10.5, color: AppColors.inkMuted, fontWeight: FontWeight.w600)),
        ],
      );
}

class _Stat extends StatelessWidget {
  final String count, label;
  final Color color;
  const _Stat(this.count, this.label, this.color);

  @override
  Widget build(BuildContext context) => Column(
        children: [
          Text(count,
              style: GoogleFonts.plusJakartaSans(
                  fontSize: 16, fontWeight: FontWeight.w900, color: color)),
          Text(label,
              style: GoogleFonts.plusJakartaSans(
                  fontSize: 9, fontWeight: FontWeight.w700, color: AppColors.inkMuted)),
        ],
      );
}
