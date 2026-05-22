import 'package:speech_to_text/speech_to_text.dart';
import 'package:flutter_tts/flutter_tts.dart';

class VoiceService {
  final SpeechToText _stt = SpeechToText();
  final FlutterTts _tts = FlutterTts();

  Future<bool> init() async {
    bool available = await _stt.initialize();
    await _tts.setLanguage("en-IN");
    await _tts.setSpeechRate(0.5);
    await _tts.setVolume(1.0);
    return available;
  }

  void startListening(Function(String) onResult) {
    _stt.listen(onResult: (res) => onResult(res.recognizedWords));
  }

  void stopListening() {
    _stt.stop();
  }

  Future<void> speak(String text) async {
    await _tts.speak(text);
  }

  Future<void> stop() async {
    await _tts.stop();
    await _stt.stop();
  }
}
