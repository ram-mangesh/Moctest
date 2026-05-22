import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:examprep_app/core/theme/app_theme.dart';

/// AppTextField — mirrors React's floating-label field (.lx-field)
/// Features:
///  • Floating label that rises up when focused/has content
///  • Prefix emoji icon
///  • Optional suffix icon (eye toggle, checkmark)
///  • Focus-aware border/background changes
class AppTextField extends StatefulWidget {
  final TextEditingController? controller;
  final String label;
  final String? prefixIcon;
  final Widget? suffixIcon;
  final bool obscureText;
  final TextInputType keyboardType;
  final TextInputAction textInputAction;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final bool enabled;

  const AppTextField({
    super.key,
    this.controller,
    required this.label,
    this.prefixIcon,
    this.suffixIcon,
    this.obscureText = false,
    this.keyboardType = TextInputType.text,
    this.textInputAction = TextInputAction.next,
    this.onChanged,
    this.onSubmitted,
    this.enabled = true,
  });

  @override
  State<AppTextField> createState() => _AppTextFieldState();
}

class _AppTextFieldState extends State<AppTextField> {
  final _focus = FocusNode();
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    _focus.addListener(() {
      setState(() => _isFocused = _focus.hasFocus);
    });
  }

  @override
  void dispose() {
    _focus.dispose();
    super.dispose();
  }

  bool get _isActive =>
      _isFocused || (widget.controller?.text.isNotEmpty ?? false);

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Input
        AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          decoration: BoxDecoration(
            color: _isFocused
                ? Colors.white.withOpacity(0.97)
                : Colors.white.withOpacity(0.78),
            borderRadius: BorderRadius.circular(13),
            border: Border.all(
              color: _isFocused
                  ? AppColors.primary
                  : AppColors.primary.withOpacity(0.18),
              width: 1.5,
            ),
            boxShadow: _isFocused
                ? [BoxShadow(color: AppColors.primary.withOpacity(0.11), blurRadius: 12)]
                : [],
          ),
          child: Row(
            children: [
              if (widget.prefixIcon != null)
                Padding(
                  padding: const EdgeInsets.only(left: 15),
                  child: Text(widget.prefixIcon!, style: const TextStyle(fontSize: 16)),
                ),
              Expanded(
                child: TextFormField(
                  controller: widget.controller,
                  focusNode: _focus,
                  obscureText: widget.obscureText,
                  keyboardType: widget.keyboardType,
                  textInputAction: widget.textInputAction,
                  onChanged: widget.onChanged,
                  onFieldSubmitted: widget.onSubmitted,
                  enabled: widget.enabled,
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 14.5,
                    fontWeight: FontWeight.w500,
                    color: AppColors.inkDark,
                  ),
                  decoration: InputDecoration(
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    contentPadding: EdgeInsets.only(
                      left: widget.prefixIcon == null ? 16 : 12,
                      right: 44,
                      top: _isActive ? 22 : 14,
                      bottom: 8,
                    ),
                    hintText: widget.label,
                    hintStyle: GoogleFonts.plusJakartaSans(
                      color: Colors.transparent, // hidden — we use custom floating label
                    ),
                  ),
                ),
              ),
              if (widget.suffixIcon != null)
                Padding(
                  padding: const EdgeInsets.only(right: 14),
                  child: widget.suffixIcon!,
                ),
            ],
          ),
        ),

        // Floating label
        Positioned(
          left: widget.prefixIcon != null ? 44 : 16,
          top: _isActive ? 8 : null,
          bottom: _isActive ? null : 0,
          child: IgnorePointer(
            child: Align(
              alignment: Alignment.centerLeft,
              child: AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 220),
                style: GoogleFonts.plusJakartaSans(
                  fontSize: _isActive ? 10.5 : 14,
                  fontWeight: _isActive ? FontWeight.w700 : FontWeight.w500,
                  color: _isActive
                      ? AppColors.primary
                      : AppColors.primary.withOpacity(0.5),
                ),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  child: Text(widget.label),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
