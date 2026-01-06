import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:glassmorphism/glassmorphism.dart';
import '../theme/app_theme.dart';
import '../widgets/glitch_text.dart';

class UserDashboard extends StatelessWidget {
  const UserDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    const Color academyAccent = Colors.purpleAccent;

    return Scaffold(
      body: Stack(
        children: [
          // LAYER 0: Background
          Positioned.fill(
            child: Image.asset(
              "assets/images/user_bg.png",
              fit: BoxFit.cover,
              errorBuilder: (c, o, s) => Container(color: LoveArtTheme.background),
            ),
          ),

          // LAYER 1: UI
          Padding(
            padding: const EdgeInsets.all(40.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(academyAccent),
                const SizedBox(height: 60),
                Expanded(
                  child: GridView.count(
                    crossAxisCount: 3,
                    crossAxisSpacing: 30,
                    mainAxisSpacing: 30,
                    children: [
                      _buildCurriculumCard("AI_FUNDAMENTALS", Icons.psychology, academyAccent),
                      _buildCurriculumCard("PROMPT_ENGINEERING", Icons.Terminal, academyAccent),
                      _buildCurriculumCard("NEURAL_NETWORKS", Icons.hub, academyAccent),
                      _buildCurriculumCard("AGENT_OS", Icons.settings_suggest, academyAccent),
                      _buildCurriculumCard("SWARM_LOGIC", Icons.group_work, academyAccent),
                      _buildCurriculumCard("DEPLOYMENT", Icons.rocket_launch, academyAccent),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Back Button
          Positioned(
            top: 20,
            left: 20,
            child: IconButton(
              icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white54),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(Color accent) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        GlitchText(
          "V.I.B.E. ACADEMY",
          style: TextStyle(
            fontSize: 48,
            fontWeight: FontWeight.bold,
            color: accent,
            letterSpacing: 4,
          ),
        ),
        Text(
          "UPLINK_SUCCESS // CURRICULUM: LOADED",
          style: TextStyle(
            color: accent.withOpacity(0.6),
            letterSpacing: 2,
            fontSize: 16,
          ),
        ),
      ],
    ).animate().fadeIn(duration: 1.seconds).slideY(begin: -0.1, end: 0);
  }

  Widget _buildCurriculumCard(String title, IconData icon, Color accent) {
    return GlassmorphicContainer(
      width: double.infinity,
      height: double.infinity,
      borderRadius: 16,
      blur: 15,
      alignment: Alignment.center,
      border: 1,
      linearGradient: LinearGradient(
        colors: [Colors.white.withOpacity(0.05), Colors.white.withOpacity(0.02)],
      ),
      borderGradient: LinearGradient(
        colors: [accent.withOpacity(0.3), Colors.transparent],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {},
          hoverColor: accent.withOpacity(0.1),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 64, color: accent),
              const SizedBox(height: 20),
              Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                ),
              ),
            ],
          ),
        ),
      ),
    ).animate().scale(duration: 600.ms, curve: Curves.easeOutBack);
  }
}
