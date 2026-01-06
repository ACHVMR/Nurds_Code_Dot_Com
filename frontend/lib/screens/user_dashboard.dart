import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:glassmorphism/glassmorphism.dart';
import '../theme/app_theme.dart';
import '../widgets/glitch_text.dart';

class UserDashboard extends StatelessWidget {
  const UserDashboard({super.key});

  void _showJackInForm(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => _JackInDialog(),
    );
  }

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
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildHeader(academyAccent),
                    _buildJackInButton(context, academyAccent),
                  ],
                ),
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

  Widget _buildJackInButton(BuildContext context, Color accent) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => _showJackInForm(context),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          decoration: BoxDecoration(
            border: Border.all(color: accent),
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(color: accent.withOpacity(0.2), blurRadius: 10, spreadRadius: 1),
            ],
          ),
          child: Row(
            children: [
              Icon(Icons.bolt, color: accent),
              const SizedBox(width: 10),
              Text(
                "JACK IN",
                style: TextStyle(color: accent, fontWeight: FontWeight.bold, letterSpacing: 2),
              ),
            ],
          ),
        ),
      ),
    ).animate(onPlay: (c) => c.repeat(reverse: true)).shimmer(duration: 3.seconds);
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

class _JackInDialog extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: GlassmorphicContainer(
        width: 500,
        height: 550,
        borderRadius: 20,
        blur: 20,
        alignment: Alignment.center,
        border: 2,
        linearGradient: LinearGradient(colors: [Colors.white10, Colors.white.withOpacity(0.05)]),
        borderGradient: LinearGradient(colors: [Colors.purpleAccent.withOpacity(0.3), Colors.transparent]),
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const GlitchText(
                "INITIATING DATA_LINK",
                style: TextStyle(color: Colors.purpleAccent, fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 30),
              _buildField("CALLSIGN", "Enter Identity"),
              const SizedBox(height: 20),
              _buildField("ORGANIZATION", "Entity Reference"),
              const SizedBox(height: 20),
              _buildField("MISSION", "State Objective", maxLines: 3),
              const SizedBox(height: 40),
              ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.purpleAccent,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 50, vertical: 20),
                ),
                child: const Text("ESTABLISH CONNECTION"),
              ),
            ],
          ),
        ),
      ),
    ).animate().scale(duration: 400.ms, curve: Curves.easeOutBack);
  }

  Widget _buildField(String label, String hint, {int maxLines = 1}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white38, fontSize: 12, letterSpacing: 2)),
        const SizedBox(height: 8),
        TextField(
          maxLines: maxLines,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: Colors.white10),
            filled: true,
            fillColor: Colors.white.withOpacity(0.05),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
          ),
        ),
      ],
    );
  }
}
