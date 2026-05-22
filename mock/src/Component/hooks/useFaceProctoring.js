import { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { useTranslation } from "react-i18next";

const CHECK_INTERVAL = 2000;
const GRACE_TIME = 4000;

export default function useFaceProctoring({ onViolation }) {

  const { t } = useTranslation();
  const tRef = useRef(t);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const baseCenter = useRef(null);
  const baseEye = useRef(null);

  const lastViolation = useRef(0);
  const startTime = useRef(Date.now());

  const cameraStarted = useRef(false);
  const modelsLoaded = useRef(false);

  const detectorOptions = new faceapi.TinyFaceDetectorOptions({
    inputSize: 224,
    scoreThreshold: 0.3
  });

  const getEyeCenter = (eye) => {
    const x = eye.reduce((s, p) => s + p.x, 0) / eye.length;
    const y = eye.reduce((s, p) => s + p.y, 0) / eye.length;
    return { x, y };
  };

  /* CAMERA */

  useEffect(() => {

    const startCamera = async () => {

      if (cameraStarted.current) return;
      cameraStarted.current = true;

      try {

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;

        await new Promise(resolve => {
          const wait = () => {
            if (videoRef.current) resolve();
            else requestAnimationFrame(wait);
          };
          wait();
        });

        videoRef.current.srcObject = stream;

        await new Promise(resolve => {
          videoRef.current.onloadedmetadata = resolve;
        });

        await videoRef.current.play();

      } catch {
        alert(tRef.current("proctor.cameraDenied"));
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };

  }, []);

  /* LOAD MODELS */

  useEffect(() => {

    const loadModels = async () => {

      try {

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models/tiny_face_detector"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models/face_landmark_68")
        ]);

        modelsLoaded.current = true;

      } catch {
        alert(tRef.current("proctor.modelLoadFail"));
      }
    };

    loadModels();

  }, []);

  /* PROCTOR LOOP */

  useEffect(() => {

    const interval = setInterval(async () => {

      const video = videoRef.current;

      if (!video) return;
      if (!modelsLoaded.current) return;
      if (video.videoWidth === 0 || video.videoHeight === 0) return;
      if (Date.now() - startTime.current < GRACE_TIME) return;
      if (Date.now() - lastViolation.current < CHECK_INTERVAL) return;

      let detections = [];

      try {

        detections = await faceapi
          .detectAllFaces(video, detectorOptions)
          .withFaceLandmarks();

      } catch {
        return;
      }

      if (detections.length === 0) {
        baseCenter.current = null;
        baseEye.current = null;
        lastViolation.current = Date.now();
        onViolation(tRef.current("proctor.noFace"));
        return;
      }

      if (detections.length > 1) {
        baseCenter.current = null;
        baseEye.current = null;
        lastViolation.current = Date.now();
        onViolation(tRef.current("proctor.multipleFaces"));
        return;
      }

      const detection = detections[0];

      const box = detection.detection.box;

      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;

      const leftEye = detection.landmarks.getLeftEye();
      const rightEye = detection.landmarks.getRightEye();

      const leftCenter = getEyeCenter(leftEye);
      const rightCenter = getEyeCenter(rightEye);

      const eyeX = (leftCenter.x + rightCenter.x) / 2;
      const eyeY = (leftCenter.y + rightCenter.y) / 2;

      const normEyeX = (eyeX - box.x) / box.width;
      const normEyeY = (eyeY - box.y) / box.height;

      if (!baseCenter.current) {

        baseCenter.current = { centerX, centerY };
        baseEye.current = { x: normEyeX, y: normEyeY };

        return;
      }

      /* FACE SHIFT */

      const dx = Math.abs(centerX - baseCenter.current.centerX);
      const dy = Math.abs(centerY - baseCenter.current.centerY);

      if (dx > 20 || dy > 20) {

        lastViolation.current = Date.now();
        onViolation(tRef.current("proctor.faceShifted"));

        baseCenter.current = { centerX, centerY };
        baseEye.current = { x: normEyeX, y: normEyeY };

        return;
      }

      /* EYE MOVEMENT */

      const ex = Math.abs(normEyeX - baseEye.current.x);
      const ey = Math.abs(normEyeY - baseEye.current.y);

      if (ex > 0.04 || ey > 0.04) {
        lastViolation.current = Date.now();
        onViolation(tRef.current("proctor.eyeMovement"));
      }

    }, CHECK_INTERVAL);

    return () => clearInterval(interval);

  }, [onViolation]);

  return { videoRef };

}