import { ArrowRight, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const ExamCard = ({ exam, isRealExam = false }) => {
  const navigate = useNavigate();
  const { t }    = useTranslation();

  const handleClick = () => {
    navigate(isRealExam ? `/real-exam/${exam.id}` : `/exam/${exam.id}`);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        .ec2-card {
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative; overflow: hidden;
          background: rgba(255,255,255,.82);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1.5px solid rgba(99,102,241,.13);
          border-radius: 20px; padding: 20px; cursor: pointer;
          display: flex; flex-direction: column; gap: 16px;
          transition: all .25s cubic-bezier(.4,0,.2,1);
          box-shadow: 0 2px 16px rgba(99,102,241,.07), inset 0 1px 0 rgba(255,255,255,.9);
          animation: ec2In .4s ease both;
        }
        @keyframes ec2In { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

        .ec2-card:hover {
          transform: translateY(-5px);
          border-color: rgba(99,102,241,.32);
          box-shadow: 0 12px 40px rgba(99,102,241,.18), inset 0 1px 0 rgba(255,255,255,.95);
        }

        /* gradient top bar on hover */
        .ec2-bar {
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4);
          transform: scaleX(0); transform-origin: left; transition: transform .3s ease;
          border-radius: 20px 20px 0 0;
        }
        .ec2-card:hover .ec2-bar { transform: scaleX(1); }

        /* glow overlay */
        .ec2-glow {
          position: absolute; inset: 0; border-radius: 20px; pointer-events: none;
          background: radial-gradient(circle at 30% 50%, rgba(99,102,241,.06), transparent 70%);
          opacity: 0; transition: opacity .3s;
        }
        .ec2-card:hover .ec2-glow { opacity: 1; }

        .ec2-top { display: flex; align-items: flex-start; gap: 13px; }

        .ec2-icon {
          width: 44px; height: 44px; border-radius: 13px; flex-shrink: 0;
          background: linear-gradient(135deg, rgba(99,102,241,.14), rgba(139,92,246,.1));
          border: 1.5px solid rgba(99,102,241,.18); color: #6366f1;
          display: flex; align-items: center; justify-content: center;
          transition: transform .25s;
        }
        .ec2-card:hover .ec2-icon { transform: scale(1.1) rotate(-5deg); box-shadow: 0 4px 18px rgba(99,102,241,.22); }

        .ec2-title {
          font-size: 15px; font-weight: 800; color: #1e1b4b;
          letter-spacing: -.015em; margin-bottom: 3px;
        }
        .ec2-sub { font-size: 12px; font-weight: 500; color: rgba(99,102,241,.45); }

        .ec2-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 12px; border-top: 1px solid rgba(99,102,241,.09);
        }
        .ec2-count { font-size: 11.5px; font-weight: 600; color: rgba(99,102,241,.45); }

        .ec2-arrow {
          width: 28px; height: 28px; border-radius: 9px;
          background: rgba(99,102,241,.08); color: rgba(99,102,241,.5);
          display: flex; align-items: center; justify-content: center; transition: all .2s;
        }
        .ec2-card:hover .ec2-arrow {
          background: rgba(99,102,241,.18); color: #6366f1; transform: translateX(3px);
        }
      `}</style>

      <div onClick={handleClick} className="ec2-card">
        <div className="ec2-bar" />
        <div className="ec2-top">
          <div className="ec2-icon"><BookOpen size={18} /></div>
          <div style={{ flex: 1 }}>
            <h3 className="ec2-title">{exam.name}</h3>
            <p className="ec2-sub">
              {isRealExam ? t("exam.realExam", "Real Exam") : t("exam.startTest", "Start Test")}
            </p>
          </div>
        </div>
        <div className="ec2-footer">
          <span className="ec2-count">{exam.subjectCount || 0} {t("exam.subjects", "subjects")}</span>
          <span className="ec2-arrow"><ArrowRight size={15} /></span>
        </div>
        <div className="ec2-glow" />
      </div>
    </>
  );
};

export default ExamCard;
