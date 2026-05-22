import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final localeProvider = StateProvider<Locale>((ref) => const Locale('en'));

class AppLocalizations {
  final Locale locale;
  AppLocalizations(this.locale);

  static final Map<String, Map<String, String>> _values = {
    'en': {
      'welcome': 'Welcome to ExamPrep',
      'start_exam': 'Start Exam',
      'my_groups': 'My Groups',
      'settings': 'Settings',
      'language': 'Language',
      'back': 'Back',
    },
    'hi': {
      'welcome': 'ExamPrep में आपका स्वागत है',
      'start_exam': 'परीक्षा शुरू करें',
      'my_groups': 'मेरे समूह',
      'settings': 'समायोजन',
      'language': 'भाषा',
      'back': 'पीछे',
    }
  };

  String translate(String key) => _values[locale.languageCode]?[key] ?? key;
}
