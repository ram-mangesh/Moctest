import 'package:flutter/material.dart';
import 'package:examprep_app/core/theme/app_theme.dart';

// ── ScratchPad — mirrors ScratchPad.jsx (HTML canvas with drawing)
// Flutter equivalent: CustomPainter + GestureDetector
class ScratchPad extends StatefulWidget {
  const ScratchPad({super.key});

  @override
  State<ScratchPad> createState() => _ScratchPadState();
}

class _ScratchPadState extends State<ScratchPad> {
  final List<List<Offset>> _strokes = [];
  List<Offset> _currentStroke = [];
  Color _penColor = Colors.black;
  double _strokeWidth = 2.0;
  bool _isEraser = false;

  void _onPanStart(DragStartDetails d) {
    _currentStroke = [d.localPosition];
    setState(() {});
  }

  void _onPanUpdate(DragUpdateDetails d) {
    _currentStroke.add(d.localPosition);
    setState(() {});
  }

  void _onPanEnd(DragEndDetails d) {
    _strokes.add(List.from(_currentStroke));
    _currentStroke = [];
    setState(() {});
  }

  void _clear() => setState(() {
        _strokes.clear();
        _currentStroke = [];
      });

  void _undo() {
    if (_strokes.isNotEmpty) setState(() => _strokes.removeLast());
  }

  @override
  Widget build(BuildContext context) {
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
          // Toolbar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.05),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              border: Border(
                  bottom: BorderSide(color: AppColors.primary.withOpacity(0.1))),
            ),
            child: Row(
              children: [
                const Icon(Icons.edit_note_outlined, size: 14, color: AppColors.primary),
                const SizedBox(width: 4),
                const Text('Scratch Pad', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.primary)),
                const Spacer(),
                // Pen / Eraser toggle
                IconButton(
                  icon: Icon(_isEraser ? Icons.edit : Icons.auto_fix_normal,
                      size: 16, color: _isEraser ? AppColors.warning : AppColors.primary),
                  onPressed: () => setState(() => _isEraser = !_isEraser),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
                const SizedBox(width: 8),
                // Undo
                IconButton(
                  icon: const Icon(Icons.undo, size: 16, color: AppColors.inkMuted),
                  onPressed: _undo,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
                const SizedBox(width: 8),
                // Clear
                IconButton(
                  icon: const Icon(Icons.delete_outline, size: 16, color: AppColors.error),
                  onPressed: _clear,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
          ),

          // Canvas
          Expanded(
            child: GestureDetector(
              onPanStart: _onPanStart,
              onPanUpdate: _onPanUpdate,
              onPanEnd: _onPanEnd,
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(bottom: Radius.circular(16)),
                child: CustomPaint(
                  painter: _ScratchPainter(
                    strokes: _strokes,
                    currentStroke: _currentStroke,
                    strokeWidth: _strokeWidth,
                    penColor: _isEraser ? Colors.white : _penColor,
                  ),
                  child: Container(color: Colors.white),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ScratchPainter extends CustomPainter {
  final List<List<Offset>> strokes;
  final List<Offset> currentStroke;
  final double strokeWidth;
  final Color penColor;

  _ScratchPainter({
    required this.strokes,
    required this.currentStroke,
    required this.strokeWidth,
    required this.penColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = penColor
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..style = PaintingStyle.stroke;

    for (final stroke in [...strokes, currentStroke]) {
      if (stroke.length < 2) continue;
      final path = Path()..moveTo(stroke[0].dx, stroke[0].dy);
      for (int i = 1; i < stroke.length; i++) {
        path.lineTo(stroke[i].dx, stroke[i].dy);
      }
      canvas.drawPath(path, paint);
    }
  }

  @override
  bool shouldRepaint(covariant _ScratchPainter old) => true;
}
