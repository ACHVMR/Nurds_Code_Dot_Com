import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glassmorphism/glassmorphism.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';

// --- State Management ---
// Single source of truth for all tools
final settingsProvider = StateProvider<Map<String, bool>>((ref) => {
  "11labs": false,
  "12labs": false,
  "sam2": false,
  "midjourney": false,
  "runway": false,
});

class CircuitBoxPanel extends ConsumerWidget {
  const CircuitBoxPanel({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      width: 300,
      decoration: BoxDecoration(
        color: LoveArtTheme.surface.withOpacity(0.8),
        border: const Border(left: BorderSide(color: LoveArtTheme.glassBorder)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Text(
              "CIRCUIT BOX",
              style: LoveArtTheme.theme.textTheme.displayLarge?.copyWith(fontSize: 24),
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                _buildToggle(ref, "11labs", "ElevenLabs Voice"),
                _buildToggle(ref, "12labs", "12Labs Video Search"),
                _buildToggle(ref, "sam2", "Segment Anything 2"),
                _buildToggle(ref, "midjourney", "Midjourney Gen"),
                _buildToggle(ref, "runway", "RunwayML Video"),
              ],
            ),
          ),
        ],
      ),
    ).animate().slideX(begin: 1, end: 0, duration: 800.ms, curve: Curves.easeOutExpo);
  }

  Widget _buildToggle(WidgetRef ref, String id, String label) {
    final settings = ref.watch(settingsProvider);
    final isActive = settings[id] ?? false;

    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: GlassmorphicContainer(
        width: double.infinity,
        height: 70,
        borderRadius: 12,
        blur: 20,
        alignment: Alignment.center,
        border: 2,
        linearGradient: LinearGradient(
          colors: [Colors.white.withOpacity(0.1), Colors.white.withOpacity(0.05)],
        ),
        borderGradient: LinearGradient(
          colors: isActive 
            ? [LoveArtTheme.neonTeal, LoveArtTheme.neonTeal.withOpacity(0.5)]
            : [Colors.white24, Colors.white12],
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: LoveArtTheme.theme.textTheme.bodyLarge),
              Switch(
                value: isActive,
                activeColor: LoveArtTheme.neonTeal,
                activeTrackColor: LoveArtTheme.neonTeal.withOpacity(0.3),
                inactiveThumbColor: Colors.grey,
                onChanged: (val) {
                  // Update local state
                  final newSettings = Map<String, bool>.from(settings);
                  newSettings[id] = val;
                  ref.read(settingsProvider.notifier).state = newSettings;
                  
                  // Sync with backend
                  ApiService().updateSettings(newSettings);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
