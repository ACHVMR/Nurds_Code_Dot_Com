import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class LoveArtTheme {
  // Core Colors
  static const Color background = Color(0xFF0A0E17); // Deep Space Black
  static const Color surface = Color(0xFF151922);    // Slightly Lighter Matrix
  static const Color neonTeal = Color(0xFF00E5FF);   // Cyber Blue
  static const Color neonOrange = Color(0xFFFF9100); // Alert Orange
  static const Color glassBorder = Colors.white10;

  static ThemeData get theme {
    return ThemeData.dark().copyWith(
      scaffoldBackgroundColor: background,
      primaryColor: neonTeal,
      colorScheme: const ColorScheme.dark(
        primary: neonTeal,
        secondary: neonOrange,
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
