import React, { useState, useEffect, useRef } from "react";
import ExamManager from "./ExamManager";
import SubjectManager from "./SubjectManager";
import TopicManager from "./TopicManager";
import QuestionManager from "./QuestionManager";
import TeacherAiGenerator from "./TeacherAiGenerator";
import TeacherAnnotationPanel from "./TeacherAnnotationPanel";
import StudentInsights from "./StudentInsights";
import PlatformOverview from "./PlatformOverview";
import DifficultyAnalyzer from "./DifficultyAnalyzer";
import NotificationManager from "./NotificationManager";
import AdminWellbeingMonitor from "./AdminWellbeingMonitor";
import { Sidebar } from "./Sidebar";
import { injectGlobalStyles } from "./injectGlobalStyles";

/* ── Floating particle background ── */
function ParticleScene() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const pts = Array.from({ length: 20 }).map(() => {
      const p = document.createElement("div");
      const sz = Math.random() * 3.5 + 1;
      Object.assign(p.style, {
        position: "absolute",
        width: `${sz}px`, height: `${sz}px`,
        borderRadius: "50%",
        background: `rgba(99,102,241,${(Math.random() * 0.3 + 0.08).toFixed(2)})`,
        left: `${Math.random() * 100}%`,
        bottom: 0,
        animationName: "ptRise",
        animationDuration: `${Math.random() * 14 + 10}s`,
        animationDelay: `${Math.random() * 12}s`,
        animationTimingFunction: "linear",
        animationIterationCount: "infinite",
        pointerEvents: "none",
      });
      el.appendChild(p);
      return p;
    });
    return () => pts.forEach(p => p.remove());
  }, []);

  return (
    <div ref={ref} style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden",
      background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 30%, #f0fdfa 60%, #f8fafc 100%)",
    }}>
      {/* Subtle grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(37,99,235,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,.02) 1px,transparent 1px)",
        backgroundSize: "60px 60px",
      }} />
      {/* Orbs - Professional Blue & Teal */}
      <div style={{ position: "absolute", width: 520, height: 520, top: -160, left: -80, borderRadius: "50%", background: "radial-gradient(circle,rgba(37,99,235,.08) 0%,transparent 70%)", filter: "blur(80px)", animation: "orb1 18s ease-in-out infinite alternate" }} />
      <div style={{ position: "absolute", width: 420, height: 420, top: "20%", right: -60, borderRadius: "50%", background: "radial-gradient(circle,rgba(13,148,136,.06) 0%,transparent 70%)", filter: "blur(80px)", animation: "orb2 22s ease-in-out infinite alternate" }} />
      <div style={{ position: "absolute", width: 360, height: 360, bottom: -60, left: "35%", borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,.04) 0%,transparent 70%)", filter: "blur(80px)", animation: "orb3 26s ease-in-out infinite alternate" }} />
      <div style={{ position: "absolute", width: 280, height: 280, top: "55%", left: "18%", borderRadius: "50%", background: "radial-gradient(circle,rgba(37,99,235,.05) 0%,transparent 70%)", filter: "blur(70px)", animation: "orb2 20s ease-in-out infinite alternate 5s" }} />
    </div>
  );
}

const TABS = [
  { id: "exam",        icon: "📋", label: "Exam Manager",     color: "#2563eb", rgb: "37,99,235"   },
  { id: "subject",     icon: "📚", label: "Subject Manager",  color: "#7c3aed", rgb: "124,58,237"  },
  { id: "topic",       icon: "🏷️",  label: "Topic Manager",    color: "#0d9488", rgb: "13,148,136"  },
  { id: "question",    icon: "❓", label: "Question Manager", color: "#d97706", rgb: "217,119,6"   },
  { id: "ai",          icon: "🤖", label: "AI Generator",     color: "#059669", rgb: "5,150,105"   },
  { id: "annotations", icon: "✏️", label: "Annotations",      color: "#0891b2", rgb: "8,145,178"   },
  { id: "students",    icon: "👨‍🎓", label: "Student Insights", color: "#dc2626", rgb: "220,38,38"   },
  { id: "overview",    icon: "📊", label: "Platform Overview", color: "#6366f1", rgb: "99,102,241"  },
  { id: "difficulty",  icon: "🎯", label: "Difficulty Analyzer",color: "#ea580c", rgb: "234,88,12"   },
  { id: "notifications",icon: "🔔", label: "Alert Center",     color: "#8b5cf6", rgb: "139,92,246"  },
  { id: "wellbeing",   icon: "⌚", label: "Wellbeing Monitor",color: "#10b981", rgb: "16,185,129"  },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sideOpen, setSideOpen] = useState(false);
  const [contentKey, setContentKey] = useState(0);

  useEffect(() => { injectGlobalStyles(); }, []);

  const switchTab = (id) => {
    setActiveTab(id);
    setContentKey(k => k + 1);
    setSideOpen(false);
  };

  const active = TABS.find(t => t.id === activeTab);

  return (
    <div style={{ minHeight: "100vh", position: "relative", fontFamily: "'Plus Jakarta Sans','Sora',sans-serif" }}>
      <ParticleScene />
      <div className={`ep-mob-overlay${sideOpen ? " show" : ""}`} onClick={() => setSideOpen(false)} />

      {/* Sidebar — receives setSideOpen so it can control the hamburger state in navbar */}
      <Sidebar
        open={sideOpen}
        activeTab={activeTab}
        setTab={switchTab}
        onClose={() => setSideOpen(false)}
        onHamburger={() => setSideOpen(s => !s)}
      />

      <div className="lgt-content" style={{ position: "relative", zIndex: 1 }}>
        {/* Content only — no separate page header or tab pills */}
        <main
          key={contentKey}
          style={{ padding: "28px", animation: "mainEnter .45s ease both" }}
        >
          <div style={{ animation: "cardIn .45s cubic-bezier(.34,1.56,.64,1) both", maxWidth: 1100, margin: "0 auto" }}>
            {activeTab === "exam"        && <ExamManager />}
            {activeTab === "subject"     && <SubjectManager />}
            {activeTab === "topic"       && <TopicManager />}
            {activeTab === "question"    && <QuestionManager />}
            {activeTab === "ai"          && <TeacherAiGenerator />}
            {activeTab === "annotations" && <TeacherAnnotationPanel />}
            {activeTab === "students"    && <StudentInsights />}
            {activeTab === "overview"    && <PlatformOverview />}
            {activeTab === "difficulty"  && <DifficultyAnalyzer />}
            {activeTab === "notifications"&& <NotificationManager />}
            {activeTab === "wellbeing"    && <AdminWellbeingMonitor />}
          </div>
        </main>
      </div>

      <style>{`
        @keyframes ptRise  { 0%{transform:translateY(0);opacity:.5} 100%{transform:translateY(-100vh);opacity:0} }
        @keyframes orb1    { 0%{transform:translate(0,0)} 100%{transform:translate(50px,70px)} }
        @keyframes orb2    { 0%{transform:translate(0,0)} 100%{transform:translate(-40px,50px)} }
        @keyframes orb3    { 0%{transform:translate(0,0)} 100%{transform:translate(30px,-40px)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cardIn  { from{opacity:0;transform:scale(.97) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes mainEnter { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideRight { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideDown  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }

        .ep-mob-overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(99,102,241,.15); backdrop-filter: blur(4px);
          z-index: 198; transition: opacity .3s;
        }
        @media(max-width:900px) {
          .ep-mob-overlay { display: block; opacity: 0; pointer-events: none; }
          .ep-mob-overlay.show { opacity: 1; pointer-events: all; }
          .lgt-content > main { padding: 18px 16px !important; }
        }
        @media(max-width:600px) {
          .lgt-content > main { padding: 14px 12px !important; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;