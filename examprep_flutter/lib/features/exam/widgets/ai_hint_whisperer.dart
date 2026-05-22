import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:examprep_app/core/api/dio_client.dart';

class AiHintWhisperer extends ConsumerStatefulWidget {
  final int questionId;
  final int timeSpent;
  final int optionChanges;

  const AiHintWhisperer({
    super.key,
    required this.questionId,
    this.timeSpent = 0,
    this.optionChanges = 0,
  });

  @override
  ConsumerState<AiHintWhisperer> createState() => _AiHintWhispererState();
}

class _AiHintWhispererState extends ConsumerState<AiHintWhisperer> {
  bool _visible = false;
  String? _hint;
  bool _loading = false;
  bool _open = false;
  bool _hintUsed = false;
  int? _lastQId;

  @override
  void didUpdateWidget(AiHintWhisperer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.questionId != _lastQId) {
      _lastQId = widget.questionId;
      _reset();
    }
    _checkStuck();
  }

  void _reset() {
    setState(() {
      _visible = false;
      _hint = null;
      _open = false;
      _hintUsed = false;
    });
  }

  void _checkStuck() {
    if (!_hintUsed && (widget.timeSpent >= 45 || widget.optionChanges >= 3)) {
      if (!_visible) setState(() => _visible = true);
    }
  }

  Future<void> _fetchHint() async {
    if (_hint != null) { setState(() => _open = true); return; }
    setState(() { _loading = true; _open = true; });
    try {
      final res = await ref.read(dioClientProvider).post('/user/ai/hint', data: {
        'questionId': widget.questionId,
        'timeSpent': widget.timeSpent,
        'optionChanges': widget.optionChanges,
      });
      if (mounted) {
        setState(() {
          _hint = res.data is String ? res.data : 'Think about what core concept this question tests.';
          _hintUsed = true;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _hint = 'Consider the fundamental principles behind this topic.';
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_visible) return const SizedBox();

    return Container(
      margin: const EdgeInsets.only(top: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!_open)
            _triggerButton()
          else
            _hintCard(),
        ],
      ),
    );
  }

  Widget _triggerButton() {
    return GestureDetector(
      onTap: _fetchHint,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(color: Colors.amber.shade50, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.amber.shade200)),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('💡', style: TextStyle(fontSize: 16)),
            const SizedBox(width: 8),
            const Text('Need a hint?', style: TextStyle(color: Color(0xFFB45309), fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(width: 8),
            Text(widget.timeSpent >= 45 ? '${widget.timeSpent}s here' : '${widget.optionChanges}x changes', style: TextStyle(color: Colors.amber.shade700.withOpacity(0.6), fontSize: 10)),
          ],
        ),
      ),
    );
  }

  Widget _hintCard() {
    return Container(
      decoration: BoxDecoration(color: Colors.amber.shade50, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.amber.shade200)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(color: Colors.amber.shade100.withOpacity(0.3), border: Border(bottom: BorderSide(color: Colors.amber.shade200))),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('💡 AI SOCRATIC HINT', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFFB45309), letterSpacing: 1)),
                GestureDetector(onTap: () => setState(() => _open = false), child: const Icon(Icons.close, size: 14, color: Colors.amber)),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: _loading ? const Center(child: SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.amber))) : Text(_hint ?? '', style: const TextStyle(fontSize: 13, color: Color(0xFF92400E), height: 1.5)),
          ),
        ],
      ),
    );
  }
}
