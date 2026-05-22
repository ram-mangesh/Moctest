import { useRef } from "react";

export default function useTextToSpeech() {
  const utteranceRef = useRef(null);

  const speak = (text, lang = "en") => {
    if (!window.speechSynthesis || !text) return;

    // stop previous speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // language mapping
    if (lang === "hi") utterance.lang = "hi-IN";
    else if (lang === "mr") utterance.lang = "mr-IN";
    else utterance.lang = "en-US";

    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
  };

  return { speak, stop };
}