import 'package:flutter/material.dart';

class ScratchPadWidget extends StatefulWidget {
  const ScratchPadWidget({super.key});
  @override
  State<ScratchPadWidget> createState() => _ScratchPadWidgetState();
}

class _ScratchPadWidgetState extends State<ScratchPadWidget> {
  List<DrawingPoint?> points = [];
  Color selectedColor = Colors.blue;
  double strokeWidth = 2.0;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 260,
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.withOpacity(0.2)), boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4)]),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('SCRATCH PAD', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
                TextButton(onPressed: () => setState(() => points.clear()), child: const Text('Clear', style: TextStyle(color: Colors.red, fontSize: 10))),
              ],
            ),
          ),
          Expanded(
            child: GestureDetector(
              onPanStart: (details) {
                setState(() {
                  points.add(DrawingPoint(details.localPosition, Paint()..color = selectedColor..strokeCap = StrokeCap.round..strokeWidth = strokeWidth));
                });
              },
              onPanUpdate: (details) {
                setState(() {
                  points.add(DrawingPoint(details.localPosition, Paint()..color = selectedColor..strokeCap = StrokeCap.round..strokeWidth = strokeWidth));
                });
              },
              onPanEnd: (details) {
                setState(() => points.add(null));
              },
              child: CustomPaint(
                painter: DrawingPainter(pointsList: points),
                size: Size.infinite,
              ),
            ),
          ),
          _toolbar(),
        ],
      ),
    );
  }

  Widget _toolbar() {
    final colors = [Colors.blue, Colors.green, Colors.red, Colors.black];
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: const BoxDecoration(border: Border(top: BorderSide(color: Color(0xFFF1F5F9)))),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: colors.map((c) => GestureDetector(onTap: () => setState(() => selectedColor = c), child: Container(width: 20, height: 20, decoration: BoxDecoration(color: c, shape: BoxShape.circle, border: Border.all(color: selectedColor == c ? Colors.black : Colors.transparent, width: 2))))).toList(),
      ),
    );
  }
}

class DrawingPoint {
  Offset offset;
  Paint paint;
  DrawingPoint(this.offset, this.paint);
}

class DrawingPainter extends CustomPainter {
  final List<DrawingPoint?> pointsList;
  DrawingPainter({required this.pointsList});

  @override
  void paint(Canvas canvas, Size size) {
    for (int i = 0; i < pointsList.length - 1; i++) {
      if (pointsList[i] != null && pointsList[i + 1] != null) {
        canvas.drawLine(pointsList[i]!.offset, pointsList[i + 1]!.offset, pointsList[i]!.paint);
      }
    }
  }

  @override
  bool shouldRepaint(DrawingPainter oldDelegate) => true;
}
