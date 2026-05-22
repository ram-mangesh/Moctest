import React, { useEffect, useRef, useState } from "react";
import TestHeader from "./TestHeader";
import QuestionPanel from "./QuestionPanel";
import QuestionPalette from "./QuestionPalette";
import FooterControls from "./FooterControls";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../Api/axios";
import useAntiCheat from "../hooks/useAntiCheat";
import useFaceProctoring from "../hooks/useFaceProctoring";
import { enterFullscreen } from "../utils/fullscreen";
import { useTranslation } from "react-i18next";
import ScratchPad from "./ScratchPad";
import { trackAttempt } from "./trackAttempt";
import useRealtimeAnalytics from "./useRealtimeAnalytics";
import NudgeToast from "./Nudgetoast ";
import SplitScreenDetector from "../hooks/SplitScreenDetector";

const MAX_VIOLATIONS = 3;

function calculateCorrect(questions, answers) {
  let correct = 0;
  questions.forEach((q) => {
    const ans = answers[q.id];
    if (ans && ans.selected === q.correct) correct++;
  });
  return correct;
}

/**
 * sessionId strategy:
 * - SOLO/GROUP: use Date.now() as a unique session ID per test run
 *   This fixes the bug where topicId was reused across multiple attempts
 *   of the same topic, mixing up behavioral data.
 * - REAL: use res.data.sessionId from backend (already unique)
 *
 * After SOLO submit, store { attemptId → sessionId } in localStorage
 * so SettingsPage can look up the correct sessionId for each attempt.
 */

const SESSION_MAP_KEY = "ep_session_map"; // localStorage key

export const getSessionIdForAttempt = (attemptId) => {
  try {
    const map = JSON.parse(localStorage.getItem(SESSION_MAP_KEY) || "{}");
    return map[String(attemptId)] ?? null;
  } catch { return null; }
};

const saveSessionMapping = (attemptId, sessionId) => {
  try {
    const map = JSON.parse(localStorage.getItem(SESSION_MAP_KEY) || "{}");
    map[String(attemptId)] = sessionId;
    // keep only last 50 entries to avoid bloat
    const keys = Object.keys(map);
    if (keys.length > 50) delete map[keys[0]];
    localStorage.setItem(SESSION_MAP_KEY, JSON.stringify(map));
  } catch { /* non-critical */ }
};

const MockTestPage = ({ mode = "SOLO", groupExamId = null }) => {
  const { t }        = useTranslation();
  const location     = useLocation();
  const navigate     = useNavigate();
  const { topicId, examId } = useParams();

  const [questions,  setQuestions]  = useState([]);
  const [currentQ,   setCurrentQ]   = useState(0);
  const [answers,    setAnswers]     = useState({});
  const [examName,   setExamName]    = useState("Mock Test");
  const [duration,   setDuration]    = useState(0);
  const [review,     setReview]      = useState(new Set());
  const [violations, setViolations]  = useState(0);
  const [sessionId,  setSessionId]   = useState(null);

  // ref ensures trackAttempt always has current sessionId even before re-render
  const sessionIdRef = useRef(null);

  const setSession = (id) => {
    sessionIdRef.current = id;
    setSessionId(id);
  };

  const submitted = useRef(false);

  const { analytics, triggerAnalysis } = useRealtimeAnalytics(sessionId);

  /* ── SUBMIT ── */
  const handleSubmit = async () => {
    if (submitted.current) return;
    submitted.current = true;

    try {
      if (mode === "REAL") {
        const res = await api.post(
          `/real-exam/submit/${sessionIdRef.current}`, answers
        );
        navigate("/result", { state: res.data });
        return;
      }

      if (mode === "GROUP") {
        const score     = calculateCorrect(questions, answers);
        const attempted = Object.keys(answers).length;
        await api.post(`/group-exam/${groupExamId}/submit`, {
          score, attempted, timeTaken: duration,
        });
        navigate(`/group-exams/${groupExamId}/leaderboard`);
        return;
      }

      // SOLO — save attemptId → sessionId mapping after submit
      const res = await api.post(
        `/user/test/submit?topicId=${topicId}`, { answers }
      );
      // Store mapping so SettingsPage can find behavioral data for this attempt
      if (res.data?.attemptId && sessionIdRef.current) {
        saveSessionMapping(res.data.attemptId, sessionIdRef.current);
      }
      navigate("/result", { state: res.data });

    } catch (err) {
      console.error("Submit error", err);
      submitted.current = false;
    }
  };

  /* ── ANTI-CHEAT ── */
  const registerViolation = (reason) => {
    const safeReason = reason || t("mock.genericViolation");
    setViolations((v) => {
      const next = v + 1;
      if (next >= MAX_VIOLATIONS) {
        alert(t("mock.autosubmit"));
        handleSubmit();
        return next;
      }
      alert(`${t("mock.warning")} ${next}/${MAX_VIOLATIONS}: ${safeReason}`);
      return next;
    });
  };

  useAntiCheat({ onViolation: registerViolation });
  const { videoRef } = useFaceProctoring({ onViolation: registerViolation });

  useEffect(() => { enterFullscreen(); }, []);

  /* ── LOAD QUESTIONS ── */
  useEffect(() => {
    const loadQuestions = async () => {
      if (mode === "REAL") {
        try {
          const res = await api.post("/real-exam/start", {
            examId:   Number(examId),
            duration: location.state?.duration || 1800,
          });
          setQuestions(res.data.questions);
          setDuration(
            Math.floor((new Date(res.data.endTime).getTime() - Date.now()) / 1000)
          );
          // REAL exam: backend sessionId is already unique
          setSession(res.data.sessionId);
          return;
        } catch (err) {
          if (err.response?.status === 410) {
            alert("All questions exhausted for this exam");
            navigate("/real-exams");
            return;
          }
          throw err;
        }
      }

      if (mode === "GROUP") {
        const g   = await api.get(`/group-exam/${groupExamId}`);
        const tid = g.data.topicId;
        setExamName("Group Exam");
        const res = await api.get(`/user/questions?topicId=${tid}`);
        setQuestions(res.data);
        setDuration(res.data.length * 60);
        // Unique sessionId per group test run
        setSession(Date.now());
        return;
      }

      // SOLO — unique sessionId per test run using timestamp
      const res = await api.get(`/user/questions?topicId=${topicId}`);
      setQuestions(res.data);
      setDuration(res.data.length * 60);
      // FIXED: was Number(topicId) — caused data mixing across attempts of same topic
      setSession(Date.now());
    };

    loadQuestions();
  }, [topicId, groupExamId, mode, examId]);

  /* ── ANSWER CHANGE → trackAttempt ── */
  const handleAnswerChange = (questionId, payload, timeSpent, optionChanges) => {
    setAnswers((prev) => ({ ...prev, [questionId]: payload }));

    const sid = sessionIdRef.current;
    if (!sid) return;

    trackAttempt(
      {
        sessionId:      sid,
        questionId:     questionId,
        timeSpent:      timeSpent     || 0,
        optionChanges:  optionChanges || 0,
        revisits:       0,
        answeredCorrect: false,
        timestamp:      Date.now(),
      },
      triggerAnalysis
    );
  };

  if (questions.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <video
        ref={videoRef}
        autoPlay muted playsInline
        className="fixed top-4 right-4 w-32 h-24 bg-black border z-50"
      />
      <div className="fixed top-32 right-4 bg-red-100 text-red-700 p-2 rounded z-50 text-sm">
        {t("mock.violations")}: {violations} / {MAX_VIOLATIONS}
      </div>

      <NudgeToast nudges={analytics?.nudges} />

{/* Split screen / Edge Copilot detector */}
<SplitScreenDetector
  onViolation={registerViolation}
  onSplitActive={(active) => {
    console.log("Split screen active:", active);
  }}
/>

      <TestHeader
        examName={t(examName)}
        duration={duration}
        onTimeUp={handleSubmit}
        analytics={analytics}
      />

      <div className="flex flex-1 p-4 gap-4 overflow-hidden">
        <QuestionPanel
          question={questions[currentQ]}
          index={currentQ}
          answers={answers}
          setAnswers={setAnswers}
          onAnswerChange={handleAnswerChange}
        />
        <ScratchPad />
        <QuestionPalette
          questions={questions}
          currentQ={currentQ}
          setCurrentQ={setCurrentQ}
          answers={answers}
          review={review}
        />
      </div>

      <FooterControls
        currentQ={currentQ}
        total={questions.length}
        setCurrentQ={setCurrentQ}
        review={review}
        setReview={setReview}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default MockTestPage;