// frontend/lib/services/agent_stream_provider.dart
import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:sse_client/sse_client.dart';
import '../config.dart';

class AgentMessage {
  final String agent;
  final String text;
  final String type;
  final dynamic data;
  final DateTime timestamp;

  AgentMessage({
    required this.agent,
    required this.text,
    required this.type,
    this.data,
    required this.timestamp,
  });

  factory AgentMessage.fromJson(Map<String, dynamic> json) {
    return AgentMessage(
      agent: json['agent'] ?? 'System',
      text: json['text'] ?? (json['type'] == 'completion' ? json['text'] : ''),
      type: json['type'] ?? 'info',
      data: json['data'],
      timestamp: DateTime.now(),
    );
  }
}

// State for keeping track of the "currently active code" or "selected artifact"
final activeCodeProvider = StateProvider<String?>((ref) => null);
final activeDesignProvider = StateProvider<Map<String, dynamic>?>((ref) => null);

final agentLogsProvider = StateNotifierProvider<AgentLogsNotifier, List<AgentMessage>>((ref) {
  return AgentLogsNotifier(ref);
});

class AgentLogsNotifier extends StateNotifier<List<AgentMessage>> {
  final Ref ref;
  AgentLogsNotifier(this.ref) : super([]);
  SseClient? _client;

  void startListening() {
    if (_client != null) return;
    
    // Clear old logs on new session
    state = [];
    
    // Connect to the Cloudflare Gateway which proxies to Cloud Run SSE
    _client = SseClient.connect(Uri.parse("${Config.apiUrl}/api/orchestrate"));
    
    _client!.stream.listen((data) {
      if (data != null && data.isNotEmpty) {
        try {
          final json = jsonDecode(data);
          final message = AgentMessage.fromJson(json);
          
          state = [...state, message];

          // Auto-update code preview if new code arrives
          if (message.type == 'code' && message.data != null) {
            ref.read(activeCodeProvider.notifier).state = message.data.toString();
          }
          
          if (message.type == 'artifact' && message.data != null) {
            ref.read(activeDesignProvider.notifier).state = message.data as Map<String, dynamic>;
          }

        } catch (e) {
             // Fallback for non-JSON or malformed data
             state = [...state, AgentMessage(
               agent: "System", 
               text: data, 
               type: "raw", 
               timestamp: DateTime.now()
             )];
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
    ref.read(activeCodeProvider.notifier).state = null;
    ref.read(activeDesignProvider.notifier).state = null;
  }
}
