import { useEffect, useState } from "react";
import api from "../Component/Api/axios";

const FIELDS = [
  {
    key: "calmUiStressThreshold",
    label: "Calm UI activation stress level",
    desc: "Show calming interface when stress reaches this %",
    min: 10, max: 100, step: 5, default: 40,
    icon: "🧘", accent: "#8b5cf6",
  },
  {
    key: "mistakeRiskStressThreshold",
    label: "Mistake risk stress level",
    desc: "Warn about careless mistakes when stress reaches this %",
    min: 10, max: 100, step: 5, default: 35,
    icon: "⚠️", accent: "#d97706",
  },
  {
    key: "mistakeRiskConfidenceThreshold",
    label: "Mistake risk confidence level",
    desc: "Warn when confidence drops below this %",
    min: 5, max: 80, step: 5, default: 35,
    icon: "🎯", accent: "#e11d48",
  },
  {
    key: "longTimeThresholdSeconds",
    label: "Long time per question (seconds)",
    desc: "Flag a question as taking too long after this many seconds",
    min: 10, max: 300, step: 10, default: 60,
    icon: "⏱️", accent: "#0ea5e9",
  },
  {
    key: "driftStressDelta",
    label: "Cognitive drift stress increase",
    desc: "How much stress increases when drift is detected",
    min: 1, max: 50, step: 1, default: 15,
    icon: "🌊", accent: "#6366f1",
  },
];

const StressConfigPanel = () => {
  const [config,  setConfig]  = useState({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    api.get("/user/stress-config")
      .then(res => setConfig(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key, value) =>
    setConfig(prev => ({ ...prev, [key]: Number(value) }));

  const save = async () => {
    setSaving(true); setSaved(false);
    try {
      const res = await api.post("/user/stress-config", config);
      setConfig(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { alert("❌ Failed to save settings"); }
    finally { setSaving(false); }
  };

  const reset = async () => {
    if (!window.confirm("Reset to default settings?")) return;
    try {
      await api.delete("/user/stress-config");
      const res = await api.get("/user/stress-config");
      setConfig(res.data);
    } catch { alert("❌ Failed to reset"); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes sc2FadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sc2Spin   { to { transform:rotate(360deg); } }
        @keyframes sc2Pop    { 0%{transform:scale(.9);opacity:0} 60%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }

        .sc2-wrap {
          font-family:'Plus Jakarta Sans',sans-serif;
          background:rgba(255,255,255,.82);
          backdrop-filter:blur(22px) saturate(180%);
          -webkit-backdrop-filter:blur(22px) saturate(180%);
          border:1.5px solid rgba(99,102,241,.13);
          border-radius:20px;padding:24px;
          box-shadow:0 4px 28px rgba(99,102,241,.09),inset 0 1px 0 rgba(255,255,255,.9);
          animation:sc2FadeUp .4s ease both;
          max-width:680px; margin:0 auto;
        }

        .sc2-hdr {
          display:flex;align-items:flex-start;justify-content:space-between;
          margin-bottom:24px;padding-bottom:16px;
          border-bottom:1px solid rgba(99,102,241,.09);
          gap:14px;
        }
        .sc2-hdr-left { display:flex;align-items:flex-start;gap:12px; }
        .sc2-hdr-badge {
          width:40px;height:40px;border-radius:12px;flex-shrink:0;
          background:linear-gradient(135deg,rgba(139,92,246,.14),rgba(99,102,241,.1));
          border:1.5px solid rgba(139,92,246,.2);
          display:flex;align-items:center;justify-content:center;font-size:20px;
        }
        .sc2-hdr-title { font-size:15px;font-weight:800;color:#1e1b4b;letter-spacing:-.01em;margin-bottom:3px; }
        .sc2-hdr-sub   { font-size:12px;color:rgba(99,102,241,.45);font-weight:500;line-height:1.5; }

        .sc2-reset-btn {
          font-size:12.5px;font-weight:600;
          color:rgba(220,38,38,.55);background:none;border:none;cursor:pointer;
          font-family:'Plus Jakarta Sans',sans-serif;transition:color .15s;
          padding:4px 8px;border-radius:8px;white-space:nowrap;flex-shrink:0;
        }
        .sc2-reset-btn:hover { color:#dc2626;background:rgba(220,38,38,.07); }

        .sc2-spinner-wrap { display:flex;align-items:center;justify-content:center;padding:48px; }
        .sc2-spinner { width:28px;height:28px;border-radius:50%;border:3px solid rgba(99,102,241,.15);border-top-color:#6366f1;animation:sc2Spin .7s linear infinite; }

        .sc2-fields { display:flex;flex-direction:column;gap:20px; }

        .sc2-field {
          background:rgba(238,240,255,.4);border:1.5px solid rgba(99,102,241,.1);
          border-radius:16px;padding:16px 18px;
          transition:border-color .2s,box-shadow .2s;
        }
        .sc2-field:hover { border-color:rgba(99,102,241,.25);box-shadow:0 3px 16px rgba(99,102,241,.08); }

        .sc2-field-top {
          display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;gap:12px;
        }
        .sc2-field-left { display:flex;align-items:center;gap:9px; }
        .sc2-field-icon {
          width:28px;height:28px;border-radius:8px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;font-size:14px;
          background:rgba(99,102,241,.09);
        }
        .sc2-field-label { font-size:13.5px;font-weight:700;color:#1e1b4b; }
        .sc2-field-val   { font-size:15px;font-weight:900;letter-spacing:-.03em;min-width:44px;text-align:right; }
        .sc2-field-desc  { font-size:11.5px;color:rgba(99,102,241,.45);font-weight:500;margin-bottom:10px;padding-left:37px; }

        /* custom range slider */
        .sc2-range {
          -webkit-appearance:none;appearance:none;
          width:100%;height:5px;border-radius:5px;outline:none;cursor:pointer;
          transition:opacity .15s;
        }
        .sc2-range::-webkit-slider-thumb {
          -webkit-appearance:none;appearance:none;
          width:18px;height:18px;border-radius:50%;
          border:2.5px solid #fff;
          box-shadow:0 2px 8px rgba(99,102,241,.35);
          cursor:pointer;transition:transform .15s;
        }
        .sc2-range::-webkit-slider-thumb:hover { transform:scale(1.2); }
        .sc2-range::-moz-range-thumb {
          width:18px;height:18px;border-radius:50%;border:2.5px solid #fff;
          box-shadow:0 2px 8px rgba(99,102,241,.35);cursor:pointer;
        }
        .sc2-range-ticks {
          display:flex;justify-content:space-between;
          font-size:10.5px;font-weight:600;color:rgba(99,102,241,.35);
          margin-top:4px;padding:0 2px;
        }

        /* save button */
        .sc2-save-btn {
          margin-top:24px;width:100%;padding:13px;border-radius:14px;
          font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:800;
          color:#fff;border:none;cursor:pointer;
          transition:all .22s;position:relative;overflow:hidden;
          letter-spacing:.01em;
        }
        .sc2-save-btn.idle {
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          box-shadow:0 4px 18px rgba(99,102,241,.38);
        }
        .sc2-save-btn.idle::before {
          content:'';position:absolute;inset:0;
          background:linear-gradient(120deg,transparent,rgba(255,255,255,.2),transparent);
          transform:translateX(-100%);transition:transform .5s;
        }
        .sc2-save-btn.idle:hover::before { transform:translateX(100%); }
        .sc2-save-btn.idle:hover { transform:translateY(-2px);box-shadow:0 8px 28px rgba(99,102,241,.46); }
        .sc2-save-btn.saving { background:rgba(99,102,241,.35);cursor:not-allowed; }
        .sc2-save-btn.done   { background:linear-gradient(135deg,#059669,#0d9488);box-shadow:0 4px 18px rgba(5,150,105,.35);animation:sc2Pop .35s ease both; }
      `}</style>

      <div className="sc2-wrap">
        {/* Header */}
        <div className="sc2-hdr">
          <div className="sc2-hdr-left">
            <div className="sc2-hdr-badge">🧠</div>
            <div>
              <div className="sc2-hdr-title">Stress Detection Settings</div>
              <div className="sc2-hdr-sub">
                Personalise how sensitive the real-time<br />stress monitor is during exams
              </div>
            </div>
          </div>
          <button className="sc2-reset-btn" onClick={reset}>↺ Reset defaults</button>
        </div>

        {loading ? (
          <div className="sc2-spinner-wrap"><div className="sc2-spinner" /></div>
        ) : (
          <>
            <div className="sc2-fields">
              {FIELDS.map(f => {
                const value    = config[f.key] ?? f.default;
                const pct      = ((value - f.min) / (f.max - f.min)) * 100;
                const unit     = f.key.includes("Seconds") ? "s" : "%";
                const trackBg  = `linear-gradient(90deg, ${f.accent} ${pct}%, rgba(99,102,241,.12) ${pct}%)`;

                return (
                  <div key={f.key} className="sc2-field">
                    <div className="sc2-field-top">
                      <div className="sc2-field-left">
                        <div className="sc2-field-icon">{f.icon}</div>
                        <div className="sc2-field-label">{f.label}</div>
                      </div>
                      <div className="sc2-field-val" style={{ color: f.accent }}>
                        {value}{unit}
                      </div>
                    </div>
                    <div className="sc2-field-desc">{f.desc}</div>
                    <input
                      type="range"
                      min={f.min} max={f.max} step={f.step} value={value}
                      onChange={e => handleChange(f.key, e.target.value)}
                      className="sc2-range"
                      style={{
                        background: trackBg,
                        "--thumb-color": f.accent,
                      }}
                    />
                    <div className="sc2-range-ticks">
                      <span>{f.min}</span>
                      <span>{f.max}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={save}
              disabled={saving}
              className={`sc2-save-btn ${saving ? "saving" : saved ? "done" : "idle"}`}
            >
              {saving ? "Saving…" : saved ? "✓ Settings Saved!" : "💾 Save Settings"}
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default StressConfigPanel;