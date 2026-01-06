import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color obsidian = Color(0xFF0A0A0A);
  static const Color terminalGreen = Color(0xFF00FF41);
  static const Color pureWhite = Color(0xFFFFFFFF);
  static const Color darkGrey = Color(0xFF1E1E1E);

  static ThemeData get darkTheme {
    return ThemeData.dark().copyWith(
      scaffoldBackgroundColor: obsidian,
      primaryColor: terminalGreen,
      colorScheme: const ColorScheme.dark(
        primary: terminalGreen,
        secondary: terminalGreen, // For accents
        surface: darkGrey,
        onSurface: pureWhite,
        onPrimary: obsidian,
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.jetbrainsMono(
          color: pureWhite,
          fontWeight: FontWeight.bold,
          fontSize: 48,
        ),
        displayMedium: GoogleFonts.jetbrainsMono(
          color: pureWhite,
          fontWeight: FontWeight.bold,
          fontSize: 32,
        ),
        bodyLarge: GoogleFonts.inter(
          color: pureWhite.withOpacity(0.9),
          fontSize: 18,
          height: 1.5,
        ),
        bodyMedium: GoogleFonts.inter(
          color: pureWhite.withOpacity(0.8),
          fontSize: 16,
        ),
        labelLarge: GoogleFonts.jetbrainsMono(
          color: terminalGreen,
          fontWeight: FontWeight.w600,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: terminalGreen,
          foregroundColor: obsidian,
          textStyle: GoogleFonts.jetbrainsMono(fontWeight: FontWeight.bold),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.zero, // Brutalist/Terminal style
          ),
        ),
      ),
    );
  }
}
