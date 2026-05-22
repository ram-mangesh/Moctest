import 'package:flutter/material.dart';

class DifficultySlider extends StatefulWidget {
  final ValueChanged<String> onConfirm;
  const DifficultySlider({super.key, required this.onConfirm});

  @override
  State<DifficultySlider> createState() => _DifficultySliderState();
}

class _DifficultySliderState extends State<DifficultySlider> {
  double _val = 1;
  final List<String> _labels = ['EASY', 'MEDIUM', 'DIFFICULT'];

  @override
  Widget build(BuildContext context) {
    Color active = _val == 0 ? Colors.green : (_val == 1 ? Colors.orange : Colors.red);
    
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: _labels.asMap().entries.map((e) => Text(e.value, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: _val == e.key ? active : Colors.grey))).toList(),
        ),
        Slider(
          value: _val,
          min: 0,
          max: 2,
          divisions: 2,
          activeColor: active,
          onChanged: (v) => setState(() => _val = v),
        ),
        const SizedBox(height: 24),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => widget.onConfirm(_labels[_val.toInt()]),
            style: ElevatedButton.styleFrom(backgroundColor: active, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
            child: const Text('START TEST', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ),
      ],
    );
  }
}
