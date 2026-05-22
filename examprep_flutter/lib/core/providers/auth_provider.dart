import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:examprep_app/core/api/api_endpoints.dart';
import 'package:examprep_app/core/api/dio_client.dart';

// ── Auth state model
class AuthState {
  final String? token;
  final String? role;
  final String? name;
  final String? userId;
  final bool isLoading;
  final String? error;
  final bool isSuccess;

  const AuthState({
    this.token,
    this.role,
    this.name,
    this.userId,
    this.isLoading = false,
    this.error,
    this.isSuccess = false,
  });

  bool get isLoggedIn => token != null;
  bool get isAdmin => role != null && role!.toUpperCase().contains('ADMIN');

  AuthState copyWith({
    String? token,
    String? role,
    String? name,
    String? userId,
    bool? isLoading,
    String? error,
    bool? isSuccess,
  }) =>
      AuthState(
        token: token ?? this.token,
        role: role ?? this.role,
        name: name ?? this.name,
        userId: userId ?? this.userId,
        isLoading: isLoading ?? this.isLoading,
        error: error ?? this.error,
        isSuccess: isSuccess ?? this.isSuccess,
      );
}

// ── Auth notifier — mirrors React Login/Register logic + localStorage
class AuthNotifier extends AsyncNotifier<AuthState> {
  @override
  Future<AuthState> build() async {
    // Restore from SharedPreferences on startup
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    final role = prefs.getString('role');
    final name = prefs.getString('name');
    final userId = prefs.getString('userId');

    return AuthState(token: token, role: role, name: name, userId: userId);
  }

  DioClient get _api => ref.read(dioClientProvider);

  // ── Login (mirrors React Login onSubmit)
  Future<void> login({
    required String email,
    required String password,
    required void Function(String route) onSuccess,
    required void Function(String error) onError,
  }) async {
    state = AsyncData(state.value!.copyWith(isLoading: true, error: null, isSuccess: false));

    try {
      final res = await _api.post(ApiEndpoints.login, data: {
        'email': email,
        'password': password,
      });

      final data = res.data as Map<String, dynamic>;
      final token = data['token'] as String;
      final role = data['role'] as String;
      final name = data['name'] as String;
      final userId = data['id'].toString();

      // Save to SharedPreferences (same keys as React localStorage)
      await AuthStorage.saveAuth(
        token: token,
        role: role,
        name: name,
        userId: userId,
      );

      state = AsyncData(AuthState(
        token: token,
        role: role,
        name: name,
        userId: userId,
        isSuccess: true,
        isLoading: false,
      ));

      // Redirect logic: ADMIN → /admin, else → /home (mirrors React timeout navigate)
      await Future.delayed(const Duration(milliseconds: 900));
      onSuccess(role.toUpperCase().contains('ADMIN') ? '/admin' : '/home');
    } catch (e) {
      state = AsyncData(state.value!.copyWith(
        isLoading: false,
        error: 'Invalid email or password. Please try again.',
      ));
      onError('Invalid email or password. Please try again.');
    }
  }

  // ── Register (mirrors React Registration onSubmit)
  Future<void> register({
    required String name,
    required String email,
    required String phone,
    required String password,
    required VoidCallback onSuccess,
    required void Function(String error) onError,
  }) async {
    state = AsyncData(state.value!.copyWith(isLoading: true, error: null, isSuccess: false));

    try {
      await _api.post(ApiEndpoints.register, data: {
        'name': name,
        'email': email,
        'phone': phone,
        'password': password,
      });

      state = AsyncData(state.value!.copyWith(
        isLoading: false,
        isSuccess: true,
      ));

      // Auto-redirect to login after 1200ms (mirrors React setTimeout)
      await Future.delayed(const Duration(milliseconds: 1200));
      onSuccess();
    } catch (e) {
      state = AsyncData(state.value!.copyWith(
        isLoading: false,
        error: 'Registration failed. Please try again.',
      ));
      onError('Registration failed. Please try again.');
    }
  }

  // ── Logout
  Future<void> logout() async {
    await AuthStorage.clearAuth();
    state = const AsyncData(AuthState());
  }
}

final authProvider =
    AsyncNotifierProvider<AuthNotifier, AuthState>(AuthNotifier.new);
