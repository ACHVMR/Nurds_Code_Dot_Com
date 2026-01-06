import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:glassmorphism/glassmorphism.dart';
import '../theme/app_theme.dart';
import '../widgets/circuit_box_panel.dart';
import '../widgets/glitch_text.dart';

class OwnerDashboard extends StatelessWidget {
  const OwnerDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // LAYER 0: Background
          Positioned.fill(
            child: Image.asset(
              "assets/images/owner_bg.png",
              fit: BoxFit.cover,
              errorBuilder: (c, o, s) => Container(color: LoveArtTheme.background),
            ),
          ),

          // LAYER 1: Interactive UI
          Row(
            children: [
              // MAIN CONSOLE AREA
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(32.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildHeader(),
                      const SizedBox(height: 40),
                      Expanded(
                        child: _buildCentralConsole(),
                      ),
                    ],
                  ),
                ),
              ),

              // THE CIRCUIT BOX
              const CircuitBoxPanel(),
            ],
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

  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const GlitchText(
          "OWNER_UPLINK",
          style: TextStyle(
            fontSize: 48,
            fontWeight: FontWeight.bold,
            color: LoveArtTheme.neonTeal,
            letterSpacing: 4,
          ),
        ),
        Text(
          "DEVELOPMENT_PLATFORM // STATUS: ONLINE",
          style: LoveArtTheme.theme.textTheme.bodyMedium?.copyWith(
            color: LoveArtTheme.neonTeal.withOpacity(0.6),
            letterSpacing: 2,
          ),
        ),
      ],
    ).animate().fadeIn(duration: 1.seconds).slideX(begin: -0.1, end: 0);
  }

  Widget _buildCentralConsole() {
    return GlassmorphicContainer(
      width: double.infinity,
      height: double.infinity,
      borderRadius: 16,
      blur: 15,
      alignment: Alignment.topLeft,
      border: 1,
      linearGradient: LinearGradient(
        colors: [Colors.white.withOpacity(0.05), Colors.white.withOpacity(0.02)],
      ),
      borderGradient: LinearGradient(
        colors: [LoveArtTheme.neonTeal.withOpacity(0.2), Colors.transparent],
      ),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            Row(
              children: [
                _buildConsoleTab("SYSTEM_LOGS", true),
                _buildConsoleTab("CODE_GEN", false),
                _buildConsoleTab("AGENTS", false),
              ],
            ),
            const Divider(color: Colors.white10),
            Expanded(
              child: ListView(
                children: [
                   _buildLogItem("> INITIALIZING NEURAL_SWARM..."),
                   _buildLogItem("> CONNECTING TO CLOUDFLARE_EDGE..."),
                   _buildLogItem("> UPLINK ESTABLISHED."),
                   _buildLogItem("> READY FOR TARGET_BUILD."),
                ],
              ),
            ),
          ],
        ),
      ),
    ).animate().scale(delay: 500.ms, duration: 800.ms, curve: Curves.easeOutBack);
  }

  Widget _buildConsoleTab(String label, bool active) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: active ? LoveArtTheme.neonTeal : Colors.transparent,
            width: 2,
          ),
        ),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: active ? LoveArtTheme.neonTeal : Colors.white38,
          fontWeight: active ? FontWeight.bold : FontWeight.normal,
        ),
      ),
    );
  }

  Widget _buildLogItem(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Text(
        text,
        style: const TextStyle(
          fontFamily: 'JetBrains Mono',
          color: Colors.white54,
          fontSize: 14,
        ),
      ),
    );
  }
}
