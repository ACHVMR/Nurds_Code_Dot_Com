// frontend/lib/services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  // 1. Sync User Settings (Circuit Box)
  Future<void> updateSettings(Map<String, dynamic> settings) async {
    try {
      final response = await http.post(
        Uri.parse("${Config.apiUrl}/api/user/settings"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(settings),
      );
      if (response.statusCode != 200) {
        print("Failed to update settings: ${response.body}");
      }
    } catch (e) {
      print("Error updating settings: $e");
    }
  }

  Future<Map<String, dynamic>> fetchSettings() async {
    try {
      final response = await http.get(Uri.parse("${Config.apiUrl}/api/user/settings"));
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      print("Error fetching settings: $e");
    }
    return {};
  }

  // 2. Orchestration (Agent Discussion)
  // Note: For SSE/Streaming, we use a different approach in Flutter (EventSource or similar)
  // For now, a standard POST for start-of-work
  Future<void> orchestrate(String userName, Map<String, dynamic> project) async {
    try {
       await http.post(
        Uri.parse("${Config.apiUrl}/api/orchestrate"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "userName": userName,
          "project": project,
        }),
      );
    } catch (e) {
      print("Orchestration error: $e");
    }
  }
}
