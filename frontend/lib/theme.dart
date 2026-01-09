import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // NURDS CODE DARK THEME - Official Brand Colors
  static const Color obsidian = Color(0xFF0A0A0A);
  static const Color neonCyan = Color(0xFF00E5FF);
  static const Color neonOrange = Color(0xFFFF5E00);
  static const Color terminalGreen = Color(0xFF00FF41);
  static const Color pureWhite = Color(0xFFFFFFFF);
  static const Color darkGrey = Color(0xFF111111);

  static ThemeData get darkTheme {
    return ThemeData.dark().copyWith(
      scaffoldBackgroundColor: obsidian,
      primaryColor: neonCyan,
      colorScheme: const ColorScheme.dark(
        primary: neonCyan,
        secondary: neonOrange,
        tertiary: terminalGreen,
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
          color: neonCyan,
          fontWeight: FontWeight.w600,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: neonCyan,
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
