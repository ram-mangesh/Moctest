import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../Api/axios";
import UserLayout from "../UserLayout";

const TestPage = () => {
  const { topicId }  = useParams();
  const navigate     = useNavigate();
  const location     = useLocation();
  const difficulty   = location.state?.difficulty || null;  // e.g. "EASY" | "MEDIUM" | "DIFFICULT"
  const [questions, setQuestions] = useState([]);
  const [index, setIndex]         = useState(0);
  const [score, setScore]         = useState(0);
  const [selected, setSelected]   = useState(null);

  useEffect(() => {
    const url = difficulty
      ? `/user/questions?topicId=${topicId}&difficulty=${difficulty}`
      : `/user/questions?topicId=${topicId}`;
    api.get(url).then(res => setQuestions(res.data));
  }, [topicId, difficulty]);

  const answer = (i) => {
    if (selected !== null) return;
    setSelected(i);
    const correct  = questions[index].correct;
    const newScore = i === correct ? score + 1 : score;
    setTimeout(() => {
      setSelected(null);
      if (index + 1 < questions.length) {
        setIndex(index + 1);
        setScore(newScore);
      } else {
        navigate("/result", { state: { score: newScore, total: questions.length } });
      }
    }, 900);
  };

  if (!questions.length) return null;

  const progress = ((index + 1) / questions.length) * 100;
  const LETTERS  = ["A", "B", "C", "D", "E"];

  return (
    <UserLayout>
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

          @keyframes tst2In {
            from { opacity: 0; transform: scale(.97) translateY(8px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          /* progress header */
          .tst2-hdr {
            display: flex; align-items: center; gap: 14px; margin-bottom: 24px;
            animation: fadeUp .3s ease both;
          }
          .tst2-qnum {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 12px; font-weight: 800; letter-spacing: .07em;
            text-transform: uppercase; color: rgba(99,102,241,.5); white-space: nowrap;
          }
          .tst2-track {
            flex: 1; height: 6px; border-radius: 6px;
            background: rgba(99,102,241,.1); overflow: hidden;
          }
          .tst2-fill {
            height: 100%; border-radius: 6px;
            background: linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4);
            transition: width .5s cubic-bezier(.4,0,.2,1);
          }
          .tst2-pct {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 12px; font-weight: 800; color: #6366f1; white-space: nowrap;
          }

          /* question card */
          .tst2-card {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: rgba(255,255,255,.85);
            backdrop-filter: blur(24px) saturate(180%);
            -webkit-backdrop-filter: blur(24px) saturate(180%);
            border: 1.5px solid rgba(99,102,241,.13);
            border-radius: 22px; padding: 28px;
            display: flex; flex-direction: column; gap: 22px;
            box-shadow: 0 6px 32px rgba(99,102,241,.1), inset 0 1px 0 rgba(255,255,255,.95);
            animation: tst2In .35s cubic-bezier(.34,1.56,.64,1);
          }

          /* question label */
          .tst2-qlbl {
            font-size: 11.5px; font-weight: 700; letter-spacing: .07em;
            text-transform: uppercase; color: #6366f1;
            display: flex; align-items: center; gap: 8px;
          }
          .tst2-qlbl-dot {
            width: 7px; height: 7px; border-radius: 50%;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
          }

          /* question text */
          .tst2-question {
            font-size: 17px; font-weight: 600; line-height: 1.65;
            color: #1e1b4b; letter-spacing: -.01em;
          }

          /* options */
          .tst2-opts { display: flex; flex-direction: column; gap: 10px; }

          .tst2-opt {
            font-family: 'Plus Jakarta Sans', sans-serif;
            display: flex; align-items: center; gap: 13px; width: 100%;
            padding: 13px 16px;
            border: 1.5px solid rgba(99,102,241,.12);
            border-radius: 14px;
            background: rgba(238,240,255,.45);
            cursor: pointer; text-align: left;
            font-size: 14px; font-weight: 500; color: #3730a3;
            transition: all .2s;
          }
          .tst2-opt:hover:not(:disabled) {
            background: rgba(99,102,241,.08);
            border-color: rgba(99,102,241,.35);
            transform: translateX(5px);
            box-shadow: 0 4px 18px rgba(99,102,241,.12);
            color: #1e1b4b;
          }

          /* feedback */
          .tst2-opt.correct {
            background: rgba(5,150,105,.08) !important;
            border-color: rgba(5,150,105,.35) !important;
            color: #059669 !important;
            transform: translateX(5px);
          }
          .tst2-opt.wrong {
            background: rgba(220,38,38,.07) !important;
            border-color: rgba(220,38,38,.3) !important;
            color: #dc2626 !important;
          }

          .tst2-letter {
            width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
            background: rgba(99,102,241,.1); color: #6366f1;
            font-size: 12px; font-weight: 900;
            display: flex; align-items: center; justify-content: center;
            transition: all .2s;
          }
          .tst2-opt:hover:not(:disabled) .tst2-letter {
            background: rgba(99,102,241,.2); transform: scale(1.1);
          }
        `}</style>

        {/* Progress header */}
        <div className="tst2-hdr">
          <span className="tst2-qnum">Q {index + 1} / {questions.length}</span>
          <div className="tst2-track">
            <div className="tst2-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="tst2-pct">{Math.round(progress)}%</span>
        </div>

        <div className="tst2-card" key={index}>
          <div className="tst2-qlbl">
            <span className="tst2-qlbl-dot" />
            Question {index + 1}
            {difficulty && (
              <span style={{
                marginLeft:8, fontSize:10, fontWeight:800,
                padding:"2px 8px", borderRadius:20,
                background: difficulty==="EASY"?"#dcfce7":difficulty==="DIFFICULT"?"#fee2e2":"#fef9c3",
                color: difficulty==="EASY"?"#16a34a":difficulty==="DIFFICULT"?"#dc2626":"#ca8a04"
              }}>
                {difficulty==="EASY"?"🟢 Easy":difficulty==="DIFFICULT"?"🔴 Difficult":"🟡 Medium"}
              </span>
            )}
          </div>

          <p className="tst2-question">{questions[index].question}</p>

          <div className="tst2-opts">
            {questions[index].options.map((opt, i) => {
              let cls = "";
              if (selected !== null) {
                if (i === questions[index].correct) cls = " correct";
                else if (i === selected)            cls = " wrong";
              }
              return (
                <button
                  key={i}
                  onClick={() => answer(i)}
                  className={`tst2-opt${cls}`}
                  disabled={selected !== null}
                >
                  <span className="tst2-letter">{LETTERS[i]}</span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </>
    </UserLayout>
  );
};

export default TestPage;
