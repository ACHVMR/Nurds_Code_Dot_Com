import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class LoveArtTheme {
  // NURDS CODE DARK THEME - Official Brand Colors
  static const Color background = Color(0xFF0A0A0A); // Obsidian Black
  static const Color surface = Color(0xFF111111);    // Surface
  static const Color neonCyan = Color(0xFF00E5FF);   // Neon Cyan (Primary)
  static const Color neonOrange = Color(0xFFFF5E00); // Neon Orange (Secondary)
  static const Color neonGreen = Color(0xFF00FF41);  // Terminal Green (Success)
  static const Color glassBorder = Colors.white10;

  // Legacy compatibility
  static const Color neonTeal = neonCyan;

  static ThemeData get theme {
    return ThemeData.dark().copyWith(
      scaffoldBackgroundColor: background,
      primaryColor: neonCyan,
      colorScheme: const ColorScheme.dark(
        primary: neonCyan,
        secondary: neonOrange,
        tertiary: neonGreen,
        surface: surface,
        onSurface: Colors.white,
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.orbitron(
          color: Colors.white,
          fontSize: 32,
          fontWeight: FontWeight.bold,
          letterSpacing: 2.0,
        ),
        bodyLarge: GoogleFonts.rajdhani(
          color: Colors.white70,
          fontSize: 18,
        ),
        bodyMedium: GoogleFonts.rajdhani(
          color: Colors.white60,
          fontSize: 16,
        ),
      ),
    );
  }
}
