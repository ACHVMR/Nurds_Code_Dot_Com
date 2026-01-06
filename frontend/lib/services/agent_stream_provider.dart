// frontend/lib/services/agent_stream_provider.dart
import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:sse_client/sse_client.dart';
import '../config.dart';

class AgentMessage {
  final String agent;
  final String message;
  final String type;

  AgentMessage({required this.agent, required this.message, required this.type});

  factory AgentMessage.fromJson(Map<String, dynamic> json) {
    return AgentMessage(
      agent: json['agent'] ?? 'System',
      message: json['message'] ?? '',
      type: json['type'] ?? 'info',
    );
  }
}

final agentLogsProvider = StateNotifierProvider<AgentLogsNotifier, List<AgentMessage>>((ref) {
  return AgentLogsNotifier();
});

class AgentLogsNotifier extends StateNotifier<List<AgentMessage>> {
  AgentLogsNotifier() : super([]);
  SseClient? _client;

  void startListening() {
    if (_client != null) return;
    
    // Connect to the Cloudflare Gateway which proxies to Cloud Run SSE
    _client = SseClient.connect(Uri.parse("${Config.apiUrl}/api/orchestrate"));
    
    _client!.stream.listen((data) {
      if (data != null && data.isNotEmpty) {
        try {
          final json = jsonDecode(data);
          state = [...state, AgentMessage.fromJson(json)];
        } catch (e) {
          state = [...state, AgentMessage(agent: "System", message: data, type: "raw")];
        }
      }
    });
  }

  void stopListening() {
    _client?.close();
    _client = null;
  }

  void clear() {
    state = [];
  }
}
