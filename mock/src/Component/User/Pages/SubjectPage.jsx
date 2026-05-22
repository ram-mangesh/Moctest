import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../Api/axios";
import UserLayout from "../UserLayout";
import SubjectCard from "../Component/SubjectCard";
import { useTranslation } from "react-i18next";

const SubjectPage = () => {
  const { t }       = useTranslation();
  const { examId }  = useParams();
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (!examId) return;
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

          .sp2-eyebrow {
            display: inline-flex; align-items: center; gap: 6px;
            font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
            color: #8b5cf6; background: rgba(139,92,246,.09);
            border: 1px solid rgba(139,92,246,.18); border-radius: 20px;
            padding: 4px 12px; margin-bottom: 10px;
          }
          .sp2-eyebrow::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: #8b5cf6; }

          .sp2-title {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 26px; font-weight: 900; letter-spacing: -.03em;
            color: #1e1b4b; margin-bottom: 4px; animation: fadeUp .4s ease both;
          }
          .sp2-sub {
            font-size: 14px; color: rgba(139,92,246,.5); font-weight: 400;
            margin-bottom: 26px; animation: fadeUp .4s ease .05s both;
          }

          .sp2-empty {
            font-size: 14px; color: rgba(139,92,246,.5); padding: 44px;
            text-align: center;
            background: rgba(255,255,255,.6); backdrop-filter: blur(16px);
            border: 1.5px dashed rgba(139,92,246,.2); border-radius: 18px;
          }

          .sp2-grid {
            display: grid; grid-template-columns: repeat(1, 1fr); gap: 14px;
          }
          @media(min-width: 640px) { .sp2-grid { grid-template-columns: repeat(2, 1fr); } }

          .sp2-item { animation: fadeUp .4s ease both; }
        `}</style>

        <div className="sp2-eyebrow">Subjects</div>
        <h2 className="sp2-title">{t("exam.subjects", "Subjects")}</h2>
        <p className="sp2-sub">Choose a subject to start practising</p>

        {subjects.length === 0 && (
          <p className="sp2-empty">{t("exam.noSubjects", "No subjects found")}</p>
        )}

        <div className="sp2-grid">
          {subjects.map((s, i) => (
            <div key={s.id} className="sp2-item" style={{ animationDelay: `${i * .07}s` }}>
              <SubjectCard subject={s} />
            </div>
          ))}
        </div>
      </>
    </UserLayout>
  );
};

export default SubjectPage;
