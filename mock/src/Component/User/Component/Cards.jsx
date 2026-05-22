import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "../Toast";

export function ExamCard({ exam, isRealExam = false, index = 0 }) {
  const navigate = useNavigate();
  const colors = ["var(--accent)", "var(--cyan)", "var(--rose)", "var(--green)", "var(--violet)", "var(--amber)"];
  const color = colors[index % colors.length];
  const icons = ["📋", "🏆", "📚", "🎯", "⭐", "🔥"];
  const icon = icons[index % icons.length];

  return (
    <div
      onClick={() => { 
        toast(`Opening ${exam.name}`, "info"); 
        navigate(isRealExam ? `/real-exam/${exam.id}` : `/exam/${exam.id}`); 
      }}
      style={{
        background: "var(--surf)", border: "1.5px solid var(--border)", borderRadius: 20, padding: 22,
        cursor: "pointer", transition: "all .25s", animation: `fadeUp .4s ease ${index * 0.07}s both`,
        position: "relative", overflow: "hidden"
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--sh)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: color, opacity: .07 }} />
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, animation: "float 3s ease-in-out infinite" }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text)", marginBottom: 4 }}>{exam.name}</div>
          <div style={{ fontSize: 12, color: "var(--text2)" }}>{isRealExam ? "🏆 Real Exam Mode" : "📝 Mock Test Mode"}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18 }}>
        <span className="ep-badge ep-badge-blue">{exam.subjectCount || 0} subjects</span>
        {isRealExam ? <span className="ep-badge ep-badge-rose">Live</span> : <span className="ep-badge ep-badge-green">Practice</span>}
        <span style={{ color, fontSize: 18, fontWeight: 700 }}>→</span>
      </div>
    </div>
  );
}

export function SubjectCard({ subject, index = 0 }) {
  const navigate = useNavigate();
  const colors = ["var(--violet)", "var(--cyan)", "var(--amber)", "var(--rose)", "var(--green)"];
  const color = colors[index % colors.length];
  const icons = ["📐", "📖", "🌍", "⚗️", "🔢"];
  const icon = icons[index % icons.length];

  return (
    <div
      onClick={() => navigate(`/topic/${subject.id}`)}
      style={{ background: "var(--surf)", border: "1.5px solid var(--border)", borderRadius: 20, padding: 22, cursor: "pointer", transition: "all .25s", animation: `fadeUp .4s ease ${index * 0.07}s both` }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = ""; }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, animation: "float 3.5s ease-in-out infinite" }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text)", marginBottom: 3 }}>{subject.name}</div>
          <div style={{ fontSize: 12, color: "var(--text2)" }}>{subject.topicCount ?? "—"} topics</div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <div className="ep-prog" style={{ flex: 1, marginRight: 12 }}>
          <div className="ep-prog-fill" style={{ width: `${(index + 1) * 20}%`, background: color }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{(index + 1) * 20}%</span>
      </div>
    </div>
  );
}

export function TopicCTA({ topic, index = 0 }) {
  const navigate = useNavigate();
  const colors = ["var(--accent)", "var(--cyan)", "var(--green)", "var(--amber)", "var(--rose)"];
  const color = colors[index % colors.length];

  return (
    <div
      style={{ background: "var(--surf)", border: "1.5px solid var(--border)", borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all .2s", animation: `fadeUp .35s ease ${index * 0.05}s both`, cursor: "pointer" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = "translateX(3px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = ""; }}
    >
      <div>
        <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 14 }}>{topic.name}</div>
        <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 3 }}>{topic.questionCount ?? "—"} questions</div>
      </div>
      <button
        className="ep-btn ep-btn-sm"
        onClick={() => navigate(`/test/${topic.id}`)}
        style={{ background: color + "22", color, border: `1.5px solid ${color}44`, fontWeight: 700, fontSize: 13 }}
        onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={e => { e.currentTarget.style.background = color + "22"; e.currentTarget.style.color = color; }}
      >
        ▶ Start
      </button>
    </div>
  );
}
