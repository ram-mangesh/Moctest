import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:examprep_app/core/theme/app_theme.dart';

// ─────────────────────────────────────────────────────────────────────────────
// AntiCheatService — Flutter equivalent of useAntiCheat.js
//
// React original detects (8 modes):
//  1. TAB_SWITCH / WINDOW_BLUR → didChangeAppLifecycleState (in MockTest screen)
//  2. SPLIT_SCREEN (width drop > 30%) → MediaQuery width change
//  3. COPY_PASTE → clipboard monitoring / TextField options disabled
//  4. RIGHT_CLICK → GestureDetector.onSecondaryTap (desktop)
//  5. KEYBOARD_SHORTCUTS → RawKeyboardListener (Ctrl+C, F12, etc.)
//  6. FULLSCREEN_EXIT → SystemChrome mode change
//  7. DEVTOOLS_OPEN → Not applicable on mobile (browser-only)
//  8. SPLIT_SCREEN via SplitScreenDetector → screen size monitoring
//
// NOTE: Tab switch (AppLifecycle.paused) is handled directly in MockTestScreen
// This service handles items 2-6.
// ─────────────────────────────────────────────────────────────────────────────

class AntiCheatService extends StatefulWidget {
  final Widget child;
  final void Function(String reason) onViolation;

  const AntiCheatService({
    super.key,
    required this.child,
    required this.onViolation,
  });

  @override
  State<AntiCheatService> createState() => _AntiCheatServiceState();
}

class _AntiCheatServiceState extends State<AntiCheatService> {
  double? _baseWidth;
  static const _splitThreshold = 0.30; // > 30% width drop = split screen
  bool _splitFired = false;
  Timer? _widthCheckTimer;

  @override
  void initState() {
    super.initState();
    // Check width periodically for split screen (mirrors window.resize handler)
    _widthCheckTimer = Timer.periodic(const Duration(seconds: 2), (_) {
      _checkSplitScreen();
    });
  }

  @override
  void dispose() {
    _widthCheckTimer?.cancel();
    super.dispose();
  }

  void _checkSplitScreen() {
    if (!mounted) return;
    final currentWidth = MediaQuery.of(context).size.width;

    if (_baseWidth == null) {
      _baseWidth = currentWidth;
      return;
    }

    final drop = (_baseWidth! - currentWidth) / _baseWidth!;

    if (drop > _splitThreshold && !_splitFired) {
      _splitFired = true;
      widget.onViolation(
        'Split screen detected — page width dropped by ${(drop * 100).round()}%. '
        'Screen splitting is not allowed during the exam.',
      );
    }

    if (drop < 0.10 && _splitFired) {
      _splitFired = false;
      _baseWidth = currentWidth;
    }
  }

  // ── Keyboard shortcut blocking (mirrors document.keydown handler)
  KeyEventResult _handleKeyEvent(FocusNode _, KeyEvent event) {
    if (event is! KeyDownEvent) return KeyEventResult.ignored;

    final ctrl = HardwareKeyboard.instance.isControlPressed ||
        HardwareKeyboard.instance.isMetaPressed;
    final alt = HardwareKeyboard.instance.isAltPressed;

    final key = event.logicalKey;

    if (ctrl && key == LogicalKeyboardKey.keyC) {
      widget.onViolation('Ctrl+C (copy) detected');
      return KeyEventResult.handled;
    }
    if (ctrl && key == LogicalKeyboardKey.keyV) {
      widget.onViolation('Ctrl+V (paste) detected');
      return KeyEventResult.handled;
    }
    if (ctrl && key == LogicalKeyboardKey.keyF) {
      widget.onViolation('Ctrl+F (find) detected');
      return KeyEventResult.handled;
    }
    if (ctrl && key == LogicalKeyboardKey.keyU) {
      widget.onViolation('Ctrl+U (view source) detected');
      return KeyEventResult.handled;
    }
    if (ctrl && key == LogicalKeyboardKey.keyP) {
      widget.onViolation('Ctrl+P (print) detected');
      return KeyEventResult.handled;
    }
    if (ctrl && key == LogicalKeyboardKey.keyA) {
      return KeyEventResult.handled; // block select all silently
    }
    if (key == LogicalKeyboardKey.f12) {
      widget.onViolation('F12 (DevTools) detected');
      return KeyEventResult.handled;
    }
    if (alt && key == LogicalKeyboardKey.tab) {
      widget.onViolation('Alt+Tab detected');
      return KeyEventResult.handled;
    }

    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    return KeyboardListener(
      focusNode: FocusNode()..requestFocus(),
      onKeyEvent: (event) => _handleKeyEvent(FocusNode(), event),
      child: // Right-click blocker (desktop)
          GestureDetector(
        onSecondaryTap: () =>
            widget.onViolation('Right-click attempted during exam'),
        // Block long-press context menu on mobile
        onLongPress: () {},
        child: widget.child,
      ),
    );
  }
}
