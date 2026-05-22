import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import AiHintWhisperer from "../Aichatboat/AiHintWhisperer";

/**
 * QuestionPanel — supports MCQ, MULTI, NAQ
 *
 * Task 1 fix: tracks timeSpent and optionChanges per question,
 * passes them to onAnswerChange so MockTest can call trackAttempt.
 */
const QuestionPanel = ({
  question,
  index,
  answers,
  setAnswers,
  onAnswerChange, // Task 1: new prop from MockTest
}) => {
  const { t } = useTranslation();

  const startTimeRef = useRef(Date.now());
  const optionChangesRef = useRef(0);

const [liveTime, setLiveTime] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setLiveTime(getTimeSpent());
  }, 1000);

  return () => clearInterval(interval);
}, [question?.id]);

  // Reset tracking when question changes
  useEffect(() => {
    startTimeRef.current = Date.now();
    optionChangesRef.current = 0;
  }, [question?.id]);

  const getTimeSpent = () =>
    Math.floor((Date.now() - startTimeRef.current) / 1000);

  /* ── MCQ ── */
  const handleMcq = (opt) => {
    if (answers[question.id]?.selected !== undefined) {
      optionChangesRef.current += 1;
    }
    const payload = { selected: opt };

    // update local state
    setAnswers((prev) => ({ ...prev, [question.id]: payload }));

    // Task 1: notify MockTest for WebSocket tracking
    onAnswerChange?.(
      question.id,
      payload,
      getTimeSpent(),
      optionChangesRef.current
    );
  };

  /* ── MULTI ── */
  const handleMulti = (opt) => {
    const existing = answers[question.id]?.selectedMultiple || [];
    const updated = existing.includes(opt)
      ? existing.filter((x) => x !== opt)
      : [...existing, opt];

    const payload = { selectedMultiple: updated };
    setAnswers((prev) => ({ ...prev, [question.id]: payload }));

    onAnswerChange?.(
      question.id,
      payload,
      getTimeSpent(),
      optionChangesRef.current
    );
  };

  /* ── NAQ ── */
  const handleNumeric = (val) => {
    const payload = { selectedNumeric: Number(val) };
    setAnswers((prev) => ({ ...prev, [question.id]: payload }));

    onAnswerChange?.(
      question.id,
      payload,
      getTimeSpent(),
      optionChangesRef.current
    );
  };

  if (!question) return null;

  return (
    <div className="flex-1 bg-white p-6 rounded shadow overflow-y-auto">
      {/* Question text */}
      <h3 className="font-semibold mb-4">
        {t("mock.question")} {index + 1}. {question.question}
      </h3>

      {/* Difficulty badge */}
      <p className="text-sm text-gray-500 mb-3">
        Difficulty: {question.difficulty}
      </p>

      {/* MCQ */}
      {question.type === "MCQ" &&
        question.options?.map((opt) => (
          <button
            key={opt}
            onClick={() => handleMcq(opt)}
            className={`block w-full text-left p-3 rounded mb-2 transition ${
              answers[question.id]?.selected === opt
                ? "bg-blue-200 border border-blue-400"
                : "bg-gray-100 hover:bg-gray-200 border border-transparent"
            }`}
          >
            {opt}
          </button>
        ))}

      {/* MULTI */}
      {question.type === "MULTI" &&
        question.options?.map((opt) => (
          <label
            key={opt}
            className={`flex items-center gap-2 p-3 rounded mb-2 cursor-pointer transition ${
              answers[question.id]?.selectedMultiple?.includes(opt)
                ? "bg-blue-100 border border-blue-400"
                : "bg-gray-100 border border-transparent hover:bg-gray-200"
            }`}
          >
            <input
              type="checkbox"
              checked={
                answers[question.id]?.selectedMultiple?.includes(opt) || false
              }
              onChange={() => handleMulti(opt)}
              className="w-4 h-4"
            />
            {opt}
          </label>
        ))}

      {/* NAQ */}
      {question.type === "NAQ" && (
        <input
          type="number"
          step="any"
          className="border p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter numeric answer"
          value={answers[question.id]?.selectedNumeric ?? ""}
          onChange={(e) => handleNumeric(e.target.value)}
        />
      )}

<AiHintWhisperer
  questionId={question.id}
  timeSpent={liveTime}
  optionChanges={optionChangesRef.current}
/>
    </div>
  );
};

export default QuestionPanel;