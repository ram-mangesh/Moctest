import { useNavigate } from "react-router-dom";
import { Layers, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const SubjectCard = ({ subject }) => {
  const navigate = useNavigate();
  const { t }    = useTranslation();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        .sc2-card {
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative; overflow: hidden;
          background: rgba(255,255,255,.82);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1.5px solid rgba(168,85,247,.13);
          border-radius: 20px; padding: 20px; cursor: pointer;
          display: flex; flex-direction: column; gap: 16px;
          transition: all .25s cubic-bezier(.4,0,.2,1);
          box-shadow: 0 2px 16px rgba(168,85,247,.07), inset 0 1px 0 rgba(255,255,255,.9);
          animation: sc2In .4s ease both;
        }
        @keyframes sc2In { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .sc2-card:hover {
          transform: translateY(-5px);
          border-color: rgba(168,85,247,.32);
          box-shadow: 0 12px 40px rgba(168,85,247,.18), inset 0 1px 0 rgba(255,255,255,.95);
        }

        .sc2-bar {
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #7c3aed, #a855f7, #ec4899);
          transform: scaleX(0); transform-origin: left; transition: transform .3s;
          border-radius: 20px 20px 0 0;
        }
        .sc2-card:hover .sc2-bar { transform: scaleX(1); }

        .sc2-glow {
          position: absolute; inset: 0; border-radius: 20px; pointer-events: none;
          background: radial-gradient(circle at 30% 50%, rgba(168,85,247,.06), transparent 70%);
          opacity: 0; transition: opacity .3s;
        }
        .sc2-card:hover .sc2-glow { opacity: 1; }

        .sc2-top { display: flex; align-items: flex-start; gap: 13px; }
        .sc2-icon {
          width: 44px; height: 44px; border-radius: 13px; flex-shrink: 0;
          background: linear-gradient(135deg, rgba(168,85,247,.14), rgba(124,58,237,.1));
          border: 1.5px solid rgba(168,85,247,.2); color: #a855f7;
          display: flex; align-items: center; justify-content: center;
          transition: transform .25s;
        }
        .sc2-card:hover .sc2-icon { transform: scale(1.1) rotate(-5deg); box-shadow: 0 4px 18px rgba(168,85,247,.24); }
        .sc2-title { font-size: 15px; font-weight: 800; color: #1e1b4b; letter-spacing: -.015em; margin-bottom: 3px; }
        .sc2-sub { font-size: 12px; font-weight: 500; color: rgba(168,85,247,.5); }

        .sc2-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 12px; border-top: 1px solid rgba(168,85,247,.09);
        }
        .sc2-count { font-size: 11.5px; font-weight: 600; color: rgba(168,85,247,.5); }
        .sc2-arrow {
          width: 28px; height: 28px; border-radius: 9px;
          background: rgba(168,85,247,.08); color: rgba(168,85,247,.5);
          display: flex; align-items: center; justify-content: center; transition: all .2s;
        }
        .sc2-card:hover .sc2-arrow { background: rgba(168,85,247,.18); color: #a855f7; transform: translateX(3px); }
      `}</style>

      <div onClick={() => navigate(`/subject/${subject.id}`)} className="sc2-card">
        <div className="sc2-bar" />
        <div className="sc2-top">
          <div className="sc2-icon"><Layers size={18} /></div>
          <div style={{ flex: 1 }}>
            <h3 className="sc2-title">{subject.name}</h3>
            <p className="sc2-sub">{t("exam.topics", "Topics")}</p>
          </div>
        </div>
        <div className="sc2-footer">
          <span className="sc2-count">{subject.topicCount ?? "—"} {t("exam.topics", "topics")}</span>
          <span className="sc2-arrow"><ArrowRight size={15} /></span>
        </div>
        <div className="sc2-glow" />
      </div>
    </>
  );
};

export default SubjectCard;
