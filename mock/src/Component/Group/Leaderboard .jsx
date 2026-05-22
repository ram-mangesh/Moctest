import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../Api/axios";
import { useTranslation } from "react-i18next";
import { useTheme } from "./Themecontext";

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');

:root {
  --lb-candy-1: #FF6B9D;
  --lb-candy-2: #C77DFF;
  --lb-candy-3: #48CAE4;
  --lb-candy-4: #FF9F1C;
  --lb-candy-5: #06D6A0;
  --lb-bg: #F8F4FF;
  --lb-surface: #FFFFFF;
  --lb-border: rgba(0,0,0,0.06);
  --lb-text: #1A1A2E;
  --lb-muted: #8B8FA8;
  --lb-gold: #FFB703;
  --lb-silver: #94A3B8;
  --lb-bronze: #CD7F32;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

.lb-root {
  min-height: 100vh;
  background: var(--lb-bg);
  background-image:
    radial-gradient(circle at 10% 10%, rgba(199,125,255,0.12) 0%, transparent 40%),
    radial-gradient(circle at 90% 20%, rgba(72,202,228,0.10) 0%, transparent 40%),
    radial-gradient(circle at 50% 90%, rgba(255,107,157,0.08) 0%, transparent 45%);
  color: var(--lb-text);
  padding: 2rem 1.5rem;
  font-family: 'Nunito', sans-serif;
  position: relative;
  overflow-x: hidden;
}

/* floating confetti dots */
.lb-root::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    radial-gradient(circle, rgba(199,125,255,0.18) 1.5px, transparent 1.5px),
    radial-gradient(circle, rgba(255,107,157,0.15) 1.5px, transparent 1.5px),
    radial-gradient(circle, rgba(72,202,228,0.15) 1.5px, transparent 1.5px);
  background-size: 60px 60px, 80px 80px, 100px 100px;
  background-position: 0 0, 30px 40px, 15px 70px;
  pointer-events: none;
  z-index: 0;
}

.lb-inner {
  max-width: 760px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* ── HEADER ── */
.lb-hdr {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 2rem;
  animation: lbDrop 0.5s cubic-bezier(.34,1.56,.64,1) both;
}

.lb-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #FF6B9D22, #C77DFF22);
  border: 1.5px solid rgba(199,125,255,0.35);
  color: var(--lb-candy-2);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 4px 12px 4px 8px;
  border-radius: 100px;
  margin-bottom: 0.5rem;
}

.lb-badge-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--lb-candy-1);
  animation: lbBlink 1.4s ease-in-out infinite;
}

@keyframes lbBlink {
  0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(255,107,157,0.5); }
  50% { transform: scale(1.3); opacity: 0.8; box-shadow: 0 0 0 5px rgba(255,107,157,0); }
}

.lb-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #C77DFF, #FF6B9D);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.01em;
}

.lb-hdr-right {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
  margin-top: 0.35rem;
}

.lb-btn-del {
  background: #FFF0F3;
  border: 1.5px solid rgba(255,107,157,0.35);
  color: #E63A6A;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.48rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}
.lb-btn-del:hover {
  background: #FFE0E8;
  border-color: rgba(230,58,106,0.5);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(230,58,106,0.18);
}

/* ── PODIUM ── */
.lb-podium {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2.5rem;
  animation: lbDrop 0.55s 0.1s cubic-bezier(.34,1.56,.64,1) both;
}

.lb-pod {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}

.lb-pod-av {
  width: 52px; height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 800;
  border: 3px solid;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.lb-pod-1 .lb-pod-av {
  width: 64px; height: 64px; font-size: 1.55rem;
  background: linear-gradient(135deg, #FFF3CD, #FFE08A);
  border-color: var(--lb-gold);
  color: #8B6200;
  box-shadow: 0 6px 24px rgba(255,183,3,0.35);
  animation: lbFloat 3s ease-in-out infinite;
}
.lb-pod-2 .lb-pod-av {
  background: #F1F5F9;
  border-color: var(--lb-silver);
  color: #475569;
}
.lb-pod-3 .lb-pod-av {
  background: linear-gradient(135deg, #FFF0E8, #FFD4B2);
  border-color: var(--lb-bronze);
  color: #7A3800;
}

@keyframes lbFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}

.lb-pod-name {
  font-family: 'Nunito', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--lb-text);
  max-width: 82px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lb-pod-score {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.7rem;
  color: var(--lb-muted);
}

.lb-pod-blk {
  border-radius: 12px 12px 0 0;
  width: 82px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 800;
  font-size: 1.25rem;
}

.lb-pod-1 .lb-pod-blk {
  height: 72px;
  background: linear-gradient(180deg, rgba(255,183,3,0.2), rgba(255,183,3,0.04));
  border: 1.5px solid rgba(255,183,3,0.4);
  border-bottom: none;
  color: var(--lb-gold);
}
.lb-pod-2 .lb-pod-blk {
  height: 52px;
  background: linear-gradient(180deg, rgba(148,163,184,0.18), rgba(148,163,184,0.04));
  border: 1.5px solid rgba(148,163,184,0.3);
  border-bottom: none;
  color: var(--lb-silver);
}
.lb-pod-3 .lb-pod-blk {
  height: 36px;
  background: linear-gradient(180deg, rgba(205,127,50,0.16), rgba(205,127,50,0.04));
  border: 1.5px solid rgba(205,127,50,0.28);
  border-bottom: none;
  color: var(--lb-bronze);
}

/* ── TABLE ── */
.lb-wrap {
  background: var(--lb-surface);
  border: 1.5px solid var(--lb-border);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0,0,0,0.06);
  animation: lbFade 0.5s 0.2s ease both;
}

.lb-table { width: 100%; border-collapse: collapse; }

.lb-thead th {
  background: linear-gradient(135deg, #FAF5FF, #FFF0F8);
  padding: 0.9rem 1.25rem;
  text-align: left;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.63rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--lb-muted);
  border-bottom: 1.5px solid var(--lb-border);
}
.lb-thead th:last-child { text-align: right; }

.lb-row {
  border-bottom: 1px solid var(--lb-border);
  transition: background 0.18s;
  animation: lbSlide 0.35s ease both;
}
.lb-row:last-child { border-bottom: none; }
.lb-row:hover { background: #FAFBFF; }

.lb-row-1 { background: linear-gradient(90deg, rgba(255,183,3,0.05), transparent); }
.lb-row-2 { background: linear-gradient(90deg, rgba(148,163,184,0.04), transparent); }
.lb-row-3 { background: linear-gradient(90deg, rgba(205,127,50,0.04), transparent); }

.lb-row td {
  padding: 0.9rem 1.25rem;
  font-family: 'Nunito', sans-serif;
  font-size: 0.88rem;
  color: var(--lb-text);
  vertical-align: middle;
}
.lb-row td:last-child { text-align: right; }

.lb-rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px; height: 32px;
  border-radius: 50%;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
}
.lb-rk-1 { background: linear-gradient(135deg, #FFF3CD, #FFE08A); border: 1.5px solid rgba(255,183,3,0.4); color: #8B6200; box-shadow: 0 2px 10px rgba(255,183,3,0.25); }
.lb-rk-2 { background: #F1F5F9; border: 1.5px solid rgba(148,163,184,0.35); color: #475569; }
.lb-rk-3 { background: linear-gradient(135deg, #FFF0E8, #FFD4B2); border: 1.5px solid rgba(205,127,50,0.3); color: #7A3800; }
.lb-rk-n { background: #F8F9FA; border: 1px solid rgba(0,0,0,0.07); color: var(--lb-muted); }

.lb-uname { font-weight: 700; color: var(--lb-text); }

.lb-score {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 8px;
  display: inline-block;
}
.lb-s-hi { background: #EDFBF3; border: 1px solid rgba(6,214,160,0.3); color: #047A52; }
.lb-s-md { background: #FFFBE8; border: 1px solid rgba(255,159,28,0.3); color: #9B5800; }
.lb-s-lo { background: #FFF0F3; border: 1px solid rgba(255,107,157,0.3); color: #C0103D; }

.lb-time {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--lb-muted);
  background: #F3F4F8;
  border: 1px solid rgba(0,0,0,0.06);
  padding: 3px 10px;
  border-radius: 8px;
  display: inline-block;
}

.lb-empty {
  padding: 3.5rem;
  text-align: center;
  color: var(--lb-muted);
  font-family: 'Nunito', sans-serif;
  font-size: 0.95rem;
}

.lb-loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--lb-bg);
  color: var(--lb-muted);
  font-family: 'Space Grotesk', sans-serif;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-size: 0.8rem;
  gap: 0.75rem;
}

.lb-loader {
  width: 18px; height: 18px;
  border: 2.5px solid rgba(199,125,255,0.2);
  border-top-color: var(--lb-candy-2);
  border-radius: 50%;
  animation: lbSpin 0.7s linear infinite;
}

@keyframes lbSpin { to { transform: rotate(360deg); } }
@keyframes lbDrop { from { opacity: 0; transform: translateY(-14px); } to { opacity: 1; transform: none; } }
@keyframes lbFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes lbSlide { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: none; } }
`;

const rk  = i => ["lb-rk-1","lb-rk-2","lb-rk-3"][i] ?? "lb-rk-n";
const rr  = i => ["lb-row-1","lb-row-2","lb-row-3"][i] ?? "lb-row";
const em  = i => ["🥇","🥈","🥉"][i] ?? (i + 1);
const sc  = (s, a) => {
  if (!a) return "lb-score lb-s-lo";
  const r = s / a;
  return r >= 0.7 ? "lb-score lb-s-hi" : r >= 0.4 ? "lb-score lb-s-md" : "lb-score lb-s-lo";
};

const Leaderboard = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();
  const [rows, setRows]     = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const r = await api.get(`/group-exam/${id}/leaderboard`);
      setRows(r.data);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 3000);
    return () => clearInterval(iv);
  }, [id]);

  const deleteExam = async () => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    try {
      await api.delete(`/group-exam/${id}`);
      alert("Exam deleted successfully");
      navigate("/group-exams");
    } catch (e) {
      alert("Failed to delete exam");
      console.error(e);
    }
  };

  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="lb-loading">
        <div className="lb-loader" />
        {t("common.loading")}
      </div>
    </>
  );

  const top    = rows.slice(0, 3);
  const podOrd = top.length >= 3 ? [top[1], top[0], top[2]]
    : top.length === 2 ? [top[1], top[0], null]
    : top.length === 1 ? [null, top[0], null] : [];
  const podCls = ["lb-pod lb-pod-2", "lb-pod lb-pod-1", "lb-pod lb-pod-3"];
  const podNum = [2, 1, 3];

  return (
    <>
      <style>{styles}</style>
      <div className="lb-root">
        <div className="lb-inner">

          {/* Header */}
          <div className="lb-hdr">
            <div className="lb-hdr-left">
              <div className="lb-badge">
                <div className="lb-badge-dot" />
                Live Results
              </div>
              <h2 className="lb-title">🏆 {t("leaderboard.title")}</h2>
            </div>
            <div className="lb-hdr-right">
              <button className="theme-toggle" onClick={toggle}>
                <span className="tt-icon">{isDark ? "☀️" : "🌙"}</span>
                {isDark ? "Light" : "Dark"}
              </button>
              <button onClick={deleteExam} className="lb-btn-del">
                🗑 Delete
              </button>
            </div>
          </div>

          {/* Podium */}
          {rows.length >= 2 && (
            <div className="lb-podium">
              {podOrd.map((p, i) => {
                if (!p) return <div key={i} style={{ width: 82 }} />;
                const ri = rows.findIndex(r => r.userId === p.userId);
                return (
                  <div key={p.userId} className={podCls[i]}>
                    <div className="lb-pod-av">{em(ri)}</div>
                    <div className="lb-pod-name">{p.username}</div>
                    <div className="lb-pod-score">{p.score}/{p.attempted}</div>
                    <div className="lb-pod-blk">{podNum[i]}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table */}
          <div className="lb-wrap">
            <table className="lb-table">
              <thead className="lb-thead">
                <tr>
                  <th>{t("leaderboard.rank")}</th>
                  <th>{t("leaderboard.user")}</th>
                  <th>{t("leaderboard.correctAttempted")}</th>
                  <th>{t("leaderboard.time")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan="4">
                      <div className="lb-empty">⏳ No results yet — waiting for players to finish</div>
                    </td>
                  </tr>
                ) : rows.map((p, i) => (
                  <tr key={p.userId} className={`lb-row ${rr(i)}`} style={{ animationDelay: `${i * 0.045}s` }}>
                    <td><span className={`lb-rank ${rk(i)}`}>{em(i)}</span></td>
                    <td className="lb-uname">{p.username}</td>
                    <td><span className={sc(p.score, p.attempted)}>{p.score} / {p.attempted}</span></td>
                    <td><span className="lb-time">{p.timeTaken}s</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </>
  );
};

export default Leaderboard;