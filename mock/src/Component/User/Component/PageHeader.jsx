import React from "react";

export function PageHeader({ title, desc, emoji, back, action, eyebrow }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes phFadeUp { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ph2Wiggle { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-8deg)} 75%{transform:rotate(8deg)} }

        .ph2-wrap {
          display:flex;justify-content:space-between;align-items:flex-end;
          margin-bottom:26px;flex-wrap:wrap;gap:14px;
          font-family:'Plus Jakarta Sans',sans-serif;
        }
        .ph2-eyebrow {
          display:inline-flex;align-items:center;gap:6px;
          font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
          color:#6366f1;background:rgba(99,102,241,.09);
          border:1px solid rgba(99,102,241,.18);border-radius:20px;
          padding:4px 12px;margin-bottom:9px;
        }
        .ph2-eyebrow::before { content:'';width:5px;height:5px;border-radius:50%;background:#6366f1; }
        .ph2-title-row {
          display:flex;align-items:center;gap:12px;margin-bottom:6px;
          animation:phFadeUp .4s ease both;
        }
        .ph2-back {
          width:36px;height:36px;border-radius:11px;
          background:rgba(255,255,255,.82);backdrop-filter:blur(12px);
          border:1.5px solid rgba(99,102,241,.16);
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;color:rgba(67,56,202,.65);font-size:16px;
          transition:all .2s;flex-shrink:0;box-shadow:0 2px 10px rgba(99,102,241,.1);
        }
        .ph2-back:hover { border-color:#6366f1;color:#4f46e5;background:rgba(238,240,255,.95);transform:translateX(-2px); }
        .ph2-title { font-weight:900;font-size:26px;color:#1e1b4b;margin:0;letter-spacing:-.03em;line-height:1.15; }
        .ph2-emoji { font-size:26px;animation:ph2Wiggle 2.5s ease-in-out infinite; }
        .ph2-desc { color:rgba(99,102,241,.5);font-size:14px;font-weight:400;margin:0;animation:phFadeUp .4s ease .06s both; }
      `}</style>

      <div className="ph2-wrap">
        <div>
          {eyebrow && <div className="ph2-eyebrow">{eyebrow}</div>}
          <div className="ph2-title-row">
            {back && (
              <button className="ph2-back" onClick={back} aria-label="Back">←</button>
            )}
            <h1 className="ph2-title">{title}</h1>
            {emoji && <span className="ph2-emoji">{emoji}</span>}
          </div>
          {desc && (
            <p className="ph2-desc" style={{ paddingLeft: back ? 48 : 0 }}>{desc}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </>
  );
}
