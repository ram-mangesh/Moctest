import { useEffect, useRef } from "react";

export default function CameraTest() {
  const videoRef = useRef(null);

  useEffect(() => {
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        console.log("✅ CAMERA WORKING");
      } catch (e) {
        console.error("❌ CAMERA FAILED", e.name, e.message);
        alert("Camera failed: " + e.name);
      }
    };

    start();
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      style={{ width: 300, height: 200, background: "black" }}
    />
  );
}