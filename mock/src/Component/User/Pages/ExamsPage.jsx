import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Api/axios";
import UserLayout from "../UserLayout";
import { AiChatIcon, AiChatSlider } from "../Component/AiChat";
import ExamCard from "../Component/ExamCard";

export default function ExamsPage() {
  const navigate = useNavigate();
  const [aiOpen, setAiOpen]       = useState(false);
  const [exams, setExams]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const examTags = ["All", "SSC", "UPSC", "Banking", "Railways"];

  useEffect(() => {
    setLoading(true);
    api.get("/user/exams").then(r => { setExams(r.data); setLoading(false); });
  }, []);

  const filtered = exams.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <UserLayout>
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes shimmer {
            0%   { background-position: -200% 0; }
            100% { background-position:  200% 0; }
          }

          .exg-eyebrow {
            display: inline-flex; align-items: center; gap: 6px;
            font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
            color: #6366f1; background: rgba(99,102,241,.09);
            border: 1px solid rgba(99,102,241,.18); border-radius: 20px;
            padding: 4px 12px; margin-bottom: 10px;
          }
          .exg-eyebrow::before { content:''; width:5px; height:5px; border-radius:50%; background:#6366f1; }

          .exg-header {
            display: flex; justify-content: space-between; align-items: flex-end;
            margin-bottom: 22px; flex-wrap: wrap; gap: 14px;
          }
          .exg-title {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 26px; font-weight: 900; letter-spacing: -.03em;
            color: #1e1b4b; margin-bottom: 4px; animation: fadeUp .4s ease both;
          }
          .exg-sub { font-size: 13.5px; color: rgba(99,102,241,.5); animation: fadeUp .4s ease .05s both; }

          .exg-search {
            display: flex; align-items: center; gap: 9px;
            background: rgba(255,255,255,.82); backdrop-filter: blur(18px);
            border: 1.5px solid rgba(99,102,241,.14); border-radius: 13px;
            padding: 9px 14px; min-width: 220px; transition: all .2s;
          }
          .exg-search:focus-within {
            border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.12);
            background: rgba(255,255,255,.95);
          }
          .exg-search input {
            background: none; border: none; outline: none;
            font-size: 13px; color: #1e1b4b; font-family: inherit; width: 100%;
          }
          .exg-search input::placeholder { color: rgba(99,102,241,.38); }

          .exg-tags { display: flex; gap: 7px; margin-bottom: 22px; flex-wrap: wrap; }
          .exg-tag {
            padding: 6px 15px; border-radius: 20px;
            font-size: 12px; font-weight: 700; cursor: pointer;
            border: 1.5px solid rgba(99,102,241,.15);
            background: rgba(255,255,255,.7); backdrop-filter: blur(8px);
            color: rgba(67,56,202,.55); transition: all .2s;
            font-family: 'Plus Jakarta Sans', sans-serif;
          }
          .exg-tag:hover { border-color: rgba(99,102,241,.35); color: #4338ca; }
          .exg-tag.on { border-color: #6366f1; background: rgba(99,102,241,.1); color: #4f46e5; }

          .exg-stats {
            display: grid; grid-template-columns: repeat(auto-fill, minmax(150px,1fr));
            gap: 12px; margin-bottom: 24px;
          }
          .exg-stat {
            background: rgba(255,255,255,.82); backdrop-filter: blur(20px) saturate(180%);
            border: 1.5px solid rgba(99,102,241,.12); border-radius: 16px;
            padding: 14px 16px; display: flex; align-items: center; gap: 11px;
            transition: all .2s;
            box-shadow: 0 2px 14px rgba(99,102,241,.07), inset 0 1px 0 rgba(255,255,255,.9);
            animation: fadeUp .4s ease both;
          }
          .exg-stat:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(99,102,241,.14); }
          .exg-stat-icon { width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0; }
          .exg-stat-val { font-size:20px;font-weight:900;color:#1e1b4b;line-height:1;letter-spacing:-.03em; }
          .exg-stat-lbl { font-size:10.5px;color:rgba(99,102,241,.45);margin-top:2px;font-weight:600; }

          .exg-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px; }

          .exg-skeleton { background:rgba(255,255,255,.7);border:1.5px solid rgba(99,102,241,.1);border-radius:20px;padding:22px; }
          .exg-skel-line {
            height:13px;border-radius:6px;margin-bottom:11px;
            background: linear-gradient(90deg,rgba(99,102,241,.08) 0%,rgba(99,102,241,.16) 50%,rgba(99,102,241,.08) 100%);
            background-size:200% 100%; animation:shimmer 1.5s infinite;
          }

          .exg-empty {
            text-align:center;padding:56px 32px;
            background:rgba(255,255,255,.7);backdrop-filter:blur(16px);
            border:1.5px dashed rgba(99,102,241,.2);border-radius:20px;
            animation:fadeUp .4s ease both;
          }
          .exg-empty-icon { font-size:40px;margin-bottom:12px; }
          .exg-empty h3 { font-size:16px;font-weight:700;color:#1e1b4b;margin-bottom:6px; }
          .exg-empty p  { font-size:13px;color:rgba(99,102,241,.45); }

          .exg-cta {
            margin-top:32px;
            background:linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4);
            border-radius:20px;padding:24px 28px;
            display:flex;align-items:center;justify-content:space-between;
            gap:16px;flex-wrap:wrap;position:relative;overflow:hidden;
          }
          .exg-cta::before { content:'';position:absolute;right:-20px;bottom:-20px;width:140px;height:140px;border-radius:50%;background:rgba(255,255,255,.07); }
          .exg-cta-title { font-weight:900;font-size:17px;color:#fff;margin-bottom:4px;position:relative; }
          .exg-cta-sub   { font-size:13px;color:rgba(255,255,255,.72);position:relative; }
          .exg-cta-btns  { display:flex;gap:9px;position:relative;flex-wrap:wrap; }
          .exg-cta-btn {
            padding:9px 20px;border-radius:11px;font-size:13px;font-weight:700;
            background:rgba(255,255,255,.18);color:#fff;
            border:1.5px solid rgba(255,255,255,.28);cursor:pointer;
            font-family:'Plus Jakarta Sans',sans-serif;transition:all .2s;backdrop-filter:blur(8px);
          }
          .exg-cta-btn:hover { background:rgba(255,255,255,.28);transform:translateY(-2px); }

          .exg-real-btn {
            display:inline-flex;align-items:center;gap:7px;
            padding:9px 18px;border-radius:12px;font-size:13px;font-weight:700;
            background:rgba(255,255,255,.82);backdrop-filter:blur(12px);
            border:1.5px solid rgba(99,102,241,.18);color:#4f46e5;
            cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .2s;
            box-shadow:0 2px 12px rgba(99,102,241,.12);
          }
          .exg-real-btn:hover { background:rgba(238,240,255,.95);border-color:rgba(99,102,241,.38);transform:translateY(-1px); }
        `}</style>

        {/* Header */}
        <div className="exg-header">
          <div>
            <div className="exg-eyebrow">Browse</div>
            <h2 className="exg-title">All Exams</h2>
            <p className="exg-sub">{filtered.length} exams available · Click any to start practising</p>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
            <div className="exg-search">
              <span style={{ color:"rgba(99,102,241,.45)", fontSize:15 }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search exams…"
              />
              {search && (
                <span onClick={() => setSearch("")} style={{ cursor:"pointer", color:"rgba(99,102,241,.4)", fontSize:16, lineHeight:1 }}>×</span>
              )}
            </div>
            <button className="exg-real-btn" onClick={() => navigate("/real-exams")}>🏆 Real Exams</button>
          </div>
        </div>

        {/* Tags */}
        <div className="exg-tags">
          {examTags.map(tag => (
            <button key={tag} onClick={() => setActiveTag(tag)} className={`exg-tag${activeTag === tag ? " on" : ""}`}>
              {tag}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div className="exg-stats">
          {[
            { icon:"📋", label:"Total Exams",   value:exams.length || 0, color:"rgba(99,102,241,.1)",  accent:"#6366f1" },
            { icon:"📝", label:"Tests Taken",   value:42,                color:"rgba(5,150,105,.1)",   accent:"#059669" },
            { icon:"🎯", label:"Avg Score",     value:"78%",             color:"rgba(217,119,6,.1)",   accent:"#d97706" },
            { icon:"🔥", label:"Active Streak", value:"7d",              color:"rgba(225,29,72,.09)",  accent:"#e11d48" },
          ].map((s, i) => (
            <div key={i} className="exg-stat" style={{ animationDelay:`${i * .07}s` }}>
              <div className="exg-stat-icon" style={{ background:s.color }}>{s.icon}</div>
              <div>
                <div className="exg-stat-val" style={{ color:s.accent }}>{s.value}</div>
                <div className="exg-stat-lbl">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="exg-grid">
            {[1,2,3].map(i => (
              <div key={i} className="exg-skeleton">
                <div className="exg-skel-line" style={{ width:"60%" }} />
                <div className="exg-skel-line" style={{ width:"80%" }} />
                <div className="exg-skel-line" style={{ width:"40%" }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="exg-empty">
            <div className="exg-empty-icon">🔍</div>
            <h3>No exams found</h3>
            <p>Try a different search term or clear the filter</p>
            <button
              onClick={() => setSearch("")}
              style={{
                marginTop:16, padding:"9px 20px", borderRadius:12,
                background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
                color:"#fff", border:"none", cursor:"pointer",
                fontFamily:"inherit", fontSize:13, fontWeight:700,
                boxShadow:"0 4px 14px rgba(99,102,241,.35)",
              }}
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="exg-grid">
            {filtered.map((exam, i) => (
              <ExamCard key={exam.id} exam={exam} index={i} />
            ))}
          </div>
        )}

        {/* CTA banner */}
        {!loading && filtered.length > 0 && (
          <div className="exg-cta">
            <div>
              <div className="exg-cta-title">Ready to challenge yourself? 🚀</div>
              <div className="exg-cta-sub">Try a real exam or challenge a friend</div>
            </div>
            <div className="exg-cta-btns">
              <button className="exg-cta-btn" onClick={() => navigate("/real-exams")}>🏆 Real Exams</button>
              <button className="exg-cta-btn" onClick={() => navigate("/group-exams")}>👥 Challenge</button>
            </div>
          </div>
        )}

        <AiChatIcon onClick={() => setAiOpen(true)} />
        <AiChatSlider open={aiOpen} onClose={() => setAiOpen(false)} />
      </>
    </UserLayout>
  );
}
