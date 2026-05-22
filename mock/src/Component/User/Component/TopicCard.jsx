import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import AccessibleExamButton from "../../MockTest/Accessibleexambutton";

const TopicCTA = ({ topic }) => {
  const navigate = useNavigate();
  const { t }    = useTranslation();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        .tc2-wrap {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: rgba(255,255,255,.82);
          backdrop-filter: blur(18px) saturate(160%);
          -webkit-backdrop-filter: blur(18px) saturate(160%);
          border: 1.5px solid rgba(16,185,129,.12);
          border-radius: 14px; padding: 13px 16px;
          display: flex; align-items: center; justify-content: space-between;
          transition: all .22s;
          box-shadow: 0 2px 12px rgba(16,185,129,.07), inset 0 1px 0 rgba(255,255,255,.9);
          animation: tc2In .35s ease both;
        }
        @keyframes tc2In { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .tc2-wrap:hover {
          border-color: rgba(16,185,129,.32);
          box-shadow: 0 6px 24px rgba(16,185,129,.16), inset 0 1px 0 rgba(255,255,255,.95);
          transform: translateY(-2px);
        }

        .tc2-title { font-size: 14px; font-weight: 700; color: #1e1b4b; margin-bottom: 3px; }
        .tc2-sub { font-size: 11.5px; font-weight: 500; color: rgba(16,185,129,.55); }

        .tc2-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 16px; border-radius: 11px;
          font-size: 12.5px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #fff;
          background: linear-gradient(135deg, #059669, #0d9488);
          border: none; cursor: pointer;
          box-shadow: 0 3px 14px rgba(5,150,105,.3);
          transition: all .22s; white-space: nowrap; flex-shrink: 0;
        }
        .tc2-btn:hover {
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 6px 22px rgba(5,150,105,.42);
        }
        .tc2-btn:active { transform: translateY(0) scale(.98); }
      `}</style>

      <div className="tc2-wrap">
        <div>
          <h3 className="tc2-title">{topic.name}</h3>
          <p className="tc2-sub">{topic.questionCount ?? "—"} {t("exam.questions", "questions")}</p>
        </div>
       <div style={{ display: "flex", gap: "8px" }}>
  {/* Normal Test */}
  <button 
    onClick={() => navigate(`/test/${topic.id}`)} 
    className="tc2-btn"
  >
    <Play size={13} />
    {t("common.start", "Start")}
  </button>

  {/* Accessible Exam */}
  <div onClick={(e) => e.stopPropagation()}>
    <AccessibleExamButton
      topicId={topic.id} 
      topicName={topic.name} 
    />
  </div>
</div>
      </div>
    </>
  );
};

export default TopicCTA;
