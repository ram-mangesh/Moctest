import 'dart:async';
import 'package:flutter/material.dart';

class SplitScreenDetector extends StatefulWidget {
  final Function(String) onViolation;
  final Function(bool) onSplitActive;
  final Widget child;

  const SplitScreenDetector({
    super.key,
    required this.onViolation,
    required this.onSplitActive,
    required this.child,
  });

  @override
  State<SplitScreenDetector> createState() => _SplitScreenDetectorState();
}

class _SplitScreenDetectorState extends State<SplitScreenDetector> with WidgetsBindingObserver {
  double? _baseWidth;
  bool _isSplit = false;
  int _countdown = 10;
  Timer? _timer;
  bool _violated = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _timer?.cancel();
    super.dispose();
  }

  @override
  void didChangeMetrics() {
    final double currentWidth = WidgetsBinding.instance.platformDispatcher.views.first.physicalSize.width / 
                                WidgetsBinding.instance.platformDispatcher.views.first.devicePixelRatio;
    
    _baseWidth ??= currentWidth;

    final drop = (_baseWidth! - currentWidth) / _baseWidth!;
    final bool isNowSplit = drop > 0.28;

    if (isNowSplit && !_isSplit) {
      _startSplitDetection();
    } else if (!isNowSplit && _isSplit) {
      _resolveSplit();
    }
  }

  void _startSplitDetection() {
    setState(() {
      _isSplit = true;
      _countdown = 10;
      _violated = false;
    });
    widget.onSplitActive(true);
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_countdown > 1) {
        setState(() => _countdown--);
      } else {
        setState(() {
          _countdown = 0;
          _violated = true;
          _timer?.cancel();
        });
        widget.onViolation("Split screen detected for 10s. Reduction: >28%.");
      }
    });
  }

  void _resolveSplit() {
    _timer?.cancel();
    setState(() {
      _isSplit = false;
      _violated = false;
    });
    widget.onSplitActive(false);
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        widget.child,
        if (_isSplit) _buildOverlay(),
      ],
    );
  }

  Widget _buildOverlay() {
    return Material(
      color: Colors.black.withOpacity(0.92),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 80, height: 80,
                decoration: BoxDecoration(color: _violated ? Colors.red : Colors.orange, shape: BoxShape.circle),
                child: Center(child: Text(_violated ? '🚫' : '⚠️', style: const TextStyle(fontSize: 40))),
              ),
              const SizedBox(height: 24),
              Text(_violated ? 'Violation Recorded' : 'Split Screen Detected', style: TextStyle(color: _violated ? Colors.red : Colors.orange, fontSize: 22, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              const Text('Your screen appears to be split. Please restore full screen mode to continue.', textAlign: TextAlign.center, style: TextStyle(color: Colors.white70)),
              const SizedBox(height: 32),
              if (!_violated) ...[
                Stack(
                  alignment: Alignment.center,
                  children: [
                    SizedBox(width: 80, height: 80, child: CircularProgressIndicator(value: _countdown / 10, strokeWidth: 4, color: Colors.orange)),
                    Text('$_countdown', style: const TextStyle(color: Colors.orange, fontSize: 24, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 16),
                const Text('Restore full screen within seconds to avoid violation', style: TextStyle(color: Colors.white54, fontSize: 12)),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
