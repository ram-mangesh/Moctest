import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_endpoints.dart';

// ── Base URL matches React axios.js
// const kBaseUrl = 'http://192.168.0.137:8089/api';

// ─────────────────────────────────────────────────────────────────────────────
// Auth token helpers  (same localStorage keys as React: "token", "role", etc.)
// ─────────────────────────────────────────────────────────────────────────────
class AuthStorage {
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  static Future<void> saveAuth({
    required String token,
    required String role,
    required String name,
    required String userId,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
    await prefs.setString('role', role);
    await prefs.setString('name', name);
    await prefs.setString('userId', userId);
  }

  static Future<void> clearAuth() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('role');
    await prefs.remove('name');
    await prefs.remove('userId');
  }

  static Future<String?> getRole() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('role');
  }

  static Future<String?> getName() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('name');
  }

  static Future<String?> getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('userId');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Dio client — mirrors React's axios instance with JWT interceptor + 401 handler
// ─────────────────────────────────────────────────────────────────────────────
class DioClient {
  late final Dio _dio;

  // Called on 401 to force-logout — set from router
  static void Function()? onUnauthorized;

  DioClient() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiEndpoints.baseUrl,
        contentType: 'application/json',
        responseType: ResponseType.json,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 30),
      ),
    );

    // ── Logger for debugging
    _dio.interceptors.add(LogInterceptor(responseBody: true, requestBody: true));

    // ── Request interceptor: attach JWT (mirrors axios request interceptor)
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Bypass localtunnel warning screen
          options.headers['Bypass-Tunnel-Reminder'] = 'true';
          
          final token = await AuthStorage.getToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onResponse: (response, handler) {
          handler.next(response);
        },
        onError: (DioException e, handler) async {
          // ── 401: clear token and redirect to login (mirrors axios response interceptor)
          if (e.response?.statusCode == 401) {
            await AuthStorage.clearAuth();
            onUnauthorized?.call();
          }
          handler.next(e);
        },
      ),
    );
  }

  Dio get dio => _dio;

  // ── REST convenience methods
  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) =>
      _dio.get(path, queryParameters: queryParameters);

  Future<Response> post(String path, {dynamic data, Options? options}) =>
      _dio.post(path, data: data, options: options);

  Future<Response> put(String path, {dynamic data}) =>
      _dio.put(path, data: data);

  Future<Response> delete(String path) => _dio.delete(path);

  // ── Plain text POST (used by VoiceAiTutor: api.post('/user/ai/teacher-call', text, {headers: {'Content-Type': 'text/plain'}}))
  Future<Response> postText(String path, String text) => _dio.post(
        path,
        data: text,
        options: Options(contentType: 'text/plain'),
      );
}

// ── Riverpod provider
final dioClientProvider = Provider<DioClient>((ref) => DioClient());
