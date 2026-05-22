import { useEffect, useRef, useState } from "react";
import api from "../Component/Api/axios";

const BehavioralChart = ({ sessionId }) => {
  const timeChartRef   = useRef(null);
  const optionChartRef = useRef(null);
  const timeInstance   = useRef(null);
  const optionInstance = useRef(null);

  const [chartData,   setChartData] = useState(null);
  const [summary,     setSummary]   = useState(null);
  const [loading,     setLoading]   = useState(true);
  const [noData,      setNoData]    = useState(false);
  const [chartReady,  setReady]     = useState(!!window.Chart);

  /* Load Chart.js from CDN */
  useEffect(() => {
    if (window.Chart) { setReady(true); return; }
    const s = document.createElement("script");
    s.src     = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
    s.onload  = () => setReady(true);
    s.onerror = () => console.error("Chart.js failed to load");
    document.head.appendChild(s);
  }, []);

  /* Fetch behavioral data */
  useEffect(() => {
    if (!sessionId) return;
    setLoading(true); setNoData(false); setChartData(null); setSummary(null);

    Promise.all([
      api.get(`/user/behavior/chart/${sessionId}`),
      api.get(`/user/behavior/summary/${sessionId}`),
    ])
      .then(([chartRes, summaryRes]) => {
        const cd = chartRes.data;
        const sd = summaryRes.data;
        const hasChartData = cd.labels && cd.labels.length > 0;
        const hasSummary   = sd.totalQuestions !== undefined;
        if (!hasChartData || !hasSummary) { setNoData(true); }
        else { setChartData(cd); setSummary(sd); }
      })
      .catch(() => setNoData(true))
      .finally(() => setLoading(false));
  }, [sessionId]);

  /* Render Chart.js charts */
  useEffect(() => {
    if (!chartReady || !chartData) return;
    if (!timeChartRef.current || !optionChartRef.current) return;

    const Chart   = window.Chart;
    timeInstance.current?.destroy();
    optionInstance.current?.destroy();

    const labels     = (chartData.labels      || []).map(i => `Q${i}`);
    const timeSpent  = chartData.timeSpent     || [];
    const optChanges = chartData.optionChanges || [];

    const gridColor  = "rgba(99,102,241,.08)";
    const tickColor  = "rgba(67,56,202,.45)";

    /* Time spent line chart */
    timeInstance.current = new Chart(timeChartRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Time Spent (seconds)",
          data: timeSpent,
          borderColor: "#6366f1",
          backgroundColor: "rgba(99,102,241,.1)",
          tension: 0.45,
          fill: true,
          pointBackgroundColor: "#fff",
          pointBorderColor: "#6366f1",
          pointBorderWidth: 2.5,
          pointRadius: 5,
          pointHoverRadius: 7,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: tickColor, font: { family: "'Plus Jakarta Sans',sans-serif", weight: "600", size: 12 } } },
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { family: "'Plus Jakarta Sans',sans-serif", size: 11 } } },
          y: {
            beginAtZero: true,
            grid: { color: gridColor },
            ticks: { color: tickColor, font: { family: "'Plus Jakarta Sans',sans-serif", size: 11 } },
            title: { display: true, text: "Seconds", color: tickColor, font: { family: "'Plus Jakarta Sans',sans-serif", size: 11 } },
          },
        },
      },
    });

    /* Option changes bar chart */
    optionInstance.current = new Chart(optionChartRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Option Changes",
          data: optChanges,
          backgroundColor: optChanges.map(v =>
            v >= 3 ? "rgba(220,38,38,.72)" : "rgba(99,102,241,.55)"
          ),
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: tickColor, font: { family: "'Plus Jakarta Sans',sans-serif", weight: "600", size: 12 } } },
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { family: "'Plus Jakarta Sans',sans-serif", size: 11 } } },
          y: {
            beginAtZero: true,
            grid: { color: gridColor },
            ticks: { color: tickColor, stepSize: 1, font: { family: "'Plus Jakarta Sans',sans-serif", size: 11 } },
          },
        },
      },
    });

    return () => {
      timeInstance.current?.destroy();
      optionInstance.current?.destroy();
    };
  }, [chartReady, chartData]);

  /* Export PNG */
  const exportPng = () => {
    if (!timeChartRef.current) return;
    const a = document.createElement("a");
    a.download = `behavioral_${sessionId}.png`;
    a.href = timeChartRef.current.toDataURL("image/png");
    a.click();
  };

  if (!sessionId) return null;

  /* ── Loading ── */
  if (loading) return (
    <>
      <style>{`
        @keyframes bcSpin { to { transform: rotate(360deg); } }
        .bc2-spinner { width:28px;height:28px;border-radius:50%;border:3px solid rgba(99,102,241,.15);border-top-color:#6366f1;animation:bcSpin .7s linear infinite; }
      `}</style>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"48px", gap:12 }}>
        <div className="bc2-spinner" />
        <span style={{ fontSize:13, color:"rgba(99,102,241,.5)", fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:500 }}>Loading analysis…</span>
      </div>
    </>
  );

  /* ── No data ── */
  if (noData) return (
    <div style={{
      textAlign:"center", padding:"48px 28px",
      background:"rgba(255,255,255,.75)", backdropFilter:"blur(18px)",
      border:"1.5px dashed rgba(99,102,241,.2)", borderRadius:18,
      fontFamily:"'Plus Jakarta Sans',sans-serif",
    }}>
      <div style={{ fontSize:38, marginBottom:12 }}>📭</div>
      <div style={{ fontSize:15, fontWeight:700, color:"#1e1b4b", marginBottom:6 }}>No behavioral data for this session</div>
      <div style={{ fontSize:13, color:"rgba(99,102,241,.5)", lineHeight:1.7 }}>
        Behavioral data is recorded question-by-question during the exam.<br />
        Complete a new test to generate analysis.
      </div>
    </div>
  );

  /* ── Stats ── */
  const total   = Number(summary?.totalQuestions    ?? 0);
  const avgTime = Number(summary?.avgTimePerQuestion ?? 0).toFixed(1);
  const changes = Number(summary?.totalOptionChanges ?? 0);
  const slowest = summary?.slowestQuestion ? `Q${summary.slowestQuestion}` : "—";

  const stats = [
    { label:"Questions Tracked", value:total,        accent:"#4f46e5", bg:"rgba(79,70,229,.09)",  border:"rgba(79,70,229,.18)",  icon:"📋" },
    { label:"Avg Time / Q",      value:`${avgTime}s`, accent:"#6366f1", bg:"rgba(99,102,241,.09)", border:"rgba(99,102,241,.18)", icon:"⏱️" },
    { label:"Option Changes",    value:changes,       accent:"#d97706", bg:"rgba(217,119,6,.09)",  border:"rgba(217,119,6,.18)",  icon:"🔄" },
    { label:"Slowest Question",  value:slowest,       accent:"#dc2626", bg:"rgba(220,38,38,.08)",  border:"rgba(220,38,38,.16)",  icon:"🐢" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes bc2FadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

        .bc2-wrap {
          font-family:'Plus Jakarta Sans',sans-serif;
          background:rgba(255,255,255,.82);
          backdrop-filter:blur(22px) saturate(180%);
          -webkit-backdrop-filter:blur(22px) saturate(180%);
          border:1.5px solid rgba(99,102,241,.13);
          border-radius:20px;padding:24px;
          box-shadow:0 4px 28px rgba(99,102,241,.09),inset 0 1px 0 rgba(255,255,255,.9);
          animation:bc2FadeUp .4s ease both;
          max-width:680px; margin:0 auto;
        }

        .bc2-hdr {
          display:flex;align-items:center;justify-content:space-between;
          margin-bottom:22px;padding-bottom:16px;
          border-bottom:1px solid rgba(99,102,241,.09);
        }
        .bc2-hdr-left { display:flex;align-items:center;gap:11px; }
        .bc2-hdr-badge {
          width:36px;height:36px;border-radius:11px;
          background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.18);
          display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;
        }
        .bc2-hdr-title { font-size:15px;font-weight:800;color:#1e1b4b;letter-spacing:-.01em; }
        .bc2-hdr-sub   { font-size:12px;color:rgba(99,102,241,.45);font-weight:500;margin-top:2px; }

        .bc2-export-btn {
          display:inline-flex;align-items:center;gap:7px;
          padding:8px 18px;border-radius:11px;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          color:#fff;font-family:'Plus Jakarta Sans',sans-serif;
          font-size:12.5px;font-weight:700;border:none;cursor:pointer;
          box-shadow:0 3px 14px rgba(99,102,241,.35);
          transition:all .22s;position:relative;overflow:hidden;
        }
        .bc2-export-btn::before {
          content:'';position:absolute;inset:0;
          background:linear-gradient(120deg,transparent,rgba(255,255,255,.2),transparent);
          transform:translateX(-100%);transition:transform .5s;
        }
        .bc2-export-btn:hover::before { transform:translateX(100%); }
        .bc2-export-btn:hover { transform:translateY(-2px);box-shadow:0 6px 22px rgba(99,102,241,.44); }

        .bc2-stats {
          display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:24px;
        }
        @media(min-width:600px) { .bc2-stats { grid-template-columns:repeat(4,1fr); } }

        .bc2-stat {
          border-radius:14px;padding:14px;text-align:center;
          transition:transform .2s;
        }
        .bc2-stat:hover { transform:translateY(-2px); }
        .bc2-stat-icon { font-size:18px;margin-bottom:6px; }
        .bc2-stat-val  { font-size:22px;font-weight:900;letter-spacing:-.03em;line-height:1; }
        .bc2-stat-lbl  { font-size:10.5px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;margin-top:4px;color:rgba(99,102,241,.45); }

        .bc2-chart-section { margin-bottom:22px; }
        .bc2-chart-label {
          font-size:12.5px;font-weight:700;color:rgba(67,56,202,.65);
          margin-bottom:12px;display:flex;align-items:center;gap:6px;
        }
        .bc2-chart-label-dot { width:5px;height:5px;border-radius:50%;background:#6366f1;flex-shrink:0; }
        .bc2-chart-note { font-size:11px;color:rgba(220,38,38,.7);font-weight:500;margin-left:4px; }

        .bc2-canvas-wrap {
          background:rgba(238,240,255,.35);border:1.5px solid rgba(99,102,241,.1);
          border-radius:14px;padding:14px;
        }
      `}</style>

      <div className="bc2-wrap">
        {/* Header */}
        <div className="bc2-hdr">
          <div className="bc2-hdr-left">
            <div className="bc2-hdr-badge">📊</div>
            <div>
              <div className="bc2-hdr-title">Behavioral Pattern Analysis</div>
              <div className="bc2-hdr-sub">Session #{sessionId}</div>
            </div>
          </div>
          <button className="bc2-export-btn" onClick={exportPng}>
            🖼 Export PNG
          </button>
        </div>

        {/* Stat cards */}
        <div className="bc2-stats">
          {stats.map(s => (
            <div
              key={s.label}
              className="bc2-stat"
              style={{ background:s.bg, border:`1.5px solid ${s.border}` }}
            >
              <div className="bc2-stat-icon">{s.icon}</div>
              <div className="bc2-stat-val" style={{ color:s.accent }}>{s.value}</div>
              <div className="bc2-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Time chart */}
        <div className="bc2-chart-section">
          <div className="bc2-chart-label">
            <span className="bc2-chart-label-dot" />
            Time spent per question
          </div>
          <div className="bc2-canvas-wrap">
            <canvas ref={timeChartRef} height={130} />
          </div>
        </div>

        {/* Option changes chart */}
        <div className="bc2-chart-section" style={{ marginBottom:0 }}>
          <div className="bc2-chart-label">
            <span className="bc2-chart-label-dot" style={{ background:"#dc2626" }} />
            Option changes per question
            <span className="bc2-chart-note">red = 3+ changes = risky</span>
          </div>
          <div className="bc2-canvas-wrap">
            <canvas ref={optionChartRef} height={110} />
          </div>
        </div>
      </div>
    </>
  );
};

export default BehavioralChart;