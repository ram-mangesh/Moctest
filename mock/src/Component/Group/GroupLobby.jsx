import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../Api/axios";
import { useTranslation } from "react-i18next";

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');

:root {
  --glo-purple: #7C3AED;
  --glo-purple-lt: #EDE9FE;
  --glo-pink: #EC4899;
  --glo-pink-lt: #FCE7F3;
  --glo-cyan: #0891B2;
  --glo-cyan-lt: #CFFAFE;
  --glo-green: #059669;
  --glo-green-lt: #D1FAE5;
  --glo-bg: #F8F4FF;
  --glo-surface: #FFFFFF;
  --glo-border: rgba(0,0,0,0.07);
  --glo-text: #1E1B4B;
  --glo-muted: #6B7280;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

.glo-root {
  min-height: 100vh;
  background: var(--glo-bg);
  background-image:
    radial-gradient(ellipse at 20% 10%,  rgba(124,58,237,0.11) 0%, transparent 45%),
    radial-gradient(ellipse at 80% 15%,  rgba(8,145,178,0.08)  0%, transparent 45%),
    radial-gradient(ellipse at 50% 90%,  rgba(236,72,153,0.08) 0%, transparent 45%);
  font-family: 'Nunito', sans-serif;
  color: var(--glo-text);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.25rem;
  position: relative;
  overflow: hidden;
}

/* dot grid */
.glo-root::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: radial-gradient(circle, rgba(124,58,237,0.09) 1.5px, transparent 1.5px);
  background-size: 30px 30px;
  pointer-events: none;
  z-index: 0;
}

/* ── CARD ── */
.glo-card {
  background: var(--glo-surface);
  border: 1.5px solid var(--glo-border);
  border-radius: 28px;
  padding: 2.5rem 2.25rem;
  width: 100%;
  max-width: 500px;
  position: relative;
  z-index: 1;
  box-shadow: 0 12px 56px rgba(124,58,237,0.10), 0 2px 8px rgba(0,0,0,0.04);
  animation: gloRise 0.55s cubic-bezier(.34,1.56,.64,1) both;
}

/* rainbow top accent */
.glo-card::before {
  content: '';
  position: absolute;
  top: 0; left: 10%; right: 10%;
  height: 3px;
  background: linear-gradient(90deg, var(--glo-purple), var(--glo-pink), var(--glo-cyan));
  border-radius: 0 0 4px 4px;
}

@keyframes gloRise {
  from { opacity: 0; transform: translateY(22px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)   scale(1);    }
}

/* ── BADGE ── */
.glo-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--glo-cyan-lt);
  border: 1.5px solid rgba(8,145,178,0.28);
  color: var(--glo-cyan);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 4px 12px 4px 8px;
  border-radius: 100px;
  margin-bottom: 0.85rem;
}

.glo-dot {
  width: 7px; height: 7px;
  background: var(--glo-cyan);
  border-radius: 50%;
  animation: gloBlink 1.4s ease-in-out infinite;
}

@keyframes gloBlink {
  0%, 100% { opacity: 1; transform: scale(1);   box-shadow: 0 0 0 0   rgba(8,145,178,0.5); }
  50%       { opacity: 0.5; transform: scale(1.3); box-shadow: 0 0 0 5px rgba(8,145,178,0);   }
}

/* ── TITLE ── */
.glo-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, #7C3AED, #EC4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1.75rem;
  letter-spacing: -0.01em;
}

/* ── INVITE BOX ── */
.glo-invite-box {
  background: linear-gradient(135deg, var(--glo-purple-lt), rgba(236,72,153,0.07));
  border: 1.5px solid rgba(124,58,237,0.22);
  border-radius: 16px;
  padding: 1.1rem 1.3rem;
  margin-bottom: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.glo-invite-box:hover {
  border-color: rgba(124,58,237,0.4);
  box-shadow: 0 4px 18px rgba(124,58,237,0.1);
}

.glo-invite-label {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--glo-muted);
  margin-bottom: 5px;
}

.glo-invite-code {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--glo-purple);
  letter-spacing: 0.25em;
}

.glo-invite-icon {
  width: 42px; height: 42px;
  background: linear-gradient(135deg, var(--glo-purple-lt), rgba(236,72,153,0.12));
  border: 1.5px solid rgba(124,58,237,0.22);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

/* ── PLAYERS ── */
.glo-players-section { margin-bottom: 1.75rem; }

.glo-players-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.9rem;
}

.glo-players-label {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--glo-muted);
}

.glo-players-count {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  background: var(--glo-green-lt);
  border: 1.5px solid rgba(5,150,105,0.28);
  color: var(--glo-green);
  padding: 3px 10px;
  border-radius: 100px;
}

.glo-orbs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.glo-orb {
  width: 42px; height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--glo-purple-lt), rgba(236,72,153,0.12));
  border: 2px solid rgba(124,58,237,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  animation: gloPopIn 0.35s cubic-bezier(.34,1.56,.64,1) both;
  box-shadow: 0 2px 10px rgba(124,58,237,0.12);
  transition: transform 0.2s;
}

.glo-orb:hover { transform: scale(1.12) translateY(-2px); }

@keyframes gloPopIn {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

.glo-orb-empty {
  background: #F9FAFB;
  border: 2px dashed rgba(0,0,0,0.1);
  box-shadow: none;
  color: #D1D5DB;
  font-size: 0.75rem;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
}

/* ── SEPARATOR ── */
.glo-separator {
  height: 1.5px;
  background: linear-gradient(90deg, transparent, rgba(124,58,237,0.15), transparent);
  margin-bottom: 1.75rem;
}

/* ── START BUTTON ── */
.glo-btn-start {
  width: 100%;
  background: linear-gradient(135deg, #7C3AED, #9F67F8);
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 1rem;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.22s;
  box-shadow: 0 6px 24px rgba(124,58,237,0.32);
  position: relative;
  overflow: hidden;
}

.glo-btn-start::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
  transform: translateX(-100%);
  transition: transform 0.5s;
}

.glo-btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 36px rgba(124,58,237,0.46);
}

.glo-btn-start:hover::after { transform: translateX(100%); }
.glo-btn-start:active { transform: translateY(0); }

/* ── WAITING ── */
.glo-waiting {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: #F9FAFB;
  border: 1.5px solid rgba(0,0,0,0.07);
  border-radius: 14px;
  padding: 1rem;
  color: var(--glo-muted);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  font-weight: 600;
}

.glo-waiting-dots { display: flex; gap: 5px; }

.glo-waiting-dot {
  width: 7px; height: 7px;
  background: linear-gradient(135deg, var(--glo-purple), var(--glo-pink));
  border-radius: 50%;
  animation: gloBounce 1.4s infinite ease-in-out both;
}

.glo-waiting-dot:nth-child(1) { animation-delay: 0s; }
.glo-waiting-dot:nth-child(2) { animation-delay: 0.18s; }
.glo-waiting-dot:nth-child(3) { animation-delay: 0.36s; }

@keyframes gloBounce {
  0%, 80%, 100% { transform: scale(0.65); opacity: 0.4; }
  40%            { transform: scale(1.1);  opacity: 1;   }
}

/* ── LOADING ── */
.glo-loading {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--glo-bg);
  color: var(--glo-muted);
  font-family: 'Space Grotesk', sans-serif;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.78rem;
  gap: 1rem;
}

.glo-spinner {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 3px solid rgba(124,58,237,0.15);
  border-top-color: var(--glo-purple);
  animation: gloSpin 0.75s linear infinite;
}

@keyframes gloSpin { to { transform: rotate(360deg); } }
`;

const GroupLobby = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [count, setCount] = useState(0);

  const userId = Number(localStorage.getItem("userId"));

  const loadLobby = async () => {
    try {
      const res = await api.get(`/group-exam/${id}`);
      const data = res.data;
      setGroup(data);
      const participants = Array.isArray(data.participants) ? data.participants : [];
      setCount(participants.length);
      if (data.started === true) {
        navigate(`/group-exams/${id}/start`, { replace: true });
      }
    } catch (e) {
      console.error("Lobby error", e);
    }
  };

  useEffect(() => {
    loadLobby();
    const interval = setInterval(loadLobby, 3000);
    return () => clearInterval(interval);
  }, [id]);

  if (!group) {
    return (
      <>
        <style>{styles}</style>
        <div className="glo-loading">
          <div className="glo-spinner" />
          {t("group.loadingLobby")}
        </div>
      </>
    );
  }

  const isCreator = group.createdBy === userId;

  const startExam = async () => {
    try {
      await api.post(`/group-exam/${id}/start`);
    } catch (e) {
      alert(t("group.onlyHost"));
    }
  };

  const maxSlots = Math.max(count, 4);
  const emptySlots = maxSlots - count;

  return (
    <>
      <style>{styles}</style>
      <div className="glo-root">
        <div className="glo-card">

          {/* Badge */}
          <div className="glo-badge">
            <div className="glo-dot" />
            Live Lobby
          </div>

          {/* Title */}
          <h2 className="glo-title">👥 {t("group.lobbyTitle")}</h2>

          {/* Invite Code */}
          <div className="glo-invite-box">
            <div>
              <div className="glo-invite-label">{t("group.inviteCodeLabel")}</div>
              <div className="glo-invite-code">{group.inviteCode}</div>
            </div>
            <div className="glo-invite-icon">🔗</div>
          </div>

          {/* Players */}
          <div className="glo-players-section">
            <div className="glo-players-header">
              <span className="glo-players-label">{t("group.participantsJoined")}</span>
              <span className="glo-players-count">✦ {count} joined</span>
            </div>
            <div className="glo-orbs">
              {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="glo-orb" style={{ animationDelay: `${i * 0.06}s` }}>
                  👤
                </div>
              ))}
              {Array.from({ length: emptySlots }).map((_, i) => (
                <div key={`e-${i}`} className="glo-orb glo-orb-empty">+</div>
              ))}
            </div>
          </div>

          <div className="glo-separator" />

          {/* Action */}
          {isCreator && !group.started ? (
            <button onClick={startExam} className="glo-btn-start">
              ⚡ {t("group.startExam")}
            </button>
          ) : (
            <div className="glo-waiting">
              <div className="glo-waiting-dots">
                <div className="glo-waiting-dot" />
                <div className="glo-waiting-dot" />
                <div className="glo-waiting-dot" />
              </div>
              {t("group.waitingForHost")}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default GroupLobby;