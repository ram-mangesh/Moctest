import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

const UserSidebar = ({ onClose }) => {
  const { t } = useTranslation();

  const items = [
    { to: "/home", emoji: "📋", label: t("sidebar.allExams", "All Exams"), color: "#2563eb" },
    { to: "/real-exams", emoji: "🏆", label: t("sidebar.realExams", "Real Exams"), color: "#dc2626" },
    { to: "/progress", emoji: "📈", label: t("sidebar.progress", "My Progress"), color: "#7c3aed" },
    { to: "/history", emoji: "📜", label: t("sidebar.history", "History"), color: "#0891b2" },
    { to: "/real-exam-ranking", emoji: "🥇", label: t("sidebar.Ranking", "Rankings"), color: "#d97706" },
    { to: "/group-exams", emoji: "👥", label: t("sidebar.groupExams", "Group Exams"), color: "#059669" },
    {
      to: "/game",
      emoji: "⚔️",
      label: "Quest Game",
      color: "#d97706"
    },{ 
  to: "/achievements", 
  emoji: "🏆", 
  label: "Achievements", 
  color: "#f59e0b" 
},
{ 
  to: "/review", 
  emoji: "🔁", 
  label: "Review Schedule", 
  color: "#059669" 
},
    { to: "/settings", emoji: "⚙️", label: "Settings & Analytics", color: "#2563eb" },
    { to: "/study-planner", emoji: "📅", label: "Study Planner", color: "#2563eb" },
    { to: "/adaptive-learning", emoji: "🧠", label: "Adaptive Learning", color: "#7c3aed" },
    { to: "/analytics", emoji: "📊", label: "Engagement Analytics", color: "#6366f1" },
    { to: "/wellbeing", emoji: "💚", label: "Wellbeing", color: "#10b981" },
    { to: "/google-fit", emoji: "⌚", label: "Google Fit Sync", color: "#0ea5e9" },
    { to: "/recommendations", emoji: "✨", label: "Recommendations", color: "#f59e0b" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        .usb-wrap {
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 0 0 24px;
          height: 100%;
          display: flex; flex-direction: column;
        }

        /* brand header */
        .usb-brand {
          display: flex; align-items: center; gap: 11px;
          padding: 18px 18px 14px;
          border-bottom: 1.5px solid rgba(37,99,235,.1);
          position: relative;
        }
        .usb-brand-icon {
          width: 34px; height: 34px; border-radius: 10px;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; color: #fff;
          box-shadow: 0 4px 12px rgba(37,99,235,.3);
          flex-shrink: 0;
        }
        .usb-brand-name {
          font-size: 14px; font-weight: 900; color: #0f172a; letter-spacing: -.03em;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .usb-brand-sub { font-size: 10.5px; color: rgba(37,99,235,.45); font-weight: 500; margin-top: 1px; }
        .usb-close-btn {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          width: 28px; height: 28px; border-radius: 8px;
          background: rgba(37,99,235,.08); border: none; cursor: pointer;
          font-size: 15px; color: rgba(37,99,235,.5); display: none;
          align-items: center; justify-content: center; transition: all .15s;
        }
        .usb-close-btn:hover { background: rgba(37,99,235,.15); color: #2563eb; }
        @media (max-width: 900px) { .usb-close-btn { display: flex; } }

        /* section label */
        .usb-section-lbl {
          font-size: 10px; font-weight: 800; letter-spacing: .13em;
          text-transform: uppercase; color: rgba(37,99,235,.38);
          padding: 14px 20px 5px;
        }

        /* nav link */
        .usb-link {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; margin: 1.5px 10px;
          border-radius: 12px; font-size: 13.5px; font-weight: 500;
          text-decoration: none; color: rgba(67,56,202,.65);
          border: 1.5px solid transparent;
          transition: all .18s; position: relative;
        }
        .usb-link:hover {
          background: rgba(238,240,255,.9);
          color: #0f172a; border-color: rgba(37,99,235,.14);
        }
        .usb-link.usb-active {
          background: rgba(37,99,235,.09);
          color: #1e40af; border-color: rgba(37,99,235,.22);
          font-weight: 700;
        }
        .usb-link.usb-active::before {
          content: ''; position: absolute; left: -10px;
          top: 20%; bottom: 20%; width: 3px;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          border-radius: 0 3px 3px 0;
        }
        .usb-icon-box {
          width: 28px; height: 28px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; flex-shrink: 0; transition: transform .2s;
        }
        .usb-link:hover .usb-icon-box { transform: scale(1.12); }

        /* progress card */
        .usb-prog-wrap {
          margin: 14px 12px 0;
          background: linear-gradient(135deg, rgba(238,240,255,.9), rgba(232,236,255,.9));
          border: 1.5px solid rgba(37,99,235,.14);
          border-radius: 16px; padding: 14px;
          backdrop-filter: blur(8px);
        }
        .usb-prog-label {
          font-size: 12px; font-weight: 700;
          color: #1e3a8a; margin-bottom: 9px;
        }
        .usb-prog-bar {
          height: 5px; background: rgba(37,99,235,.14);
          border-radius: 5px; overflow: hidden; margin-bottom: 7px;
        }
        .usb-prog-fill {
          height: 100%; border-radius: 5px;
          background: linear-gradient(90deg, #2563eb, #7c3aed);
          animation: progGrow .9s cubic-bezier(.4,0,.2,1);
        }
        @keyframes progGrow { from { width: 0 !important; } }
        .usb-prog-note { font-size: 11.5px; color: rgba(37,99,235,.5); font-weight: 500; }
      `}</style>

      <div className="usb-wrap">
        {/* Brand */}
        <div className="usb-brand">
          <div className="usb-brand-icon">📚</div>
          <div>
            <div className="usb-brand-name">ExamPrep</div>
            <div className="usb-brand-sub">Student Portal</div>
          </div>
          <button className="usb-close-btn" onClick={onClose} aria-label="Close sidebar">×</button>
        </div>

        {/* Nav */}
        <div className="usb-section-lbl">Navigation</div>
        <nav style={{ flex: 1, overflowY: "auto" }}>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `usb-link${isActive ? " usb-active" : ""}`}
              onClick={onClose}
            >
              <div className="usb-icon-box" style={{ background: item.color + "18" }}>
                {item.emoji}
              </div>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ height: 1, background: "rgba(37,99,235,.1)", margin: "10px 14px" }} />

        {/* Progress */}
        <div className="usb-prog-wrap">
          <div className="usb-prog-label">📊 {t("sidebar.overallProgress", "Overall Progress")}</div>
          <div className="usb-prog-bar">
            <div className="usb-prog-fill" style={{ width: "40%" }} />
          </div>
          <div className="usb-prog-note">
            {t("sidebar.syllabusCompleted", { percent: 40 }) || "40% of syllabus completed"}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserSidebar;
