import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:examprep_app/core/api/dio_client.dart';
import 'package:examprep_app/core/theme/app_theme.dart';
import 'package:examprep_app/shared/widgets/user_layout.dart';

// --- DATA MODEL ---
class ChatMessage {
  final String role; // 'user' or 'ai'
  final String text;
  final DateTime time;
  ChatMessage({required this.role, required this.text, required this.time});
}

class AiChatbot extends ConsumerStatefulWidget {
  const AiChatbot({super.key});
  @override
  ConsumerState<AiChatbot> createState() => _AiChatbotState();
}

class _AiChatbotState extends ConsumerState<AiChatbot> {
  final List<ChatMessage> _messages = [];
  final TextEditingController _ctrl = TextEditingController();
  final ScrollController _scroll = ScrollController();
  bool _loading = false;
  String? _typingText;

  @override
  void initState() {
    super.initState();
    _addInitialMessage();
  }

  void _addInitialMessage() {
    _messages.add(ChatMessage(
      role: 'ai',
      text: "Hello! I'm your AI Study Assistant. ✨\nHow can I help you with your preparation today?",
      time: DateTime.now(),
    ));
  }

  Future<void> _sendMessage() async {
    final text = _ctrl.text.trim();
    if (text.isEmpty || _loading) return;

    setState(() {
      _messages.add(ChatMessage(role: 'user', text: text, time: DateTime.now()));
      _ctrl.clear();
      _loading = true;
    });
    _scrollToBottom();

    try {
      final res = await ref.read(dioClientProvider).postText('/user/ai/chat', text);
      final fullText = res.data?.toString() ?? "I'm sorry, I couldn't process that.";
      
      setState(() => _loading = false);
      _animateTyping(fullText);
    } catch (e) {
      setState(() {
        _loading = false;
        _messages.add(ChatMessage(role: 'ai', text: "⚠️ AI service temporarily unavailable.", time: DateTime.now()));
      });
      _scrollToBottom();
    }
  }

  void _animateTyping(String text) {
    int i = 0;
    Timer.periodic(const Duration(milliseconds: 10), (timer) {
      i++;
      if (mounted) {
        setState(() => _typingText = text.substring(0, i));
      }
      if (i >= text.length) {
        timer.cancel();
        if (mounted) {
          setState(() {
            _messages.add(ChatMessage(role: 'ai', text: text, time: DateTime.now()));
            _typingText = null;
          });
          _scrollToBottom();
        }
      }
    });
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(_scroll.position.maxScrollExtent, duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return UserLayout(
      title: 'AI Chatbot',
      child: Column(
        children: [
          Expanded(
            child: Container(
              color: const Color(0xFFF8FAFC),
              child: ListView.builder(
                controller: _scroll,
                padding: const EdgeInsets.all(20),
                itemCount: _messages.length + (_typingText != null ? 1 : (_loading && _typingText == null ? 1 : 0)),
                itemBuilder: (context, i) {
                  if (i < _messages.length) {
                    return _ChatBubble(msg: _messages[i]);
                  }
                  if (_typingText != null) {
                    return _ChatBubble(msg: ChatMessage(role: 'ai', text: _typingText!, time: DateTime.now()), isTyping: true);
                  }
                  return const _LoadingBubble();
                },
              ),
            ),
          ),
          _buildInput(),
        ],
      ),
    );
  }

  Widget _buildInput() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _ctrl,
                decoration: InputDecoration(
                  hintText: 'Ask anything about your exam...',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                  filled: true,
                  fillColor: Colors.grey.shade100,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                ),
                onSubmitted: (_) => _sendMessage(),
              ),
            ),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: _sendMessage,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.primary),
                child: const Icon(Icons.send, color: Colors.white, size: 20),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ChatBubble extends StatelessWidget {
  final ChatMessage msg;
  final bool isTyping;
  const _ChatBubble({required this.msg, this.isTyping = false});

  @override
  Widget build(BuildContext context) {
    final isUser = msg.role == 'user';
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          if (!isUser) _Avatar(icon: '🤖', color: Colors.indigo.shade600),
          const SizedBox(width: 12),
          Flexible(
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isUser ? AppColors.primary : Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(20),
                  topRight: const Radius.circular(20),
                  bottomLeft: Radius.circular(isUser ? 20 : 4),
                  bottomRight: Radius.circular(isUser ? 4 : 20),
                ),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    msg.text,
                    style: GoogleFonts.plusJakartaSans(
                      color: isUser ? Colors.white : AppColors.inkDark,
                      fontSize: 14,
                      height: 1.5,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  if (isTyping) ...[
                    const SizedBox(height: 4),
                    const _TypingIndicator(),
                  ],
                ],
              ),
            ),
          ),
          const SizedBox(width: 12),
          if (isUser) _Avatar(icon: '👤', color: AppColors.primary),
        ],
      ),
    );
  }
}

class _Avatar extends StatelessWidget {
  final String icon;
  final Color color;
  const _Avatar({required this.icon, required this.color});
  @override
  Widget build(BuildContext context) => Container(
        width: 36, height: 36,
        decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        child: Center(child: Text(icon, style: const TextStyle(fontSize: 18))),
      );
}

class _TypingIndicator extends StatelessWidget {
  const _TypingIndicator();
  @override
  Widget build(BuildContext context) => Text('▋', style: TextStyle(color: AppColors.primary.withOpacity(0.5)));
}

class _LoadingBubble extends StatelessWidget {
  const _LoadingBubble();
  @override
  Widget build(BuildContext context) => const Padding(
        padding: EdgeInsets.only(bottom: 16),
        child: Row(
          children: [
            _Avatar(icon: '🤖', color: Colors.indigo),
            SizedBox(width: 12),
            CircularProgressIndicator(strokeWidth: 2),
          ],
        ),
      );
}
