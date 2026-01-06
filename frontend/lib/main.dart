import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glassmorphism/glassmorphism.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'theme/app_theme.dart';
import 'widgets/circuit_box_panel.dart';

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
      home: const SplitLandingScreen(),
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
          // LEFT SIDE: LEARNING HUB (USER) | Pink/Purple Vibe
          Expanded(
            child: _buildPanel(
              context,
              title: "V.I.B.E. ACADEMY",
              subtitle: "Start Learning",
              imagePath: "assets/images/user_bg.png",
              accentColor: Colors.purpleAccent,
              onTap: () {
                // Navigate to Learning Hub
              },
            ),
          ),
          
          // RIGHT SIDE: DEVELOPMENT PLATFORM (OWNER) | Teal/Blue Vibe
          Expanded(
            child: _buildPanel(
              context,
              title: "NURDS CODE",
              subtitle: "Start Building",
              imagePath: "assets/images/owner_bg.png", // Fallback if missing
              accentColor: LoveArtTheme.neonTeal,
              onTap: () {
                Navigator.of(context).push(MaterialPageRoute(
                  builder: (ctx) => const OwnerDashboard(),
                ));
              },
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
          errorBuilder: (c, o, s) => Container(color: Colors.black), // Fallback
        ).animate(onPlay: (c) => c.repeat(reverse: true))
         .scale(begin: const Offset(1,1), end: const Offset(1.05, 1.05), duration: 10.seconds),

        // Gradient Overlay
        Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Colors.black.withOpacity(0.3),
                Colors.black.withOpacity(0.8),
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
                    shadows: [Shadow(color: accentColor, blurRadius: 20)],
                  ),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: onTap,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: accentColor,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 20),
                    textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  child: Text(subtitle.toUpperCase()),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class OwnerDashboard extends StatelessWidget {
  const OwnerDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
           Positioned.fill(
            child: Image.asset(
              "assets/images/owner_bg.png",
              fit: BoxFit.cover,
               errorBuilder: (c, o, s) => Container(color: const Color(0xFF0A0E17)),
            ),
          ),
          const Row(
            children: [
              Expanded(
                child: Center(
                  child: Text("PLATFORM ONLINE", style: TextStyle(color: Colors.white, fontSize: 40)),
                ),
              ),
              CircuitBoxPanel(),
            ],
          ),
        ],
      ),
    );
  }
}
