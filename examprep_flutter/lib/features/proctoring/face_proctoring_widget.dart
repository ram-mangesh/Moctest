import 'dart:async';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';
import 'package:examprep_app/core/theme/app_theme.dart';

// ─────────────────────────────────────────────────────────────────────────────
// FaceProctoringWidget — Flutter equivalent of useFaceProctoring.js
//
// React original behaviour:
//  1. Opens camera (getUserMedia)
//  2. Loads TinyFaceDetector model from /models/
//  3. Every 2000ms: detectAllFaces → check:
//     a. 0 faces → violation "noFace"
//     b. > 1 face → violation "multipleFaces"
//     c. Face shift > 20px → violation "faceShifted"
//     d. Eye movement > 4% → violation "eyeMovement"
//  4. Grace period: 4000ms before first check
//
// Flutter uses Google ML Kit Face Detection (native, no model download needed)
// ─────────────────────────────────────────────────────────────────────────────

class FaceProctoringWidget extends StatefulWidget {
  final void Function(String reason) onViolation;

  const FaceProctoringWidget({super.key, required this.onViolation});

  @override
  State<FaceProctoringWidget> createState() => _FaceProctoringWidgetState();
}

class _FaceProctoringWidgetState extends State<FaceProctoringWidget> {
  CameraController? _controller;
  final _faceDetector = FaceDetector(
    options: FaceDetectorOptions(
      enableLandmarks: true,
      enableClassification: true, // enables eye open probability
      performanceMode: FaceDetectorMode.fast,
    ),
  );

  Timer? _checkTimer;
  bool _isChecking = false;
  DateTime? _startTime;
  Rect? _baseBox;              // baseline face bounding box
  double? _baseLeftEyeOpen;   // baseline eye open probability

  static const _checkInterval = Duration(milliseconds: 2000);
  static const _gracePeriod = Duration(milliseconds: 4000);
  static const _faceShiftThreshold = 0.08; // % of image width (proxy for 20px)
  static const _eyeMovementThreshold = 0.15;

  bool get _inGrace =>
      _startTime == null ||
      DateTime.now().difference(_startTime!) < _gracePeriod;

  @override
  void initState() {
    super.initState();
    _initCamera();
  }

  Future<void> _initCamera() async {
    try {
      final cameras = await availableCameras();
      if (cameras.isEmpty) return;

      // Prefer front camera
      final frontCam = cameras.firstWhere(
        (c) => c.lensDirection == CameraLensDirection.front,
        orElse: () => cameras.first,
      );

      _controller = CameraController(frontCam, ResolutionPreset.low);
      await _controller!.initialize();

      _startTime = DateTime.now();
      _checkTimer = Timer.periodic(_checkInterval, (_) => _runCheck());

      if (mounted) setState(() {});
    } catch (_) {
      // Camera unavailable — silent fail (same as React: alert but non-fatal)
    }
  }

  Future<void> _runCheck() async {
    if (_isChecking || _inGrace || _controller == null) return;
    if (!_controller!.value.isInitialized) return;

    _isChecking = true;
    try {
      final file = await _controller!.takePicture();
      final inputImage = InputImage.fromFilePath(file.path);
      final faces = await _faceDetector.processImage(inputImage);

      if (faces.isEmpty) {
        _baseBox = null;
        _baseLeftEyeOpen = null;
        widget.onViolation('No face detected — please look at the screen');
        _isChecking = false;
        return;
      }

      if (faces.length > 1) {
        _baseBox = null;
        widget.onViolation('Multiple faces detected — only one person allowed');
        _isChecking = false;
        return;
      }

      final face = faces.first;
      final box = face.boundingBox;

      if (_baseBox == null) {
        // First frame — establish baseline
        _baseBox = box;
        _baseLeftEyeOpen = face.leftEyeOpenProbability;
        _isChecking = false;
        return;
      }

      // ── Face shift detection (mirrors dx > 20 || dy > 20 in React)
      // Normalise by image dimensions — use threshold as fraction
      final dx = (box.left - _baseBox!.left).abs();
      final dy = (box.top - _baseBox!.top).abs();
      final imgW = _controller!.value.previewSize?.width ?? 640;
      final imgH = _controller!.value.previewSize?.height ?? 480;

      if (dx / imgW > _faceShiftThreshold || dy / imgH > _faceShiftThreshold) {
        widget.onViolation('Head movement detected — please keep your head still');
        _baseBox = box;
        _baseLeftEyeOpen = face.leftEyeOpenProbability;
        _isChecking = false;
        return;
      }

      // ── Eye movement detection (mirrors normEyeX/Y > 0.04 in React)
      final leftEyeOpen = face.leftEyeOpenProbability ?? 0.5;
      if (_baseLeftEyeOpen != null) {
        final diff = (leftEyeOpen - _baseLeftEyeOpen!).abs();
        if (diff > _eyeMovementThreshold) {
          widget.onViolation('Suspicious eye movement detected');
          _baseLeftEyeOpen = leftEyeOpen;
        }
      }
    } catch (_) {
      // Detection error — silent
    }

    _isChecking = false;
  }

  @override
  void dispose() {
    _checkTimer?.cancel();
    _controller?.dispose();
    _faceDetector.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_controller == null || !_controller!.value.isInitialized) {
      return Container(
        width: 128, height: 96,
        decoration: BoxDecoration(
          color: Colors.black,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.primary, width: 1),
        ),
        child: const Icon(Icons.videocam_off, color: Colors.white, size: 24),
      );
    }

    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: SizedBox(
        width: 128, height: 96,
        child: CameraPreview(_controller!),
      ),
    );
  }
}
