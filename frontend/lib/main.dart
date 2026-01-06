import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glassmorphism/glassmorphism.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'theme/app_theme.dart';
import 'screens/owner_dashboard.dart';
import 'screens/user_dashboard.dart';

void main() {
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Nurds Code - V.I.B.E.',
      theme: LoveArtTheme.theme,
      debugShowCheckedModeBanner: false,
      initialRoute: '/',
      routes: {
        '/': (context) => const SplitLandingScreen(),
        '/learning-hub': (context) => const UserDashboard(),
        '/development-platform': (context) => const OwnerDashboard(),
      },
    );
  }
}

class SplitLandingScreen extends StatelessWidget {
  const SplitLandingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          // LEFT SIDE: LEARNING HUB (USER)
          Expanded(
            child: _buildPanel(
              context,
              title: "V.I.B.E. ACADEMY",
              subtitle: "Start Learning",
              imagePath: "assets/images/user_bg.png",
              accentColor: Colors.purpleAccent,
              onTap: () => Navigator.of(context).pushNamed('/learning-hub'),
            ),
          ),
          
          // RIGHT SIDE: DEVELOPMENT PLATFORM (OWNER)
          Expanded(
            child: _buildPanel(
              context,
              title: "NURDS CODE",
              subtitle: "Start Building",
              imagePath: "assets/images/owner_bg.png",
              accentColor: LoveArtTheme.neonTeal,
              onTap: () => Navigator.of(context).pushNamed('/development-platform'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPanel(BuildContext context, {
    required String title,
    required String subtitle,
    required String imagePath,
    required Color accentColor,
    required VoidCallback onTap,
  }) {
    return Stack(
      fit: StackFit.expand,
      children: [
        // Background Image with Zoom Effect
        Image.asset(
          imagePath,
          fit: BoxFit.cover,
          errorBuilder: (c, o, s) => Container(color: Colors.black),
        ).animate(onPlay: (c) => c.repeat(reverse: true))
         .scale(begin: const Offset(1,1), end: const Offset(1.05, 1.05), duration: 20.seconds),

        // Gradient Overlay
        Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Colors.black.withOpacity(0.3),
                Colors.black.withOpacity(0.9),
              ],
            ),
          ),
        ),

        // Content
        Center(
          child: GlassmorphicContainer(
            width: 400,
            height: 250,
            borderRadius: 20,
            blur: 20,
            alignment: Alignment.center,
            border: 2,
            linearGradient: LinearGradient(colors: [Colors.white10, Colors.white.withOpacity(0.05)]),
            borderGradient: LinearGradient(colors: [accentColor.withOpacity(0.5), Colors.white10]),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  title,
                  style: LoveArtTheme.theme.textTheme.displayLarge?.copyWith(
                    fontWeight: FontWeight.w900,
                    fontSize: 40,
                    shadows: [Shadow(color: accentColor, blurRadius: 20)],
                  ),
                ),
                const SizedBox(height: 30),
                Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: onTap,
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 20),
                      decoration: BoxDecoration(
                        color: accentColor.withOpacity(0.8),
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(color: accentColor.withOpacity(0.3), blurRadius: 15, spreadRadius: 2),
                        ],
                      ),
                      child: Text(
                        subtitle.toUpperCase(),
                        style: const TextStyle(
                          color: Colors.black,
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                          letterSpacing: 2,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
