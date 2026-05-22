import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../Api/axios";

/**
 * BlindAccessibleExam — Full Voice-Driven Exam for Blind / Visually Impaired Students
 *
 * Complete flow (no screen needed):
 *
 * 1. Page loads → voice says "Welcome [name]. Exam has [N] questions. Say READY to begin."
 * 2. Student says "READY" → Question 1 starts
 * 3. Voice reads: "Question 1 of N. [Question text]. Option A: [text]. Option B: [text]. Option C: [text]. Option D: [text]."
 * 4. Student speaks the option letter or text: "A" / "Option A" / "the first one"
 * 5. Voice CONFIRMS: "You chose Option A: [option text]. Say YES to confirm, or REPEAT to hear again."
 * 6. If student says "YES" → saved, moves to next question
 * 7. If student says "REPEAT" → reads question + options again
 * 8. If no speech detected for 8s → reads question again automatically
 * 9. After all questions: "Exam complete. You answered [N] questions. Say SUBMIT to submit."
 * 10. Student says "SUBMIT" → submits, voice reads result
 *
 * Voice commands recognized:
 *   "A" / "option A" / "first"    → select option A
 *   "B" / "option B" / "second"   → select option B
 *   "C" / "option C" / "third"    → select option C
 *   "D" / "option D" / "fourth"   → select option D
 *   "REPEAT" / "again"            → re-read question
 *   "YES" / "confirm" / "correct" → confirm selection
 *   "NO" / "change"               → deselect, repeat question
 *   "NEXT" (after confirm)        → next question
 *   "SUBMIT" / "finish"           → submit exam
 *   "SKIP"                        → skip question (mark unanswered)
 *
 * Route: /blind-exam/:topicId
 * Add to UserRoutes:
 *   <Route path="/blind-exam/:topicId" element={<BlindAccessibleExam />} />
 */

const PHASE = {
  LOADING:   "loading",
  WELCOME:   "welcome",
  QUESTION:  "question",     // reading question + options
  LISTENING: "listening",    // waiting for student to speak
  CONFIRM:   "confirm",      // confirming chosen option
  NEXT_WAIT: "next_wait",    // "say NEXT for next question"
  SUBMITTING:"submitting",
  RESULT:    "result",
};

const OPTION_LABELS = ["A", "B", "C", "D", "E"];

const BlindAccessibleExam = () => {
  const { topicId }     = useParams();
  const navigate        = useNavigate();

  const [phase,          setPhase]        = useState(PHASE.LOADING);
  const [questions,      setQuestions]    = useState([]);
  const [currentIdx,     setCurrentIdx]   = useState(0);
  const [answers,        setAnswers]      = useState({});
  const [pendingAnswer,  setPending]      = useState(null); // option text waiting confirm
  const [statusText,     setStatus]       = useState("Loading exam...");
  const [transcript,     setTranscript]   = useState("");
  const [isSpeaking,     setIsSpeaking]   = useState(false);
  const [isListening,    setIsListening]  = useState(false);
  const [result,         setResult]       = useState(null);
  const [readCount,      setReadCount]    = useState(0); // how many times question was read

  const synthRef       = useRef(window.speechSynthesis);
  const recognitionRef = useRef(null);
  const silenceTimer   = useRef(null);
  const phaseRef       = useRef(PHASE.LOADING);
  const questionsRef   = useRef([]);
  const currentIdxRef  = useRef(0);
  const answersRef     = useRef({});
  const pendingRef     = useRef(null);

  // Keep refs in sync
  useEffect(() => { phaseRef.current       = phase;       }, [phase]);
  useEffect(() => { questionsRef.current   = questions;   }, [questions]);
  useEffect(() => { currentIdxRef.current  = currentIdx;  }, [currentIdx]);
  useEffect(() => { answersRef.current     = answers;     }, [answers]);
  useEffect(() => { pendingRef.current     = pendingAnswer; }, [pendingAnswer]);

  const studentName = localStorage.getItem("name") || "Student";

  /* ══════════════════════════════════════════════════════════
     TTS — stored in ref, called from anywhere
  ══════════════════════════════════════════════════════════ */
  const speakFn = useCallback((text, onDone) => {
    if (!synthRef.current) { onDone?.(); return; }
    synthRef.current.cancel();
    setIsSpeaking(true);
    setStatus(text.length > 80 ? text.substring(0, 77) + "..." : text);

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate   = 0.88; // slightly slower for accessibility
    utter.pitch  = 1.0;
    utter.volume = 1;
    utter.lang   = "en-IN";

    const voices = synthRef.current.getVoices();
    const v = voices.find((v) => v.lang === "en-IN")
           || voices.find((v) => v.lang.startsWith("en-GB"))
           || voices.find((v) => v.lang.startsWith("en"));
    if (v) utter.voice = v;

    utter.onend   = () => { setIsSpeaking(false); onDone?.(); };
    utter.onerror = () => { setIsSpeaking(false); onDone?.(); };
    synthRef.current.speak(utter);
  }, []);

  const speakRef = useRef(speakFn);
  speakRef.current = speakFn;
  const speak = (text, onDone) => speakRef.current(text, onDone);

  /* ══════════════════════════════════════════════════════════
     LOAD QUESTIONS
  ══════════════════════════════════════════════════════════ */
  useEffect(() => {
    api.get(`/user/questions?topicId=${topicId}`)
      .then((res) => {
        const qs = res.data || [];
        setQuestions(qs);
        questionsRef.current = qs;
        setPhase(PHASE.WELCOME);
        phaseRef.current = PHASE.WELCOME;
      })
      .catch(() => {
        setStatus("Failed to load questions. Please go back and try again.");
      });
  }, [topicId]);

  /* ══════════════════════════════════════════════════════════
     WELCOME — greet and wait for READY
  ══════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (phase !== PHASE.WELCOME) return;
    const qs = questionsRef.current;
    speak(
      `Welcome ${studentName}. This exam has ${qs.length} questions. ` +
      `I will read each question and its options aloud. ` +
      `After I finish reading, say the option letter — A, B, C, or D — to choose your answer. ` +
      `I will confirm your choice. Say YES to confirm or REPEAT to hear the question again. ` +
      `Say READY when you are prepared to begin.`,
      () => startListeningForCommand()
    );
  }, [phase]);

  /* ══════════════════════════════════════════════════════════
     READ QUESTION
  ══════════════════════════════════════════════════════════ */
  const readQuestion = useCallback((idx) => {
    const qs = questionsRef.current;
    if (idx >= qs.length) {
      // All questions done
      const answered = Object.keys(answersRef.current).length;
      setPhase(PHASE.NEXT_WAIT);
      phaseRef.current = PHASE.NEXT_WAIT;
      speak(
        `You have completed all ${qs.length} questions. ` +
        `You have answered ${answered} out of ${qs.length}. ` +
        `Say SUBMIT to submit your exam, or say a question number like QUESTION 3 to revisit it.`,
        () => startListeningForCommand()
      );
      return;
    }

    const q    = qs[idx];
    const opts = (q.options || [])
      .map((opt, i) => `Option ${OPTION_LABELS[i]}: ${opt}`)
      .join(". ");

    const existingAnswer = answersRef.current[q.id];
    const alreadyText = existingAnswer
      ? `You have already chosen option ${existingAnswer.optionLabel}: ${existingAnswer.selected}. `
      : "";

    setPhase(PHASE.QUESTION);
    phaseRef.current = PHASE.QUESTION;
    setReadCount((c) => c + 1);

    speak(
      `Question ${idx + 1} of ${qs.length}. ${alreadyText}${q.question}. ${opts}. ` +
      `Please say the option letter to choose your answer.`,
      () => {
        setPhase(PHASE.LISTENING);
        phaseRef.current = PHASE.LISTENING;
        startListeningForCommand();
        startSilenceTimer(idx);
      }
    );
  }, []);

  const readRef = useRef(readQuestion);
  readRef.current = readQuestion;

  /* ══════════════════════════════════════════════════════════
     SILENCE TIMER — re-read if no speech in 9 seconds
  ══════════════════════════════════════════════════════════ */
  const startSilenceTimer = (idx) => {
    clearTimeout(silenceTimer.current);
    silenceTimer.current = setTimeout(() => {
      if (phaseRef.current !== PHASE.LISTENING) return;
      speak("I didn't hear anything. Let me read the question again.", () => {
        readRef.current(idx ?? currentIdxRef.current);
      });
    }, 9000);
  };

  const clearSilenceTimer = () => clearTimeout(silenceTimer.current);

  /* ══════════════════════════════════════════════════════════
     SPEECH RECOGNITION
  ══════════════════════════════════════════════════════════ */
  const startListeningForCommand = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setStatus("Voice recognition not available. Please use Chrome or Edge.");
      return;
    }

    try { recognitionRef.current?.stop(); } catch {}

    const rec = new SR();
    rec.lang           = "en-IN";
    rec.interimResults = false;
    rec.continuous     = false;
    rec.maxAlternatives = 3;

    rec.onstart = () => { setIsListening(true); setTranscript(""); };

    rec.onresult = (e) => {
      clearSilenceTimer();
      const results = Array.from(e.results[0]).map((r) => r.transcript.trim().toLowerCase());
      const heard = results[0] || "";
      setTranscript(heard);
      setIsListening(false);
      handleVoiceCommand(heard, results);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onerror = (e) => {
      setIsListening(false);
      if (e.error === "not-allowed") {
        speak("Microphone access is required for this exam. Please allow microphone permission and refresh.", null);
      } else if (e.error !== "no-speech") {
        // Restart silently on other errors
        setTimeout(() => {
          if (phaseRef.current === PHASE.LISTENING || phaseRef.current === PHASE.CONFIRM || phaseRef.current === PHASE.NEXT_WAIT || phaseRef.current === PHASE.WELCOME) {
            startListeningForCommand();
          }
        }, 800);
      }
    };

    recognitionRef.current = rec;
    setTimeout(() => {
      try { rec.start(); } catch {}
    }, 300);
  };

  /* ══════════════════════════════════════════════════════════
     COMMAND PARSER
  ══════════════════════════════════════════════════════════ */
  const handleVoiceCommand = useCallback((heard, alternatives) => {
    const phase = phaseRef.current;
    const idx   = currentIdxRef.current;
    const qs    = questionsRef.current;
    const q     = qs[idx];

    console.log("🎤 Heard:", heard, "| Phase:", phase);

    // ── WELCOME phase ──
    if (phase === PHASE.WELCOME) {
      if (/ready|start|begin|yes/.test(heard)) {
        setCurrentIdx(0);
        currentIdxRef.current = 0;
        readRef.current(0);
      } else {
        speak("I heard: " + heard + ". Please say READY to begin.", () => startListeningForCommand());
      }
      return;
    }

    // ── LISTENING phase — pick an option ──
    if (phase === PHASE.LISTENING && q) {
      const opts   = q.options || [];
      let selected = null;
      let optLabel = null;

      // Match: "A", "option A", "first", "one", "1" → index 0
      const matchMap = [
        { idx: 0, patterns: /\bfirst\b|^a$|option a|\bone\b|^1$/ },
        { idx: 1, patterns: /\bsecond\b|^b$|option b|\btwo\b|^2$/ },
        { idx: 2, patterns: /\bthird\b|^c$|option c|\bthree\b|^3$/ },
        { idx: 3, patterns: /\bfourth\b|^d$|option d|\bfour\b|^4$/ },
        { idx: 4, patterns: /\bfifth\b|^e$|option e|\bfive\b|^5$/ },
      ];

      // Also try fuzzy match against option text
      let matchedIdx = -1;
      for (const m of matchMap) {
        if (m.idx < opts.length && m.patterns.test(heard)) {
          matchedIdx = m.idx; break;
        }
      }

      // Fuzzy text match: if student speaks part of an option
      if (matchedIdx === -1) {
        for (let i = 0; i < opts.length; i++) {
          const optWords = opts[i].toLowerCase().split(/\s+/);
          const heardWords = heard.split(/\s+/);
          const overlap = heardWords.filter((w) => w.length > 3 && optWords.includes(w)).length;
          if (overlap >= 2) { matchedIdx = i; break; }
        }
      }

      if (matchedIdx >= 0 && matchedIdx < opts.length) {
        selected  = opts[matchedIdx];
        optLabel  = OPTION_LABELS[matchedIdx];
        setPending({ selected, optionLabel: optLabel, optionIdx: matchedIdx });
        pendingRef.current = { selected, optionLabel: optLabel, optionIdx: matchedIdx };

        setPhase(PHASE.CONFIRM);
        phaseRef.current = PHASE.CONFIRM;

        speak(
          `You chose Option ${optLabel}: ${selected}. Say YES to confirm, or REPEAT to hear the question again.`,
          () => startListeningForCommand()
        );
        return;
      }

      if (/repeat|again|what|pardon|sorry|didn.t hear/.test(heard)) {
        readRef.current(idx);
        return;
      }

      if (/skip/.test(heard)) {
        speak(`Question ${idx + 1} skipped. Moving to question ${idx + 2}.`, () => {
          const next = idx + 1;
          setCurrentIdx(next); currentIdxRef.current = next;
          readRef.current(next);
        });
        return;
      }

      // Didn't understand
      speak(`I heard "${heard}" but didn't understand. Please say A, B, C, or D.`, () => {
        setPhase(PHASE.LISTENING); phaseRef.current = PHASE.LISTENING;
        startListeningForCommand();
        startSilenceTimer(idx);
      });
      return;
    }

    // ── CONFIRM phase — yes/no ──
    if (phase === PHASE.CONFIRM) {
      const pending = pendingRef.current;

      if (/yes|confirm|correct|right|ok|okay|yep|yeah/.test(heard)) {
        if (pending && q) {
          const updated = {
            ...answersRef.current,
            [q.id]: {
              selected:    pending.selected,
              optionLabel: pending.optionLabel,
              optionIdx:   pending.optionIdx,
            },
          };
          setAnswers(updated);
          answersRef.current = updated;
          setPending(null);
          pendingRef.current = null;

          const next = idx + 1;
          const isLast = next >= qs.length;

          if (isLast) {
            speak(
              `Option ${pending.optionLabel} confirmed. That was the last question. ` +
              `Say SUBMIT to submit your exam.`,
              () => {
                setPhase(PHASE.NEXT_WAIT); phaseRef.current = PHASE.NEXT_WAIT;
                startListeningForCommand();
              }
            );
          } else {
            speak(
              `Option ${pending.optionLabel} confirmed. Moving to question ${next + 1}.`,
              () => {
                setCurrentIdx(next); currentIdxRef.current = next;
                readRef.current(next);
              }
            );
          }
        }
        return;
      }

      if (/no|change|wrong|repeat|again|different/.test(heard)) {
        setPending(null);
        pendingRef.current = null;
        speak("Okay, let me read the question again.", () => readRef.current(idx));
        return;
      }

      speak(`Say YES to confirm option ${pending?.optionLabel || ""}, or REPEAT to hear again.`, () => startListeningForCommand());
      return;
    }

    // ── NEXT_WAIT phase — submit or revisit ──
    if (phase === PHASE.NEXT_WAIT) {
      if (/submit|finish|done|end/.test(heard)) {
        submitExam();
        return;
      }

      // "question 3" → go to question 3
      const qMatch = heard.match(/question\s+(\d+)|go to\s+(\d+)|number\s+(\d+)/);
      if (qMatch) {
        const n = parseInt(qMatch[1] || qMatch[2] || qMatch[3]) - 1;
        if (n >= 0 && n < qs.length) {
          setCurrentIdx(n); currentIdxRef.current = n;
          readRef.current(n);
          return;
        }
      }

      speak("Say SUBMIT to submit, or say a question number to revisit it.", () => startListeningForCommand());
      return;
    }
  }, []);

  /* ══════════════════════════════════════════════════════════
     SUBMIT
  ══════════════════════════════════════════════════════════ */
  const submitExam = async () => {
    setPhase(PHASE.SUBMITTING);
    phaseRef.current = PHASE.SUBMITTING;
    speak("Submitting your exam. Please wait.", null);

    // Convert voice answers to the format TestController expects
    const formatted = {};
    Object.entries(answersRef.current).forEach(([qId, ans]) => {
      formatted[qId] = { selected: ans.selected };
    });

    try {
      const res = await api.post(`/user/test/submit?topicId=${topicId}`, { answers: formatted });
      const data = res.data;
      setResult(data);
      setPhase(PHASE.RESULT);
      phaseRef.current = PHASE.RESULT;

      const pct = data.total > 0
        ? Math.round((data.correct / data.total) * 100)
        : 0;

      speak(
        `Exam submitted successfully. ` +
        `You answered ${data.correct} out of ${data.total} questions correctly. ` +
        `Your score is ${pct} percent. ` +
        (pct >= 75
          ? `Excellent performance! Well done.`
          : pct >= 50
          ? `Good effort. Keep practising your weak topics.`
          : `Don't be discouraged. Review the topics and try again.`),
        null
      );
    } catch {
      speak("Sorry, submission failed. Please try again or contact your teacher.", null);
      setPhase(PHASE.NEXT_WAIT);
      phaseRef.current = PHASE.NEXT_WAIT;
    }
  };

  /* ══════════════════════════════════════════════════════════
     CLEANUP
  ══════════════════════════════════════════════════════════ */
  useEffect(() => () => {
    clearSilenceTimer();
    try { recognitionRef.current?.stop(); } catch {}
    synthRef.current?.cancel();
  }, []);

  /* ══════════════════════════════════════════════════════════
     KEYBOARD SHORTCUTS (accessibility backup)
  ══════════════════════════════════════════════════════════ */
  useEffect(() => {
    const handler = (e) => {
      if (["a","b","c","d"].includes(e.key.toLowerCase()) && phase === PHASE.LISTENING) {
        handleVoiceCommand(e.key.toLowerCase(), [e.key.toLowerCase()]);
      }
      if (e.key === "Enter" && phase === PHASE.CONFIRM) {
        handleVoiceCommand("yes", ["yes"]);
      }
      if (e.key === " " && !isSpeaking && !isListening) {
        e.preventDefault();
        if (phase === PHASE.LISTENING || phase === PHASE.CONFIRM || phase === PHASE.NEXT_WAIT)
          startListeningForCommand();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, isSpeaking, isListening]);

  /* ══════════════════════════════════════════════════════════
     CURRENT QUESTION data
  ══════════════════════════════════════════════════════════ */
  const q        = questions[currentIdx];
  const answered = Object.keys(answers).length;
  const pctDone  = questions.length > 0 ? Math.round((answered / questions.length) * 100) : 0;

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f1117",
      color: "white",
      fontFamily: "'Outfit', 'Inter', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "24px 20px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        @keyframes pulse-ring { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.2);opacity:0} }
        @keyframes wave-bar   { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(2.8)} }
        @keyframes fadeIn     { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.5)} 70%{box-shadow:0 0 0 20px rgba(99,102,241,0)} }
        .bar1{animation:wave-bar .7s ease-in-out infinite}
        .bar2{animation:wave-bar .7s ease-in-out infinite .1s}
        .bar3{animation:wave-bar .7s ease-in-out infinite .2s}
        .bar4{animation:wave-bar .7s ease-in-out infinite .15s}
        .bar5{animation:wave-bar .7s ease-in-out infinite .05s}
        .opt-card{transition:all .2s;cursor:default}
        .opt-card.selected{border-color:#6366f1!important;background:rgba(99,102,241,.15)!important}
        .opt-card.pending{border-color:#f59e0b!important;background:rgba(245,158,11,.12)!important}
      `}</style>

      {/* Header */}
      <div style={{ width:"100%", maxWidth:680, display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <p style={{ color:"rgba(255,255,255,.35)", fontSize:11, letterSpacing:2, textTransform:"uppercase", margin:0 }}>
            Accessible Voice Exam
          </p>
          <p style={{ color:"white", fontSize:16, fontWeight:600, margin:"4px 0 0" }}>
            {studentName}
          </p>
        </div>
        {phase !== PHASE.LOADING && phase !== PHASE.RESULT && (
          <div style={{ textAlign:"right" }}>
            <p style={{ color:"rgba(255,255,255,.5)", fontSize:12, margin:0 }}>
              {answered}/{questions.length} answered
            </p>
            <div style={{ width:120, height:4, background:"rgba(255,255,255,.1)", borderRadius:2, marginTop:6 }}>
              <div style={{ width:pctDone+"%", height:"100%", background:"#6366f1", borderRadius:2, transition:"width .5s" }} />
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ width:"100%", maxWidth:680, flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>

        {/* Status bubble */}
        <div style={{
          width:"100%", background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)",
          borderRadius:20, padding:"18px 24px", marginBottom:24, minHeight:80,
          display:"flex", alignItems:"center", gap:16, animation:"fadeIn .3s ease",
        }}>
          <div style={{ position:"relative", width:40, height:40, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
            {isSpeaking && (
              <>
                <div style={{ position:"absolute", inset:"-8px", borderRadius:"50%", border:"2px solid rgba(99,102,241,.4)", animation:"pulse-ring 1.5s ease-out infinite" }} />
                <div style={{ position:"absolute", inset:"-4px", borderRadius:"50%", border:"2px solid rgba(99,102,241,.5)", animation:"pulse-ring 1.5s ease-out infinite .3s" }} />
              </>
            )}
            <div style={{
              width:40, height:40, borderRadius:"50%",
              background: isSpeaking ? "linear-gradient(135deg,#4f46e5,#7c3aed)"
                        : isListening ? "linear-gradient(135deg,#ef4444,#dc2626)"
                        : "rgba(255,255,255,.1)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:20, transition:"all .3s",
              animation: phase === PHASE.CONFIRM ? "glow-pulse 1.5s ease-in-out infinite" : "none",
            }}>
              {isSpeaking ? "🔊" : isListening ? "🎙️" : phase === PHASE.CONFIRM ? "❓" : phase === PHASE.RESULT ? "🎯" : "⏸"}
            </div>
          </div>
          <div style={{ flex:1 }}>
            <p style={{ color:"rgba(255,255,255,.4)", fontSize:11, textTransform:"uppercase", letterSpacing:1, margin:"0 0 4px" }}>
              {isSpeaking ? "Reading aloud" : isListening ? "Listening for your answer" : phase === PHASE.CONFIRM ? "Confirm your choice" : "Status"}
            </p>
            <p style={{ color:"white", fontSize:15, lineHeight:1.5, margin:0 }}>
              {statusText}
            </p>
            {/* Waveform when speaking */}
            {isSpeaking && (
              <div style={{ display:"flex", gap:3, marginTop:8, alignItems:"center" }}>
                {["bar1","bar2","bar3","bar4","bar5"].map((c) => (
                  <div key={c} className={c} style={{ width:3, height:10, background:"rgba(99,102,241,.7)", borderRadius:2 }} />
                ))}
              </div>
            )}
            {/* Transcript */}
            {transcript && (
              <p style={{ color:"rgba(255,255,255,.45)", fontSize:12, margin:"6px 0 0", fontStyle:"italic" }}>
                You said: "{transcript}"
              </p>
            )}
          </div>
        </div>

        {/* Question display (visual aid for those with partial sight) */}
        {q && phase !== PHASE.RESULT && phase !== PHASE.LOADING && (
          <div style={{ width:"100%", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:16, padding:"20px 24px", marginBottom:20, animation:"fadeIn .3s ease" }}>
            <p style={{ color:"rgba(255,255,255,.3)", fontSize:12, margin:"0 0 10px" }}>
              Question {currentIdx + 1} of {questions.length}
            </p>
            <p style={{ color:"white", fontSize:18, fontWeight:500, lineHeight:1.6, margin:"0 0 20px" }}>
              {q.question}
            </p>
            {/* Options */}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {(q.options || []).map((opt, i) => {
                const lbl     = OPTION_LABELS[i];
                const saved   = answers[q.id];
                const isSel   = saved?.optionLabel === lbl;
                const isPend  = pendingAnswer?.optionLabel === lbl;
                return (
                  <div key={i}
                    className={`opt-card ${isSel ? "selected" : ""} ${isPend ? "pending" : ""}`}
                    style={{
                      display:"flex", alignItems:"center", gap:14,
                      background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)",
                      borderRadius:12, padding:"12px 16px",
                    }}
                  >
                    <div style={{
                      width:32, height:32, borderRadius:"50%", flexShrink:0,
                      background: isSel  ? "#6366f1"
                                : isPend ? "#f59e0b"
                                : "rgba(255,255,255,.1)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:14, fontWeight:700, color:"white",
                      transition:"all .2s",
                    }}>
                      {lbl}
                    </div>
                    <p style={{
                      color: isSel ? "white" : isPend ? "#fcd34d" : "rgba(255,255,255,.75)",
                      fontSize:15, margin:0, flex:1, lineHeight:1.4,
                    }}>
                      {opt}
                    </p>
                    {isSel  && <span style={{ color:"#6366f1", fontSize:18 }}>✓</span>}
                    {isPend && <span style={{ color:"#f59e0b", fontSize:14 }}>?</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Result screen */}
        {phase === PHASE.RESULT && result && (
          <div style={{ width:"100%", textAlign:"center", animation:"fadeIn .5s ease" }}>
            <div style={{ fontSize:64, marginBottom:20 }}>
              {Math.round((result.correct / result.total) * 100) >= 75 ? "🏆" :
               Math.round((result.correct / result.total) * 100) >= 50 ? "👍" : "📚"}
            </div>
            <p style={{ color:"white", fontSize:32, fontWeight:700, margin:"0 0 8px" }}>
              {Math.round((result.correct / result.total) * 100)}%
            </p>
            <p style={{ color:"rgba(255,255,255,.5)", fontSize:16, margin:"0 0 32px" }}>
              {result.correct} correct out of {result.total} questions
            </p>
            <button onClick={() => { synthRef.current?.cancel(); navigate(-1); }}
              style={{
                padding:"14px 40px", background:"linear-gradient(135deg,#4f46e5,#7c3aed)",
                border:"none", borderRadius:16, color:"white", fontSize:16, fontWeight:600,
                cursor:"pointer", letterSpacing:.5,
              }}>
              Back to Exams
            </button>
          </div>
        )}

        {/* Voice command quick reference */}
        {phase !== PHASE.LOADING && phase !== PHASE.RESULT && (
          <div style={{ width:"100%", borderTop:"1px solid rgba(255,255,255,.08)", paddingTop:20, marginTop:"auto" }}>
            <p style={{ color:"rgba(255,255,255,.2)", fontSize:11, textTransform:"uppercase", letterSpacing:2, margin:"0 0 12px" }}>
              Voice commands
            </p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {[
                { cmd:"A / B / C / D",        desc:"Choose option" },
                { cmd:"REPEAT",                desc:"Hear question again" },
                { cmd:"YES",                   desc:"Confirm answer" },
                { cmd:"NO",                    desc:"Change answer" },
                { cmd:"SKIP",                  desc:"Skip question" },
                { cmd:"SUBMIT",                desc:"Submit exam" },
              ].map((item) => (
                <div key={item.cmd} style={{
                  background:"rgba(255,255,255,.06)", borderRadius:10,
                  padding:"6px 12px", display:"flex", alignItems:"center", gap:8,
                }}>
                  <span style={{ color:"#818cf8", fontSize:12, fontWeight:600 }}>{item.cmd}</span>
                  <span style={{ color:"rgba(255,255,255,.3)", fontSize:11 }}>{item.desc}</span>
                </div>
              ))}
            </div>
            <p style={{ color:"rgba(255,255,255,.15)", fontSize:11, marginTop:10 }}>
              Keyboard: A/B/C/D to select · Enter to confirm · Space to activate mic
            </p>
          </div>
        )}

        {/* Manual mic button (touch backup) */}
        {(phase === PHASE.LISTENING || phase === PHASE.CONFIRM || phase === PHASE.NEXT_WAIT) && !isSpeaking && (
          <button
            onClick={startListeningForCommand}
            style={{
              position:"fixed", bottom:32, right:32,
              width:64, height:64, borderRadius:"50%",
              background: isListening ? "#ef4444" : "linear-gradient(135deg,#4f46e5,#7c3aed)",
              border:"none", cursor:"pointer", fontSize:28, color:"white",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 4px 20px rgba(99,102,241,.5)",
              animation: isListening ? "glow-pulse 1.5s ease-in-out infinite" : "none",
            }}
            title="Tap to speak (backup)"
          >
            {isListening ? "🔴" : "🎙️"}
          </button>
        )}
      </div>
    </div>
  );
};

export default BlindAccessibleExam;