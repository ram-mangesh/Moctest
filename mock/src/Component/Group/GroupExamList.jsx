import { useEffect, useState } from "react";
import api from "../Api/axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');

:root {
  --gel-purple: #7C3AED;
  --gel-purple-lt: #EDE9FE;
  --gel-pink: #EC4899;
  --gel-pink-lt: #FCE7F3;
  --gel-cyan: #0891B2;
  --gel-cyan-lt: #CFFAFE;
  --gel-orange: #F97316;
  --gel-orange-lt: #FFF7ED;
  --gel-green: #059669;
  --gel-green-lt: #D1FAE5;
  --gel-amber: #D97706;
  --gel-amber-lt: #FEF3C7;
  --gel-bg: #FAFAFF;
  --gel-surface: #FFFFFF;
  --gel-border: rgba(0,0,0,0.07);
  --gel-text: #1E1B4B;
  --gel-muted: #6B7280;
  --gel-shadow: 0 4px 20px rgba(124,58,237,0.08);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

.gel-root {
  min-height: 100vh;
  background: var(--gel-bg);
  background-image:
    radial-gradient(ellipse at 15% 15%, rgba(124,58,237,0.09) 0%, transparent 42%),
    radial-gradient(ellipse at 85% 25%, rgba(8,145,178,0.07) 0%, transparent 42%),
    radial-gradient(ellipse at 50% 85%, rgba(236,72,153,0.07) 0%, transparent 42%);
  font-family: 'Nunito', sans-serif;
  color: var(--gel-text);
  padding: 2.5rem 1.5rem;
  position: relative;
  overflow-x: hidden;
}

/* subtle dot grid */
.gel-root::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: radial-gradient(circle, rgba(124,58,237,0.09) 1.5px, transparent 1.5px);
  background-size: 30px 30px;
  pointer-events: none;
  z-index: 0;
}

.gel-inner {
  max-width: 820px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* ── HERO ── */
.gel-hero { margin-bottom: 2rem; }

.gel-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--gel-purple-lt);
  border: 1.5px solid rgba(124,58,237,0.28);
  color: var(--gel-purple);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 4px 12px 4px 8px;
  border-radius: 100px;
  margin-bottom: 0.65rem;
  animation: gelPop 0.4s cubic-bezier(.34,1.56,.64,1) both;
}

.gel-badge::before {
  content: '';
  width: 7px; height: 7px;
  background: var(--gel-purple);
  border-radius: 50%;
  animation: gelBlink 1.6s ease-in-out infinite;
}

@keyframes gelBlink {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.7); }
}

.gel-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2.3rem;
  font-weight: 700;
  line-height: 1.15;
  color: var(--gel-text);
  animation: gelSlideUp 0.45s 0.05s cubic-bezier(.34,1.56,.64,1) both;
}

.gel-title .hl {
  background: linear-gradient(135deg, #7C3AED, #EC4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── PANELS ── */
.gel-panel {
  background: var(--gel-surface);
  border: 1.5px solid var(--gel-border);
  border-radius: 20px;
  padding: 1.4rem 1.5rem;
  margin-bottom: 1rem;
  box-shadow: var(--gel-shadow);
  transition: box-shadow 0.25s, border-color 0.25s;
  animation: gelSlideUp 0.45s cubic-bezier(.34,1.56,.64,1) both;
}

.gel-panel:hover {
  border-color: rgba(124,58,237,0.22);
  box-shadow: 0 8px 32px rgba(124,58,237,0.12);
}

.gel-section-label {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--gel-muted);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ── CREATE SELECTS ── */
.gel-selects {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  align-items: center;
}

.gel-select {
  background: #F9FAFB;
  border: 1.5px solid rgba(0,0,0,0.08);
  color: var(--gel-text);
  font-family: 'Nunito', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.58rem 2.2rem 0.58rem 0.9rem;
  border-radius: 12px;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 150px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-color: #F9FAFB;
}

.gel-select:hover:not(:disabled) {
  border-color: rgba(124,58,237,0.35);
  background-color: var(--gel-purple-lt);
}

.gel-select:focus {
  border-color: var(--gel-purple);
  box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
}

.gel-select:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.gel-select option {
  background: #fff;
  color: var(--gel-text);
}

.gel-btn-create {
  background: linear-gradient(135deg, #7C3AED, #9F67F8);
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: none;
  padding: 0.58rem 1.4rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 16px rgba(124,58,237,0.28);
  white-space: nowrap;
}

.gel-btn-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(124,58,237,0.42);
}

/* ── JOIN ── */
.gel-join-row {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  flex-wrap: wrap;
}

.gel-input {
  background: #F9FAFB;
  border: 1.5px solid rgba(0,0,0,0.08);
  color: var(--gel-text);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.58rem 1rem;
  border-radius: 12px;
  outline: none;
  transition: all 0.2s;
  width: 190px;
  letter-spacing: 0.08em;
}

.gel-input::placeholder { color: #9CA3AF; letter-spacing: 0.04em; }

.gel-input:focus {
  border-color: var(--gel-cyan);
  background: var(--gel-cyan-lt);
  box-shadow: 0 0 0 3px rgba(8,145,178,0.12);
}

.gel-btn-join {
  background: linear-gradient(135deg, #0891B2, #22D3EE);
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: none;
  padding: 0.58rem 1.4rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 16px rgba(8,145,178,0.25);
  white-space: nowrap;
}

.gel-btn-join:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(8,145,178,0.4);
}

/* ── DIVIDER ── */
.gel-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0 1.25rem;
}

.gel-divider-line {
  flex: 1;
  height: 1.5px;
  background: linear-gradient(90deg, transparent, rgba(124,58,237,0.15), transparent);
}

.gel-divider-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--gel-muted);
  background: var(--gel-purple-lt);
  border: 1px solid rgba(124,58,237,0.18);
  color: var(--gel-purple);
  padding: 4px 12px;
  border-radius: 100px;
}

/* ── EMPTY ── */
.gel-empty {
  text-align: center;
  padding: 3.5rem 2rem;
  background: var(--gel-surface);
  border: 1.5px dashed rgba(124,58,237,0.2);
  border-radius: 20px;
  color: var(--gel-muted);
  font-family: 'Nunito', sans-serif;
  font-size: 1rem;
  font-weight: 600;
}

.gel-empty-icon {
  font-size: 2.8rem;
  display: block;
  margin-bottom: 0.75rem;
  animation: gelFloat 3s ease-in-out infinite;
}

@keyframes gelFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* ── ROOM CARDS ── */
.gel-card {
  background: var(--gel-surface);
  border: 1.5px solid var(--gel-border);
  border-radius: 16px;
  padding: 1.1rem 1.3rem;
  margin-bottom: 0.7rem;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(.34,1.56,.64,1);
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  animation: gelSlideUp 0.4s cubic-bezier(.34,1.56,.64,1) both;
}

.gel-card::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, var(--gel-purple), var(--gel-pink));
  opacity: 0;
  transition: opacity 0.22s;
  border-radius: 0 2px 2px 0;
}

.gel-card:hover {
  border-color: rgba(124,58,237,0.25);
  box-shadow: 0 6px 24px rgba(124,58,237,0.12);
  transform: translateX(4px) translateY(-2px);
}

.gel-card:hover::after { opacity: 1; }

.gel-card:nth-child(1) { animation-delay: 0.05s; }
.gel-card:nth-child(2) { animation-delay: 0.10s; }
.gel-card:nth-child(3) { animation-delay: 0.15s; }
.gel-card:nth-child(4) { animation-delay: 0.20s; }
.gel-card:nth-child(5) { animation-delay: 0.25s; }

.gel-card-icon {
  width: 46px; height: 46px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--gel-purple-lt), rgba(236,72,153,0.1));
  border: 1.5px solid rgba(124,58,237,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  flex-shrink: 0;
  transition: transform 0.22s;
}
.gel-card:hover .gel-card-icon { transform: scale(1.08) rotate(-3deg); }

.gel-card-body { flex: 1; min-width: 0; }

.gel-card-code {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  color: var(--gel-muted);
  text-transform: uppercase;
  margin-bottom: 5px;
}
.gel-card-code b { color: var(--gel-purple); letter-spacing: 0.12em; }

.gel-card-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.gel-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: 100px;
  border: 1.5px solid;
}

.gel-chip-active {
  background: var(--gel-green-lt);
  border-color: rgba(5,150,105,0.3);
  color: var(--gel-green);
}

.gel-chip-wait {
  background: var(--gel-amber-lt);
  border-color: rgba(217,119,6,0.3);
  color: var(--gel-amber);
}

.gel-chip-players {
  background: var(--gel-purple-lt);
  border-color: rgba(124,58,237,0.25);
  color: var(--gel-purple);
}

.gel-card-arrow {
  color: #CBD5E1;
  font-size: 1.1rem;
  flex-shrink: 0;
  transition: transform 0.2s, color 0.2s;
  font-weight: 700;
}
.gel-card:hover .gel-card-arrow {
  transform: translateX(5px);
  color: var(--gel-purple);
}

/* ── ANIMATIONS ── */
@keyframes gelPop {
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes gelSlideUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

const GroupExamList = () => {
  const { t } = useTranslation();
  const [groups, setGroups]     = useState([]);
  const [exams, setExams]       = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics]     = useState([]);
  const [examId, setExamId]     = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId]   = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const navigate = useNavigate();

  const loadMyGroups = async () => {
    const res = await api.get("/group-exam/my-groups");
    setGroups(res.data);
  };

  const loadExams = async () => {
    const res = await api.get("/exam-data/exams");
    setExams(res.data);
  };

  const loadSubjects = async (id) => {
    setExamId(id);
    setSubjectId("");
    setTopicId("");
    setTopics([]);
    const res = await api.get(`/exam-data/subjects/${id}`);
    setSubjects(res.data);
  };

  const loadTopics = async (id) => {
    setSubjectId(id);
    setTopicId("");
    const res = await api.get(`/exam-data/topics/${id}`);
    setTopics(res.data);
  };

  useEffect(() => {
    loadMyGroups();
    loadExams();
  }, []);

  const createGroup = async () => {
    if (!topicId) { alert("Select topic first"); return; }
    await api.post(`/group-exam/create?topicId=${topicId}`);
    loadMyGroups();
  };

  const joinGroup = async () => {
    const res = await api.post(`/group-exam/join/${inviteCode}`);
    navigate(`/group-exams/${res.data.id}`);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="gel-root">
        <div className="gel-inner">

          {/* Hero */}
          <div className="gel-hero">
            <div className="gel-badge">Multiplayer Arena</div>
            <h1 className="gel-title">
              {t("group.myGroups")} <span className="hl">Battles</span>
            </h1>
          </div>

          {/* Create */}
          <div className="gel-panel" style={{ animationDelay: '0.1s' }}>
            <div className="gel-section-label">
              <span>⚡</span> Create New Battle
            </div>
            <div className="gel-selects">
              <select value={examId} onChange={e => loadSubjects(e.target.value)} className="gel-select">
                <option value="">Select Exam</option>
                {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>

              <select value={subjectId} onChange={e => loadTopics(e.target.value)} className="gel-select" disabled={!examId}>
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>

              <select value={topicId} onChange={e => setTopicId(e.target.value)} className="gel-select" disabled={!subjectId}>
                <option value="">Select Topic</option>
                {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>

              <button onClick={createGroup} className="gel-btn-create">
                {t("group.create")}
              </button>
            </div>
          </div>

          {/* Join */}
          <div className="gel-panel" style={{ animationDelay: '0.15s' }}>
            <div className="gel-section-label">
              <span>🎯</span> Join With Invite Code
            </div>
            <div className="gel-join-row">
              <input
                placeholder={t("group.inviteCode")}
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value)}
                className="gel-input"
              />
              <button onClick={joinGroup} className="gel-btn-join">
                {t("group.join")}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="gel-divider">
            <div className="gel-divider-line" />
            <span className="gel-divider-text">Active Rooms</span>
            <div className="gel-divider-line" />
          </div>

          {/* Cards */}
          {groups.length === 0 ? (
            <div className="gel-empty">
              <span className="gel-empty-icon">👾</span>
              {t("group.noGroups")}
            </div>
          ) : (
            groups.map(g => (
              <div
                key={g.id}
                onClick={() => navigate(`/group-exams/${g.id}`)}
                className="gel-card"
              >
                <div className="gel-card-icon">👥</div>
                <div className="gel-card-body">
                  <div className="gel-card-code">
                    {t("group.invite")}: <b>{g.inviteCode}</b>
                  </div>
                  <div className="gel-card-meta">
                    <span className={`gel-chip ${g.started ? 'gel-chip-active' : 'gel-chip-wait'}`}>
                      {g.started ? `● ${t("group.started")}` : `◌ ${t("group.waiting")}`}
                    </span>
                    <span className="gel-chip gel-chip-players">
                      ⚡ {g.participants?.length || 0} Players
                    </span>
                  </div>
                </div>
                <span className="gel-card-arrow">›</span>
              </div>
            ))
          )}

        </div>
      </div>
    </>
  );
};

export default GroupExamList;