import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:glassmorphism/glassmorphism.dart';
import '../theme/app_theme.dart';
import '../widgets/circuit_box_panel.dart';
import '../widgets/glitch_text.dart';
import '../services/agent_stream_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class OwnerDashboard extends ConsumerStatefulWidget {
  const OwnerDashboard({super.key});

  @override
  ConsumerState<OwnerDashboard> createState() => _OwnerDashboardState();
}

class _OwnerDashboardState extends ConsumerState<OwnerDashboard> {
  final ScrollController _logScrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(agentLogsProvider.notifier).startListening();
    });
  }

  void _scrollToBottom() {
    if (_logScrollController.hasClients) {
      _logScrollController.animateTo(
        _logScrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    // Listen for new logs to trigger scroll
    ref.listen<List<AgentMessage>>(agentLogsProvider, (prev, next) {
      Future.delayed(const Duration(milliseconds: 100), _scrollToBottom);
    });

    final activeCode = ref.watch(activeCodeProvider);

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
                flex: 3,
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

              // DYNAMIC PREVIEW PANEL (Code/Architecture)
              if (activeCode != null)
                Expanded(
                  flex: 2,
                  child: _buildCodePreview(activeCode),
                ).animate().slideX(begin: 1.0, end: 0.0, curve: Curves.easeOutExpo),

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
              onPressed: () {
                ref.read(agentLogsProvider.notifier).stopListening();
                Navigator.of(context).pop();
              },
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
          "AGENT_SWARM // ACTIVE_SESSION",
          style: LoveArtTheme.theme.textTheme.bodyMedium?.copyWith(
            color: LoveArtTheme.neonTeal.withOpacity(0.6),
            letterSpacing: 2,
          ),
        ),
      ],
    ).animate().fadeIn(duration: 1.seconds).slideX(begin: -0.1, end: 0);
  }

  Widget _buildCentralConsole() {
    final logs = ref.watch(agentLogsProvider);

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
                _buildConsoleTab("SWARM_OUTPUT", true),
                _buildConsoleTab("METRICS", false),
                IconButton(
                   icon: const Icon(Icons.delete_outline, color: Colors.white38),
                   onPressed: () => ref.read(agentLogsProvider.notifier).clear(),
                ),
              ],
            ),
            const Divider(color: Colors.white10),
            Expanded(
              child: ListView.builder(
                controller: _logScrollController,
                itemCount: logs.length,
                padding: const EdgeInsets.symmetric(vertical: 20),
                itemBuilder: (context, index) {
                  return _buildLogTile(logs[index]);
                },
              ),
            ),
          ],
        ),
      ),
    ).animate().scale(delay: 500.ms, duration: 800.ms, curve: Curves.easeOutBack);
  }

  Widget _buildLogTile(AgentMessage msg) {
    Color agentColor = LoveArtTheme.neonTeal;
    if (msg.agent == 'Sarah') agentColor = Colors.cyanAccent;
    if (msg.agent == 'Turing') agentColor = Colors.purpleAccent;
    if (msg.agent == 'Marcus') agentColor = Colors.orangeAccent;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "[${msg.agent.toUpperCase()}] > ",
                style: TextStyle(color: agentColor, fontWeight: FontWeight.bold, fontFamily: 'JetBrains Mono'),
              ),
              Expanded(
                child: Text(
                  msg.text,
                  style: const TextStyle(color: Colors.white, height: 1.4),
                ),
              ),
            ],
          ),
          if (msg.type == 'thought')
            Padding(
              padding: const EdgeInsets.only(left: 40, top: 4),
              child: Text(
                "THINKING: ${msg.text}",
                style: TextStyle(color: Colors.white24, fontSize: 12, fontStyle: FontStyle.italic),
              ).animate(onPlay: (c) => c.repeat()).shimmer(duration: 2.seconds),
            ),
          if (msg.type == 'research')
            Padding(
              padding: const EdgeInsets.only(left: 40, top: 4),
              child: const LinearProgressIndicator(
                backgroundColor: Colors.white10,
                color: Colors.purpleAccent,
                minHeight: 1,
              ).animate().fadeIn(),
            ),
        ],
      ),
    ).animate().fadeIn().slideX(begin: -0.05, end: 0);
  }

  Widget _buildCodePreview(String code) {
    return Container(
      margin: const EdgeInsets.only(left: 32, top: 32, bottom: 32),
      decoration: BoxDecoration(
        color: const Color(0xFF0D1117), // GitHub Dark
        borderRadius: const BorderRadius.horizontal(left: Radius.circular(16)),
        border: Border.all(color: LoveArtTheme.neonTeal.withOpacity(0.3)),
        boxShadow: [BoxShadow(color: LoveArtTheme.neonTeal.withOpacity(0.1), blurRadius: 40)],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: const BorderRadius.only(topLeft: Radius.circular(16)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("SOURCE_CODE", style: TextStyle(color: LoveArtTheme.neonTeal, fontWeight: FontWeight.bold)),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white24),
                  onPressed: () => ref.read(activeCodeProvider.notifier).state = null,
                ),
              ],
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Text(
                code,
                style: const TextStyle(
                  fontFamily: 'JetBrains Mono',
                  color: Color(0xFFE6EDF3),
                  fontSize: 14,
                  height: 1.5,
                ),
              ),
            ),
          ),
        ],
      ),
    );
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
}
