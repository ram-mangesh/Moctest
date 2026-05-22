import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  // Primary palette
  static const Color primary = Color(0xFF6366F1);       // indigo-500
  static const Color primaryDark = Color(0xFF4F46E5);   // indigo-600
  static const Color secondary = Color(0xFF8B5CF6);     // violet-500
  static const Color accent = Color(0xFF06B6D4);        // cyan-500
  static const Color pink = Color(0xFFEC4899);          // pink-500
  static const Color purple = Color(0xFF7C3AED);        // violet-600

  // Semantic
  static const Color success = Color(0xFF10B981);       // emerald-500
  static const Color warning = Color(0xFFF59E0B);       // amber-500
  static const Color error = Color(0xFFEF4444);         // red-500
  static const Color info = Color(0xFF3B82F6);          // blue-500

  // Neutral
  static const Color inkDark = Color(0xFF1E1B4B);       // deep navy
  static const Color inkPrimary = Color(0xFF1A1740);
  static const Color inkMuted = Color(0xFF6B7280);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color background = Color(0xFFF8F9FF);
  static const Color border = Color(0xFFE5E7EB);

  // Glassmorphism
  static Color glassWhite = Colors.white.withOpacity(0.86);
  static Color glassBorder = const Color(0xFF6366F1).withOpacity(0.14);

  // Background gradients
  static const LinearGradient bgGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFEEF0FF), Color(0xFFE8ECFF), Color(0xFFF0EAFF), Color(0xFFFCE8F3)],
    stops: [0.0, 0.28, 0.55, 1.0],
  );

  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF6366F1), Color(0xFF8B5CF6), Color(0xFF06B6D4)],
  );

  static const LinearGradient purplePinkGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF7C3AED), Color(0xFFEC4899)],
  );

  // Dark mode
  static const Color darkBg = Color(0xFF0F0E1A);
  static const Color darkSurface = Color(0xFF1A1830);
  static const Color darkBorder = Color(0xFF2D2B4E);
  static Color darkGlass = const Color(0xFF1A1830).withOpacity(0.9);
}

class AppTheme {
  static ThemeData get lightTheme => ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        colorScheme: const ColorScheme.light(
          primary: AppColors.primary,
          secondary: AppColors.secondary,
          surface: AppColors.surface,
          error: AppColors.error,
          onPrimary: Colors.white,
          onSurface: AppColors.inkDark,
        ),
        scaffoldBackgroundColor: AppColors.background,
        textTheme: _buildTextTheme(AppColors.inkDark),
        appBarTheme: AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
          centerTitle: false,
          titleTextStyle: GoogleFonts.plusJakartaSans(
            fontSize: 20,
            fontWeight: FontWeight.w800,
            color: AppColors.inkDark,
          ),
          iconTheme: const IconThemeData(color: AppColors.inkDark),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            elevation: 0,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
            textStyle: GoogleFonts.plusJakartaSans(
              fontSize: 15,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white.withOpacity(0.78),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(13),
            borderSide: BorderSide(
              color: AppColors.primary.withOpacity(0.18),
            ),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(13),
            borderSide: BorderSide(
              color: AppColors.primary.withOpacity(0.18),
            ),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(13),
            borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(13),
            borderSide: const BorderSide(color: AppColors.error),
          ),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
        ),
        cardTheme: CardThemeData(
          elevation: 0,
          color: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
            side: BorderSide(
              color: AppColors.primary.withOpacity(0.1),
            ),
          ),
        ),
        chipTheme: ChipThemeData(
          backgroundColor: AppColors.primary.withOpacity(0.09),
          labelStyle: GoogleFonts.plusJakartaSans(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: AppColors.primary,
          ),
          side: BorderSide(color: AppColors.primary.withOpacity(0.17)),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
        ),
      );

  static ThemeData get darkTheme => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorScheme: ColorScheme.dark(
          primary: AppColors.primary,
          secondary: AppColors.secondary,
          surface: AppColors.darkSurface,
          error: AppColors.error,
          onPrimary: Colors.white,
          onSurface: Colors.white.withOpacity(0.9),
        ),
        scaffoldBackgroundColor: AppColors.darkBg,
        textTheme: _buildTextTheme(Colors.white),
        appBarTheme: AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
          titleTextStyle: GoogleFonts.plusJakartaSans(
            fontSize: 20,
            fontWeight: FontWeight.w800,
            color: Colors.white,
          ),
          iconTheme: const IconThemeData(color: Colors.white),
        ),
      );

  static TextTheme _buildTextTheme(Color baseColor) => TextTheme(
        displayLarge: GoogleFonts.plusJakartaSans(
          fontSize: 57,
          fontWeight: FontWeight.w900,
          color: baseColor,
          letterSpacing: -0.045,
        ),
        displayMedium: GoogleFonts.plusJakartaSans(
          fontSize: 45,
          fontWeight: FontWeight.w800,
          color: baseColor,
          letterSpacing: -0.04,
        ),
        headlineLarge: GoogleFonts.plusJakartaSans(
          fontSize: 32,
          fontWeight: FontWeight.w800,
          color: baseColor,
          letterSpacing: -0.03,
        ),
        headlineMedium: GoogleFonts.plusJakartaSans(
          fontSize: 26,
          fontWeight: FontWeight.w800,
          color: baseColor,
          letterSpacing: -0.025,
        ),
        headlineSmall: GoogleFonts.plusJakartaSans(
          fontSize: 22,
          fontWeight: FontWeight.w700,
          color: baseColor,
        ),
        titleLarge: GoogleFonts.plusJakartaSans(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: baseColor,
        ),
        titleMedium: GoogleFonts.plusJakartaSans(
          fontSize: 15,
          fontWeight: FontWeight.w600,
          color: baseColor,
        ),
        bodyLarge: GoogleFonts.plusJakartaSans(
          fontSize: 16,
          fontWeight: FontWeight.w400,
          color: baseColor,
        ),
        bodyMedium: GoogleFonts.plusJakartaSans(
          fontSize: 14,
          fontWeight: FontWeight.w400,
          color: baseColor,
        ),
        bodySmall: GoogleFonts.plusJakartaSans(
          fontSize: 12,
          fontWeight: FontWeight.w400,
          color: baseColor.withOpacity(0.65),
        ),
        labelLarge: GoogleFonts.plusJakartaSans(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          color: baseColor,
          letterSpacing: 0.02,
        ),
        labelSmall: GoogleFonts.plusJakartaSans(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.08,
          color: baseColor.withOpacity(0.55),
        ),
      );
}
