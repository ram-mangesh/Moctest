import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:examprep_app/core/providers/auth_provider.dart';
import 'package:examprep_app/core/theme/app_theme.dart';
import 'package:examprep_app/shared/widgets/glass_card.dart';
import 'package:examprep_app/shared/widgets/gradient_button.dart';
import 'package:examprep_app/shared/widgets/app_text_field.dart';
import 'package:examprep_app/shared/widgets/animated_orbs.dart';

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN SCREEN — Full pixel parity with Login.jsx
// Features:
//  • Animated glassmorphism card (right panel)
//  • Left hero panel with feature chips + stat card (hidden on small screens)
//  • Floating-label email + password fields
//  • Show/hide password toggle (👁️ / 🙈)
//  • Loading spinner during API call
//  • Error banner with shake animation
//  • Success banner → role-based redirect
//  • form state: email, password, focused, showPass, loading, error, success
// ─────────────────────────────────────────────────────────────────────────────

// ── Form state
class _LoginForm {
  final String email;
  final String password;
  const _LoginForm({this.email = '', this.password = ''});
  _LoginForm copyWith({String? email, String? password}) =>
      _LoginForm(email: email ?? this.email, password: password ?? this.password);
}

class _LoginState extends StateNotifier<_LoginForm> {
  _LoginState() : super(const _LoginForm());
  void setEmail(String v) => state = state.copyWith(email: v);
  void setPassword(String v) => state = state.copyWith(password: v);
}

final _loginFormProvider =
    StateNotifierProvider.autoDispose<_LoginState, _LoginForm>(
        (ref) => _LoginState());

// ── UI state
class _LoginUI {
  final bool showPass;
  final bool loading;
  final String? error;
  final bool success;
  const _LoginUI({this.showPass = false, this.loading = false, this.error, this.success = false});
  _LoginUI copyWith({bool? showPass, bool? loading, String? error, bool? success}) =>
      _LoginUI(
        showPass: showPass ?? this.showPass,
        loading: loading ?? this.loading,
        error: error,
        success: success ?? this.success,
      );
}

class _LoginUINotifier extends StateNotifier<_LoginUI> {
  _LoginUINotifier() : super(const _LoginUI());
  void togglePass() => state = state.copyWith(showPass: !state.showPass);
  void setLoading(bool v) => state = state.copyWith(loading: v);
  void setError(String? v) => state = state.copyWith(error: v);
  void setSuccess() => state = state.copyWith(success: true, loading: false);
}

final _loginUIProvider =
    StateNotifierProvider.autoDispose<_LoginUINotifier, _LoginUI>(
        (ref) => _LoginUINotifier());

// ─────────────────────────────────────────────────────────────────────────────
class LoginScreen extends ConsumerWidget {
  const LoginScreen({super.key});

  static const _features = [
    ('📝', 'Exam Manager'),
    ('🤖', 'AI Generator'),
    ('📊', 'Analytics'),
    ('🔒', 'Secure'),
    ('⚡', 'Instant Access'),
  ];

  static const _stats = [
    ('142', 'Questions'),
    ('18', 'Exams'),
    ('6', 'Subjects'),
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final form = ref.watch(_loginFormProvider);
    final ui = ref.watch(_loginUIProvider);
    final size = MediaQuery.of(context).size;
    final isWide = size.width > 940;

    return Scaffold(
      body: Stack(
        children: [
          // ── Gradient background
          const AnimatedBackground(),

          // ── Main layout
          SafeArea(
            child: Row(
              children: [
                // ════ LEFT HERO (hidden on mobile) ════
                if (isWide)
                  Expanded(
                    child: _LeftHero(features: _features, stats: _stats),
                  ),

                // ════ RIGHT FORM PANEL ════
                SizedBox(
                  width: isWide ? 530 : size.width,
                  child: Center(
                    child: SingleChildScrollView(
                      padding: EdgeInsets.symmetric(
                        horizontal: isWide ? 48 : 20,
                        vertical: 32,
                      ),
                      child: _LoginCard(form: form, ui: ui),
                    ),
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

// ─────────────────────────────────────────────────────────────────────────────
// LEFT HERO PANEL
// ─────────────────────────────────────────────────────────────────────────────
class _LeftHero extends StatelessWidget {
  final List<(String, String)> features;
  final List<(String, String)> stats;
  const _LeftHero({required this.features, required this.stats});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border(
          right: BorderSide(
            color: AppColors.primary.withOpacity(0.1),
            width: 1.5,
          ),
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 56, vertical: 64),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 460),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Brand pill
              _BrandPill()
                  .animate()
                  .fadeIn(duration: 550.ms)
                  .slideY(begin: -0.3),

              const SizedBox(height: 44),

              // Headline
              RichText(
                text: TextSpan(
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 64,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.045,
                    height: 1.03,
                    color: AppColors.inkDark,
                  ),
                  children: [
                    TextSpan(text: 'Welcome\n'),
                    TextSpan(
                      text: 'Back.',
                      style: TextStyle(
                        foreground: Paint()
                          ..shader = const LinearGradient(
                            colors: [
                              AppColors.primary,
                              AppColors.secondary,
                              AppColors.accent
                            ],
                          ).createShader(const Rect.fromLTWH(0, 0, 300, 80)),
                      ),
                    ),
                  ],
                ),
              )
                  .animate(delay: 200.ms)
                  .fadeIn()
                  .slideY(begin: 0.3),

              const SizedBox(height: 20),

              Text(
                'Your knowledge journey continues here. Sign in and pick up exactly where you left off.',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 16,
                  height: 1.75,
                  color: const Color(0xFF4338CA).withOpacity(0.62),
                ),
              )
                  .animate(delay: 280.ms)
                  .fadeIn()
                  .slideY(begin: 0.3),

              const SizedBox(height: 34),

              // Feature chips
              Wrap(
                spacing: 9,
                runSpacing: 9,
                children: features.map((f) => _FeatureChip(f.$1, f.$2)).toList(),
              ).animate(delay: 340.ms).fadeIn().slideY(begin: 0.3),

              const SizedBox(height: 44),

              // Stat card
              _StatCard(stats: stats)
                  .animate(delay: 420.ms)
                  .fadeIn()
                  .slideY(begin: 0.3),
            ],
          ),
        ),
      ),
    );
  }
}

class _BrandPill extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 9),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.82),
        borderRadius: BorderRadius.circular(40),
        border: Border.all(color: AppColors.primary.withOpacity(0.2), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.13),
            blurRadius: 28,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.primary, AppColors.secondary, AppColors.pink],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(10),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withOpacity(0.38),
                  blurRadius: 14,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Center(child: Text('🎓', style: TextStyle(fontSize: 18))),
          ),
          const SizedBox(width: 11),
          ShaderMask(
            shaderCallback: (bounds) => const LinearGradient(
              colors: [AppColors.primary, AppColors.secondary],
            ).createShader(bounds),
            child: Text(
              'ExamPrep',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 15.5,
                fontWeight: FontWeight.w800,
                color: Colors.white,
                letterSpacing: -0.02,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FeatureChip extends StatelessWidget {
  final String icon;
  final String label;
  const _FeatureChip(this.icon, this.label);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.75),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: AppColors.primary.withOpacity(0.17),
          width: 1.5,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(icon, style: const TextStyle(fontSize: 13)),
          const SizedBox(width: 6),
          Text(
            label,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF4338CA),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final List<(String, String)> stats;
  const _StatCard({required this.stats});

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(22),
      borderRadius: 22,
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 42, height: 42,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primary, AppColors.accent],
                  ),
                  borderRadius: BorderRadius.circular(21),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.34),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Center(
                  child: Text(
                    'S',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 17,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('System Admin',
                      style: GoogleFonts.plusJakartaSans(
                          fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.inkDark)),
                  Text('● Active session',
                      style: GoogleFonts.plusJakartaSans(
                          fontSize: 11.5, fontWeight: FontWeight.w700, color: AppColors.success)),
                ],
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: [
                    AppColors.primary.withOpacity(0.12),
                    AppColors.secondary.withOpacity(0.1),
                  ]),
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: AppColors.primary.withOpacity(0.22)),
                ),
                child: Text('Admin',
                    style: GoogleFonts.plusJakartaSans(
                        fontSize: 10.5, fontWeight: FontWeight.w800,
                        color: const Color(0xFF4338CA), letterSpacing: 0.05)),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: stats.asMap().entries.map((entry) {
              final isLast = entry.key == stats.length - 1;
              return Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    border: Border(
                      right: isLast
                          ? BorderSide.none
                          : BorderSide(
                              color: AppColors.primary.withOpacity(0.1)),
                    ),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
                  child: Column(
                    children: [
                      Text(entry.value.$1,
                          style: GoogleFonts.plusJakartaSans(
                              fontSize: 22, fontWeight: FontWeight.w900,
                              color: AppColors.inkDark, letterSpacing: -0.03)),
                      const SizedBox(height: 2),
                      Text(entry.value.$2.toUpperCase(),
                          style: GoogleFonts.plusJakartaSans(
                              fontSize: 9.5, fontWeight: FontWeight.w700,
                              letterSpacing: 0.1,
                              color: AppColors.primary.withOpacity(0.5))),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN CARD (Right panel form)
// ─────────────────────────────────────────────────────────────────────────────
class _LoginCard extends ConsumerStatefulWidget {
  final _LoginForm form;
  final _LoginUI ui;
  const _LoginCard({required this.form, required this.ui});

  @override
  ConsumerState<_LoginCard> createState() => _LoginCardState();
}

class _LoginCardState extends ConsumerState<_LoginCard> {
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _onSubmit() async {
    final uiNotifier = ref.read(_loginUIProvider.notifier);
    final form = ref.read(_loginFormProvider);

    if (form.email.isEmpty || form.password.isEmpty) {
      uiNotifier.setError('Please fill in all fields.');
      return;
    }

    uiNotifier.setLoading(true);
    uiNotifier.setError(null);

    await ref.read(authProvider.notifier).login(
      email: form.email,
      password: form.password,
      onSuccess: (route) => context.go(route),
      onError: (err) {
        if (uiNotifier.mounted) {
          uiNotifier.setLoading(false);
          uiNotifier.setError(err);
        }
      },
    );

    if (mounted && uiNotifier.mounted) uiNotifier.setSuccess();
  }

  @override
  Widget build(BuildContext context) {
    final ui = widget.ui;
    final formNotifier = ref.read(_loginFormProvider.notifier);
    final uiNotifier = ref.read(_loginUIProvider.notifier);

    return GlassCard(
      padding: const EdgeInsets.all(40),
      borderRadius: 28,
      shadowColor: AppColors.primary.withOpacity(0.16),
      shadowBlurRadius: 72,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header
          Row(
            children: [
              Container(
                width: 54, height: 54,
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(17),
                  border: Border.all(color: AppColors.primary.withOpacity(0.24), width: 1.5),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.2),
                      blurRadius: 26,
                    ),
                  ],
                ),
                child: const Center(child: Text('⚡', style: TextStyle(fontSize: 26))),
              ),
              const SizedBox(width: 16),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Sign In',
                      style: GoogleFonts.plusJakartaSans(
                          fontSize: 24, fontWeight: FontWeight.w800,
                          letterSpacing: -0.035, color: AppColors.inkDark)),
                  Text('Access your admin dashboard',
                      style: GoogleFonts.plusJakartaSans(
                          fontSize: 13, color: AppColors.primary.withOpacity(0.55),
                          fontWeight: FontWeight.w500)),
                ],
              ),
            ],
          ),

          const SizedBox(height: 22),

          // Error banner
          if (ui.error != null)
            _ErrorBanner(ui.error!)
                .animate()
                .shakeX(duration: 420.ms, hz: 5, amount: 5),

          if (ui.success)
            _SuccessBanner('✅ Login successful! Redirecting…')
                .animate()
                .fadeIn()
                .scale(begin: const Offset(0.92, 0.92)),

          if (ui.error != null || ui.success) const SizedBox(height: 16),

          // Email field
          AppTextField(
            controller: _emailCtrl,
            label: 'Email Address',
            prefixIcon: '✉️',
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.next,
            onChanged: formNotifier.setEmail,
          ),

          const SizedBox(height: 16),

          // Password field
          AppTextField(
            controller: _passCtrl,
            label: 'Password',
            prefixIcon: '🔑',
            obscureText: !ui.showPass,
            textInputAction: TextInputAction.done,
            onSubmitted: (_) => _onSubmit(),
            onChanged: formNotifier.setPassword,
            suffixIcon: GestureDetector(
              onTap: uiNotifier.togglePass,
              child: Text(
                ui.showPass ? '🙈' : '👁️',
                style: const TextStyle(fontSize: 18),
              ),
            ),
          ),

          const SizedBox(height: 8),

          // Forgot password
          Align(
            alignment: Alignment.centerRight,
            child: Text(
              'Forgot password?',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppColors.primary.withOpacity(0.55),
              ),
            ),
          ),

          const SizedBox(height: 16),

          // Submit button
          GradientButton(
            label: ui.loading
                ? 'Signing in…'
                : ui.success
                    ? '✅ Redirecting…'
                    : 'Sign In →',
            loading: ui.loading,
            disabled: ui.loading || ui.success,
            onPressed: _onSubmit,
          ),

          const SizedBox(height: 16),

          // Register link
          GestureDetector(
            onTap: () => context.go('/register'),
            child: Container(
              padding: const EdgeInsets.all(13),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.05),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.primary.withOpacity(0.2), width: 1.5),
              ),
              child: RichText(
                textAlign: TextAlign.center,
                text: TextSpan(
                  style: GoogleFonts.plusJakartaSans(
                      fontSize: 14, fontWeight: FontWeight.w700, color: const Color(0xFF4338CA)),
                  children: [
                    TextSpan(
                      text: 'New here?  ',
                      style: GoogleFonts.plusJakartaSans(
                          color: AppColors.primary.withOpacity(0.5), fontWeight: FontWeight.w500),
                    ),
                    const TextSpan(text: 'Create your account →'),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 750.ms).slideX(begin: 0.3);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED alert banners
// ─────────────────────────────────────────────────────────────────────────────
class _ErrorBanner extends StatelessWidget {
  final String message;
  const _ErrorBanner(this.message);

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.error.withOpacity(0.08),
          borderRadius: BorderRadius.circular(13),
          border: Border.all(color: AppColors.error.withOpacity(0.24), width: 1.5),
        ),
        child: Row(
          children: [
            const Text('⚠️', style: TextStyle(fontSize: 16)),
            const SizedBox(width: 9),
            Expanded(
              child: Text(message,
                  style: GoogleFonts.plusJakartaSans(
                      fontSize: 13, fontWeight: FontWeight.w600, color: const Color(0xFFDC2626))),
            ),
          ],
        ),
      );
}

class _SuccessBanner extends StatelessWidget {
  final String message;
  const _SuccessBanner(this.message);

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.success.withOpacity(0.09),
          borderRadius: BorderRadius.circular(13),
          border: Border.all(color: AppColors.success.withOpacity(0.28), width: 1.5),
        ),
        child: Row(
          children: [
            const SizedBox(width: 10),
            Expanded(
              child: Text(message,
                  style: GoogleFonts.plusJakartaSans(
                      fontSize: 13.5, fontWeight: FontWeight.w700, color: const Color(0xFF059669))),
            ),
          ],
        ),
      );
}
