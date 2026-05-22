import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../Api/axios";
import UserLayout from "../UserLayout";
import { useTranslation } from "react-i18next";

const ExamPage = () => {
  const { t }       = useTranslation();
  const { examId }  = useParams();
  const navigate    = useNavigate();
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    api.get(`/user/subjects?examId=${examId}`).then(res => setSubjects(res.data));
  }, [examId]);

  return (
    <UserLayout>
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .ep2-eyebrow {
            display: inline-flex; align-items: center; gap: 6px;
            font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
            color: #8b5cf6; background: rgba(139,92,246,.09);
            border: 1px solid rgba(139,92,246,.18); border-radius: 20px;
            padding: 4px 12px; margin-bottom: 10px;
          }
          .ep2-eyebrow::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: #8b5cf6; }

          .ep2-title {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 26px; font-weight: 900; letter-spacing: -.03em;
            color: #1e1b4b; margin-bottom: 4px; animation: fadeUp .4s ease both;
          }
          .ep2-sub {
            font-size: 14px; color: rgba(139,92,246,.5); font-weight: 400;
            margin-bottom: 26px; animation: fadeUp .4s ease .05s both;
          }

          .ep2-empty {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 14px; color: rgba(139,92,246,.5); padding: 44px;
            text-align: center;
            background: rgba(255,255,255,.6); backdrop-filter: blur(16px);
            border: 1.5px dashed rgba(139,92,246,.2); border-radius: 18px;
          }

          .ep2-grid {
            display: grid; grid-template-columns: repeat(1, 1fr); gap: 12px;
          }
          @media(min-width: 640px) { .ep2-grid { grid-template-columns: repeat(2, 1fr); } }

          /* subject row card */
          .ep2-card {
            font-family: 'Plus Jakarta Sans', sans-serif;
            position: relative; overflow: hidden;
            background: rgba(255,255,255,.82);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border: 1.5px solid rgba(139,92,246,.13);
            border-radius: 16px; padding: 15px 18px;
            cursor: pointer; display: flex; align-items: center; gap: 13px;
            transition: all .22s cubic-bezier(.4,0,.2,1);
            box-shadow: 0 2px 12px rgba(139,92,246,.07), inset 0 1px 0 rgba(255,255,255,.9);
            animation: fadeUp .4s ease both;
          }
          .ep2-card:hover {
            transform: translateY(-3px) translateX(3px);
            border-color: rgba(139,92,246,.35);
            box-shadow: 0 8px 30px rgba(139,92,246,.18), inset 0 1px 0 rgba(255,255,255,.95);
          }

          /* left accent */
          .ep2-accent {
            position: absolute; left: 0; top: 20%; bottom: 20%; width: 3px;
            border-radius: 0 4px 4px 0;
            background: linear-gradient(135deg, #7c3aed, #a855f7);
            transform: scaleY(0); transform-origin: center; transition: transform .25s;
          }
          .ep2-card:hover .ep2-accent { transform: scaleY(1); }

          .ep2-icon {
            font-size: 20px; width: 42px; height: 42px; flex-shrink: 0;
            border-radius: 12px;
            background: rgba(139,92,246,.1);
            border: 1.5px solid rgba(139,92,246,.18);
            display: flex; align-items: center; justify-content: center;
            transition: transform .2s;
          }
          .ep2-card:hover .ep2-icon { transform: scale(1.1) rotate(-5deg); }
          .ep2-name { flex: 1; font-size: 14.5px; font-weight: 700; color: #1e1b4b; }
          .ep2-arr {
            font-size: 20px; color: rgba(139,92,246,.4);
            transition: transform .2s, color .2s;
          }
          .ep2-card:hover .ep2-arr { transform: translateX(4px); color: #8b5cf6; }
        `}</style>

        <div className="ep2-eyebrow">Exam</div>
        <h2 className="ep2-title">{t("exam.subjects", "Subjects")}</h2>
        <p className="ep2-sub">Select a subject to explore its topics</p>

        {subjects.length === 0 && (
          <p className="ep2-empty">{t("exam.noSubjects", "No subjects found")}</p>
        )}

        <div className="ep2-grid">
          {subjects.map((s, i) => (
            <div
              key={s.id}
              onClick={() => navigate(`/subject/${s.id}`)}
              className="ep2-card"
              style={{ animationDelay: `${i * .07}s` }}
            >
              <div className="ep2-accent" />
              <div className="ep2-icon">📚</div>
              <span className="ep2-name">{s.name}</span>
              <span className="ep2-arr">›</span>
            </div>
          ))}
        </div>
      </>
    </UserLayout>
  );
};

export default ExamPage;
