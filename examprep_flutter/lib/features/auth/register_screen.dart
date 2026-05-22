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
import 'login_screen.dart';

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER SCREEN — Full parity with Registraion.jsx
// Features:
//  • 4-field form: name, email, phone, password
//  • Password strength meter (scorePassword logic replicated)
//  • Form completion progress bar (completedFields / 4 * 100)
//  • Field validation ✅ checkmark when filled (not focused)
//  • Show/hide password toggle
//  • Error + success banners
//  • Left hero panel with step list
//  • Redirects to /login after 1200ms on success
// ─────────────────────────────────────────────────────────────────────────────

// ── Password strength scorer (mirrors scorePassword in React)
int _scorePassword(String pw) {
  if (pw.isEmpty) return 0;
  int s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (RegExp(r'[A-Z]').hasMatch(pw)) s++;
  if (RegExp(r'[0-9]').hasMatch(pw)) s++;
  if (RegExp(r'[^A-Za-z0-9]').hasMatch(pw)) s++;
  return s;
}

const _strengthData = [
  ('', Colors.transparent, 0.0),
  ('Weak', Color(0xFFEF4444), 0.25),
  ('Fair', Color(0xFFF59E0B), 0.50),
  ('Good', Color(0xFF06B6D4), 0.75),
  ('Strong', Color(0xFF10B981), 0.87),
  ('Excellent', Color(0xFF10B981), 1.0),
];

class _RegForm {
  final String name, email, phone, password;
  const _RegForm({this.name = '', this.email = '', this.phone = '', this.password = ''});
  _RegForm copyWith({String? name, String? email, String? phone, String? password}) =>
      _RegForm(
        name: name ?? this.name,
        email: email ?? this.email,
        phone: phone ?? this.phone,
        password: password ?? this.password,
      );

  int get completedCount =>
      [name, email, phone, password].where((f) => f.isNotEmpty).length;
  double get progressPct => completedCount / 4.0;
}

class _RegFormNotifier extends StateNotifier<_RegForm> {
  _RegFormNotifier() : super(const _RegForm());
  void setName(String v) => state = state.copyWith(name: v);
  void setEmail(String v) => state = state.copyWith(email: v);
  void setPhone(String v) => state = state.copyWith(phone: v);
  void setPassword(String v) => state = state.copyWith(password: v);
}

final _regFormProvider =
    StateNotifierProvider.autoDispose<_RegFormNotifier, _RegForm>((ref) => _RegFormNotifier());

class _RegUI {
  final bool showPass, loading, success;
  final String? error;
  const _RegUI({this.showPass = false, this.loading = false, this.error, this.success = false});
  _RegUI copyWith({bool? showPass, bool? loading, bool? success, String? error}) =>
      _RegUI(
        showPass: showPass ?? this.showPass,
        loading: loading ?? this.loading,
        success: success ?? this.success,
        error: error,
      );
}

class _RegUINotifier extends StateNotifier<_RegUI> {
  _RegUINotifier() : super(const _RegUI());
  void togglePass() => state = state.copyWith(showPass: !state.showPass);
  void setLoading(bool v) => state = state.copyWith(loading: v);
  void setError(String? v) => state = state.copyWith(error: v, loading: false);
  void setSuccess() => state = state.copyWith(success: true, loading: false);
}

final _regUIProvider =
    StateNotifierProvider.autoDispose<_RegUINotifier, _RegUI>((ref) => _RegUINotifier());

// ─────────────────────────────────────────────────────────────────────────────
class RegisterScreen extends ConsumerWidget {
  const RegisterScreen({super.key});

  static const _steps = [
    ('01', 'Create Account', 'Fill in your details below'),
    ('02', 'Instant Access', 'Dashboard unlocks immediately'),
    ('03', 'Start Practising', 'Tests, analytics, every exam covered'),
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final size = MediaQuery.of(context).size;
    final isWide = size.width > 940;

    return Scaffold(
      body: Stack(
        children: [
          const AnimatedBackground(purpleVariant: true),
          SafeArea(
            child: Row(
              children: [
                if (isWide)
                  Expanded(child: _RegLeftHero(steps: _steps)),
                SizedBox(
                  width: isWide ? 540 : size.width,
                  child: Center(
                    child: SingleChildScrollView(
                      padding: EdgeInsets.symmetric(
                          horizontal: isWide ? 44 : 20, vertical: 32),
                      child: const _RegisterCard(),
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

class _RegLeftHero extends StatelessWidget {
  final List<(String, String, String)> steps;
  const _RegLeftHero({required this.steps});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 56, vertical: 64),
      decoration: BoxDecoration(
        border: Border(
          right: BorderSide(color: const Color(0xFF7C3AED).withOpacity(0.1), width: 1.5),
        ),
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 460),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Brand
              _RegBrandPill().animate().fadeIn().slideY(begin: -0.3),
              const SizedBox(height: 42),
              RichText(
                text: TextSpan(
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 64,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.045,
                    height: 1.03,
                    color: const Color(0xFF1E1B4B),
                  ),
                  children: [
                    TextSpan(text: 'Join\n'),
                    TextSpan(
                      text: 'The Team.',
                      style: TextStyle(
                        foreground: Paint()
                          ..shader = LinearGradient(colors: [
                            Color(0xFF7C3AED),
                            Color(0xFFEC4899),
                            Color(0xFFA855F7),
                          ]).createShader(Rect.fromLTWH(0, 0, 300, 80)),
                      ),
                    ),
                  ],
                ),
              ).animate(delay: 200.ms).fadeIn().slideY(begin: 0.3),
              const SizedBox(height: 20),
              Text(
                'Create your account and unlock the full power of AI-driven exam preparation.',
                style: GoogleFonts.plusJakartaSans(
                    fontSize: 16, height: 1.75,
                    color: const Color(0xFF6D28D9).withOpacity(0.6)),
              ).animate(delay: 280.ms).fadeIn().slideY(begin: 0.3),
              const SizedBox(height: 36),
              // Steps
              ...steps.asMap().entries.map((e) => Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: _StepCard(n: e.value.$1, title: e.value.$2, desc: e.value.$3)
                        .animate(delay: Duration(milliseconds: 340 + e.key * 60))
                        .fadeIn()
                        .slideX(begin: -0.2),
                  )),
            ],
          ),
        ),
      ),
    );
  }
}

class _RegBrandPill extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 9),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.82),
        borderRadius: BorderRadius.circular(40),
        border: Border.all(color: const Color(0xFF7C3AED).withOpacity(0.2), width: 1.5),
        boxShadow: [
          BoxShadow(color: const Color(0xFF7C3AED).withOpacity(0.13), blurRadius: 28, offset: const Offset(0, 6)),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 34, height: 34,
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFFEC4899)],
                  begin: Alignment.topLeft, end: Alignment.bottomRight),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Center(child: Text('🎓', style: TextStyle(fontSize: 18))),
          ),
          const SizedBox(width: 11),
          ShaderMask(
            shaderCallback: (b) => const LinearGradient(
                colors: [Color(0xFF7C3AED), Color(0xFFEC4899)]).createShader(b),
            child: Text('ExamPrep',
                style: GoogleFonts.plusJakartaSans(
                    fontSize: 15.5, fontWeight: FontWeight.w800, color: Colors.white,
                    letterSpacing: -0.02)),
          ),
        ],
      ),
    );
  }
}

class _StepCard extends StatelessWidget {
  final String n, title, desc;
  const _StepCard({required this.n, required this.title, required this.desc});

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.72),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFF7C3AED).withOpacity(0.12), width: 1.5),
        ),
        child: Row(
          children: [
            Container(
              width: 36, height: 36,
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: [
                  const Color(0xFF7C3AED).withOpacity(0.12),
                  const Color(0xFFA855F7).withOpacity(0.1),
                ]),
                borderRadius: BorderRadius.circular(11),
                border: Border.all(color: const Color(0xFF7C3AED).withOpacity(0.22)),
              ),
              child: Center(
                child: Text(n,
                    style: GoogleFonts.plusJakartaSans(
                        fontSize: 11, fontWeight: FontWeight.w900,
                        color: const Color(0xFF7C3AED), letterSpacing: 0.04)),
              ),
            ),
            const SizedBox(width: 14),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: GoogleFonts.plusJakartaSans(
                        fontSize: 14, fontWeight: FontWeight.w800, color: const Color(0xFF1E1B4B))),
                Text(desc,
                    style: GoogleFonts.plusJakartaSans(
                        fontSize: 12, color: const Color(0xFF6D28D9).withOpacity(0.55),
                        fontWeight: FontWeight.w500, height: 1.5)),
              ],
            ),
          ],
        ),
      );
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER CARD
// ─────────────────────────────────────────────────────────────────────────────
class _RegisterCard extends ConsumerStatefulWidget {
  const _RegisterCard();

  @override
  ConsumerState<_RegisterCard> createState() => _RegisterCardState();
}

class _RegisterCardState extends ConsumerState<_RegisterCard> {
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _passCtrl = TextEditingController();

  @override
  void dispose() {
    _nameCtrl.dispose(); _emailCtrl.dispose();
    _phoneCtrl.dispose(); _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _onSubmit() async {
    final ui = ref.read(_regUIProvider.notifier);
    final form = ref.read(_regFormProvider);
    if (form.name.isEmpty || form.email.isEmpty || form.phone.isEmpty || form.password.isEmpty) {
      ui.setError('Please fill in all fields.');
      return;
    }
    ui.setLoading(true);
    await ref.read(authProvider.notifier).register(
      name: form.name, email: form.email, phone: form.phone, password: form.password,
      onSuccess: () => context.go('/login'),
      onError: (err) => ui.setError(err),
    );
    if (mounted) ui.setSuccess();
  }

  @override
  Widget build(BuildContext context) {
    final form = ref.watch(_regFormProvider);
    final ui = ref.watch(_regUIProvider);
    final formN = ref.read(_regFormProvider.notifier);
    final uiN = ref.read(_regUIProvider.notifier);
    final strength = _scorePassword(form.password);
    final strengthInfo = strength < _strengthData.length ? _strengthData[strength] : _strengthData.last;

    return GlassCard(
      padding: const EdgeInsets.all(38),
      borderRadius: 28,
      shadowColor: const Color(0xFF7C3AED).withOpacity(0.15),
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
                  color: const Color(0xFF7C3AED).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(17),
                  border: Border.all(color: const Color(0xFF7C3AED).withOpacity(0.24), width: 1.5),
                ),
                child: const Center(child: Text('✨', style: TextStyle(fontSize: 26))),
              ),
              const SizedBox(width: 16),
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Create Account',
                    style: GoogleFonts.plusJakartaSans(
                        fontSize: 23, fontWeight: FontWeight.w800,
                        letterSpacing: -0.035, color: const Color(0xFF1E1B4B))),
                Text("Join ExamPrep — it's free",
                    style: GoogleFonts.plusJakartaSans(
                        fontSize: 13, color: const Color(0xFF6D28D9).withOpacity(0.55),
                        fontWeight: FontWeight.w500)),
              ]),
            ],
          ),

          const SizedBox(height: 20),

          // Form completion progress bar
          Column(children: [
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text('Profile completion',
                  style: GoogleFonts.plusJakartaSans(
                      fontSize: 11, fontWeight: FontWeight.w700,
                      letterSpacing: 0.07, color: const Color(0xFF7C3AED).withOpacity(0.5))),
              Text('${(form.progressPct * 100).round()}%',
                  style: GoogleFonts.plusJakartaSans(
                      fontSize: 12, fontWeight: FontWeight.w800, color: const Color(0xFF7C3AED))),
            ]),
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(99),
              child: LinearProgressIndicator(
                value: form.progressPct,
                backgroundColor: const Color(0xFF7C3AED).withOpacity(0.1),
                valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF7C3AED)),
                minHeight: 5,
              ),
            ),
          ]),

          const SizedBox(height: 16),

          // Error / Success
          if (ui.error != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 12),
                decoration: BoxDecoration(
                  color: AppColors.error.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(13),
                  border: Border.all(color: AppColors.error.withOpacity(0.24), width: 1.5),
                ),
                child: Row(children: [
                  const Text('⚠️', style: TextStyle(fontSize: 16)),
                  const SizedBox(width: 9),
                  Expanded(child: Text(ui.error!,
                      style: GoogleFonts.plusJakartaSans(
                          fontSize: 13, fontWeight: FontWeight.w600, color: const Color(0xFFDC2626)))),
                ]),
              ).animate().shakeX(duration: 420.ms),
            ),
          if (ui.success)
            Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: AppColors.success.withOpacity(0.09),
                  borderRadius: BorderRadius.circular(13),
                  border: Border.all(color: AppColors.success.withOpacity(0.28), width: 1.5),
                ),
                child: Text('🎉 Account created! Redirecting to login…',
                    style: GoogleFonts.plusJakartaSans(
                        fontSize: 13.5, fontWeight: FontWeight.w700, color: const Color(0xFF059669))),
              ).animate().fadeIn().scale(begin: const Offset(0.92, 0.92)),
            ),

          // Name field
          AppTextField(
            controller: _nameCtrl, label: 'Full Name',
            prefixIcon: '👤', onChanged: formN.setName,
            suffixIcon: form.name.length > 1
                ? const Text('✅', style: TextStyle(fontSize: 14))
                : null,
          ),
          const SizedBox(height: 14),

          // Email field
          AppTextField(
            controller: _emailCtrl, label: 'Email Address',
            prefixIcon: '✉️', keyboardType: TextInputType.emailAddress,
            onChanged: formN.setEmail,
            suffixIcon: form.email.length > 1
                ? const Text('✅', style: TextStyle(fontSize: 14))
                : null,
          ),
          const SizedBox(height: 14),

          // Phone field
          AppTextField(
            controller: _phoneCtrl, label: 'Phone Number',
            prefixIcon: '📱', keyboardType: TextInputType.phone,
            onChanged: formN.setPhone,
            suffixIcon: form.phone.length > 1
                ? const Text('✅', style: TextStyle(fontSize: 14))
                : null,
          ),
          const SizedBox(height: 14),

          // Password field
          AppTextField(
            controller: _passCtrl, label: 'Password',
            prefixIcon: '🔑', obscureText: !ui.showPass,
            onChanged: formN.setPassword,
            suffixIcon: GestureDetector(
              onTap: uiN.togglePass,
              child: Text(ui.showPass ? '🙈' : '👁️', style: const TextStyle(fontSize: 18)),
            ),
          ),

          // Password strength
          if (form.password.isNotEmpty) ...[
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(99),
              child: LinearProgressIndicator(
                value: strengthInfo.$3,
                backgroundColor: const Color(0xFF7C3AED).withOpacity(0.1),
                valueColor: AlwaysStoppedAnimation<Color>(strengthInfo.$2),
                minHeight: 4,
              ),
            ),
            const SizedBox(height: 5),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(strengthInfo.$1,
                    style: GoogleFonts.plusJakartaSans(
                        fontSize: 11, fontWeight: FontWeight.w700, color: strengthInfo.$2)),
                Row(children: [
                  _PwReq('8+ chars', form.password.length >= 8),
                  const SizedBox(width: 8),
                  _PwReq('A–Z', RegExp(r'[A-Z]').hasMatch(form.password)),
                  const SizedBox(width: 8),
                  _PwReq('0–9', RegExp(r'[0-9]').hasMatch(form.password)),
                ]),
              ],
            ),
          ],

          const SizedBox(height: 16),

          // Terms
          Text(
            'By creating an account you agree to our Terms of Service and Privacy Policy.',
            textAlign: TextAlign.center,
            style: GoogleFonts.plusJakartaSans(
                fontSize: 11, color: const Color(0xFF6D28D9).withOpacity(0.45), height: 1.6),
          ),

          const SizedBox(height: 16),

          GradientButton(
            label: ui.loading ? 'Creating account…'
                : ui.success ? '🎉 Account Created!'
                : 'Create Account →',
            loading: ui.loading,
            disabled: ui.loading || ui.success,
            gradient: const LinearGradient(
              colors: [Color(0xFF7C3AED), Color(0xFFA855F7), Color(0xFFEC4899)],
            ),
            shadow: const Color(0xFF7C3AED),
            onPressed: _onSubmit,
          ),

          const SizedBox(height: 14),

          Row(children: [
            Expanded(child: Divider(color: const Color(0xFF7C3AED).withOpacity(0.12))),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Text('already a member?',
                  style: GoogleFonts.plusJakartaSans(
                      fontSize: 11.5, fontWeight: FontWeight.w600,
                      color: const Color(0xFF6D28D9).withOpacity(0.45))),
            ),
            Expanded(child: Divider(color: const Color(0xFF7C3AED).withOpacity(0.12))),
          ]),

          const SizedBox(height: 14),

          GestureDetector(
            onTap: () => context.go('/login'),
            child: Container(
              padding: const EdgeInsets.all(13),
              decoration: BoxDecoration(
                color: const Color(0xFF7C3AED).withOpacity(0.05),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF7C3AED).withOpacity(0.2), width: 1.5),
              ),
              child: RichText(
                textAlign: TextAlign.center,
                text: TextSpan(
                  style: GoogleFonts.plusJakartaSans(
                      fontSize: 14, fontWeight: FontWeight.w700, color: const Color(0xFF7C3AED)),
                  children: [
                    TextSpan(
                      text: 'Have an account?  ',
                      style: GoogleFonts.plusJakartaSans(
                          color: const Color(0xFF6D28D9).withOpacity(0.5), fontWeight: FontWeight.w500),
                    ),
                    const TextSpan(text: 'Sign In Instead →'),
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

class _PwReq extends StatelessWidget {
  final String label;
  final bool met;
  const _PwReq(this.label, this.met);

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(
          color: met
              ? const Color(0xFF10B981).withOpacity(0.1)
              : const Color(0xFF7C3AED).withOpacity(0.07),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          '${met ? '✓' : '·'} $label',
          style: GoogleFonts.plusJakartaSans(
            fontSize: 10,
            fontWeight: FontWeight.w600,
            color: met ? const Color(0xFF059669) : const Color(0xFF6D28D9).withOpacity(0.45),
          ),
        ),
      );
}
