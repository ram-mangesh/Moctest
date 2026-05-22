import { useEffect, useState } from "react";
import api from "../../Api/axios";
import { useTranslation } from "react-i18next";
import UserLayout from "../UserLayout";
import ProgressChart from "./ProgressChart";
import TopicWiseChart from "./TopicWiseChart";
import ScoreDonutChart from "./ScoreDonutChart";

const ProgressPage = () => {
  const { t }                         = useTranslation();
  const [attemptsRaw, setAttemptsRaw] = useState([]);

  useEffect(() => {
    api.get("/user/test/attempts")
      .then(res => setAttemptsRaw(res.data))
      .catch(() => {});
  }, []);

  const totalAttempts = attemptsRaw.length;
  const avgScore      = totalAttempts === 0 ? 0
    : Math.round(attemptsRaw.reduce((s, a) => s + a.scorePercent, 0) / totalAttempts);
  const bestScore     = totalAttempts === 0 ? 0
    : Math.max(...attemptsRaw.map(a => a.scorePercent));

  const progressData = attemptsRaw.map(a => ({
    date:  new Date(a.attemptedAt).toLocaleDateString(),
    score: a.scorePercent,
  }));

  const topicMap = {};
  attemptsRaw.forEach(a => {
    const key = a.topicName || a.topic || "Unknown";
    if (!topicMap[key]) topicMap[key] = { total: 0, count: 0 };
    topicMap[key].total += a.scorePercent;
    topicMap[key].count++;
  });
  const topicWiseData = Object.entries(topicMap).map(([topic, val]) => ({
    topic, avgScore: Math.round(val.total / val.count),
  }));

  const STATS = [
    {
      label: t("progress.attempts",    "Total Attempts"),
      value: totalAttempts, suffix: "",
      accent: "#2563eb", bg: "rgba(37,99,235,.09)", border: "rgba(37,99,235,.18)",
      icon: "⏱️",
    },
    {
      label: t("progress.averageScore", "Avg Score"),
      value: avgScore, suffix: "%",
      accent: "#7c3aed", bg: "rgba(124,58,237,.09)", border: "rgba(124,58,237,.18)",
      icon: "📊",
    },
    {
      label: t("progress.bestScore",    "Best Score"),
      value: bestScore, suffix: "%",
      accent: "#059669", bg: "rgba(5,150,105,.09)", border: "rgba(5,150,105,.18)",
      icon: "🏅",
    },
  ];

  return (
    <UserLayout>
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .pp2-eyebrow {
            display: inline-flex; align-items: center; gap: 6px;
            font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
            color: #6366f1; background: rgba(99,102,241,.09);
            border: 1px solid rgba(99,102,241,.18); border-radius: 20px;
            padding: 4px 12px; margin-bottom: 10px;
          }
          .pp2-eyebrow::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: #6366f1; }

          .pp2-title {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 26px; font-weight: 900; letter-spacing: -.03em;
            color: #1e1b4b; margin-bottom: 4px; animation: fadeUp .4s ease both;
          }
          .pp2-sub {
            font-size: 14px; color: rgba(99,102,241,.5); font-weight: 400;
            margin-bottom: 26px; animation: fadeUp .4s ease .05s both;
          }

          /* stat cards */
          .pp2-stats {
            display: grid; grid-template-columns: repeat(1,1fr); gap: 14px; margin-bottom: 24px;
          }
          @media(min-width:640px) { .pp2-stats { grid-template-columns: repeat(3,1fr); } }

          .pp2-stat {
            background: rgba(255,255,255,.82);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border: 1.5px solid rgba(99,102,241,.12);
            border-radius: 18px; padding: 18px 20px;
            display: flex; align-items: center; gap: 14px;
            position: relative; overflow: hidden;
            transition: all .2s; cursor: default;
            box-shadow: 0 2px 16px rgba(99,102,241,.07), inset 0 1px 0 rgba(255,255,255,.9);
            animation: fadeUp .4s ease both;
          }
          .pp2-stat:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 32px rgba(99,102,241,.14), inset 0 1px 0 rgba(255,255,255,.95);
          }
          .pp2-stat-bar {
            position: absolute; top: 0; left: 0; width: 3px; height: 100%;
            border-radius: 18px 0 0 18px;
          }
          .pp2-stat-icon {
            width: 44px; height: 44px; border-radius: 13px;
            display: flex; align-items: center; justify-content: center;
            font-size: 20px; flex-shrink: 0; transition: transform .2s;
          }
          .pp2-stat:hover .pp2-stat-icon { transform: scale(1.08); }
          .pp2-stat-lbl {
            font-size: 11px; font-weight: 700; letter-spacing: .07em;
            text-transform: uppercase; color: rgba(99,102,241,.45); margin-bottom: 4px;
          }
          .pp2-stat-val {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 28px; font-weight: 900; letter-spacing: -.03em; line-height: 1;
          }

          /* chart cards */
          .pp2-charts { display: flex; flex-direction: column; gap: 18px; }

          .pp2-chart-card {
            background: rgba(255,255,255,.82);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border: 1.5px solid rgba(99,102,241,.12);
            border-radius: 20px; padding: 24px;
            box-shadow: 0 3px 20px rgba(99,102,241,.08), inset 0 1px 0 rgba(255,255,255,.9);
            animation: fadeUp .45s ease both;
          }
          .pp2-chart-hdr {
            display: flex; align-items: center; justify-content: space-between;
            margin-bottom: 20px; padding-bottom: 16px;
            border-bottom: 1px solid rgba(99,102,241,.09);
          }
          .pp2-chart-hdr-left { display: flex; align-items: center; gap: 11px; }
          .pp2-chart-badge {
            width: 34px; height: 34px; border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            font-size: 16px; flex-shrink: 0;
          }
          .pp2-chart-title {
            font-size: 14.5px; font-weight: 700; color: #1e1b4b; letter-spacing: -.01em;
          }
          .pp2-chart-meta {
            font-size: 11.5px; color: rgba(99,102,241,.45);
            background: rgba(238,240,255,.7); border: 1px solid rgba(99,102,241,.12);
            border-radius: 20px; padding: 3px 10px; font-weight: 600;
          }
        `}</style>

        <div className="pp2-eyebrow">Analytics</div>
        <h2 className="pp2-title">{t("progress.title", "Your Progress")}</h2>
        <p className="pp2-sub">Track performance across all your quiz attempts</p>

        {/* Stat cards */}
        <div className="pp2-stats">
          {STATS.map((s, i) => (
            <div
              key={i}
              className="pp2-stat"
              style={{ animationDelay: `${i * .08}s` }}
            >
              <div className="pp2-stat-bar" style={{ background: s.accent }} />
              <div className="pp2-stat-icon" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                {s.icon}
              </div>
              <div>
                <div className="pp2-stat-lbl">{s.label}</div>
                <div className="pp2-stat-val" style={{ color: s.accent }}>
                  {s.value}{s.suffix}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="pp2-charts">
          {/* Score over time */}
          <div className="pp2-chart-card" style={{ animationDelay: ".24s" }}>
            <div className="pp2-chart-hdr">
              <div className="pp2-chart-hdr-left">
                <div className="pp2-chart-badge" style={{ background: "rgba(99,102,241,.1)", border: "1px solid rgba(99,102,241,.18)" }}>📈</div>
                <span className="pp2-chart-title">{t("progress.scoreOverTime", "Score Over Time")}</span>
              </div>
              <span className="pp2-chart-meta">{totalAttempts} {totalAttempts === 1 ? "attempt" : "attempts"}</span>
            </div>
            <ProgressChart data={progressData} />
          </div>

          {/* Score distribution */}
          <div className="pp2-chart-card" style={{ animationDelay: ".32s" }}>
            <div className="pp2-chart-hdr">
              <div className="pp2-chart-hdr-left">
                <div className="pp2-chart-badge" style={{ background: "rgba(124,58,237,.1)", border: "1px solid rgba(124,58,237,.18)" }}>🍩</div>
                <span className="pp2-chart-title">{t("progress.scoreDistribution", "Score Distribution")}</span>
              </div>
              <span className="pp2-chart-meta">by range</span>
            </div>
            <ScoreDonutChart attempts={attemptsRaw} />
          </div>

          {/* Topic-wise */}
          <div className="pp2-chart-card" style={{ animationDelay: ".40s" }}>
            <div className="pp2-chart-hdr">
              <div className="pp2-chart-hdr-left">
                <div className="pp2-chart-badge" style={{ background: "rgba(5,150,105,.1)", border: "1px solid rgba(5,150,105,.18)" }}>📚</div>
                <span className="pp2-chart-title">{t("progress.topicWise", "Topic-wise Performance")}</span>
              </div>
              <span className="pp2-chart-meta">{topicWiseData.length} {topicWiseData.length === 1 ? "topic" : "topics"}</span>
            </div>
            <TopicWiseChart data={topicWiseData} />
          </div>
        </div>
      </>
    </UserLayout>
  );
};

export default ProgressPage;
