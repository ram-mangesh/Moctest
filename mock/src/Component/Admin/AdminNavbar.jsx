import { useNavigate } from "react-router-dom";
import { useState } from "react";

const AdminNavbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const name = localStorage.getItem("name") || "Admin";
  const firstLetter = name.charAt(0).toUpperCase();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    setOpen(false);
    navigate("/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Sora:wght@600;700;800&display=swap');

        .ln-nav {
          position: sticky; top: 0; z-index: 200;
          display: flex; align-items: center; justify-content: space-between;
          height: 64px; padding: 0 24px; gap: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(24px) saturate(200%);
          -webkit-backdrop-filter: blur(24px) saturate(200%);
          border-bottom: 1.5px solid rgba(99,102,241,0.14);
          box-shadow: 0 2px 20px rgba(99,102,241,0.08), inset 0 -1px 0 rgba(99,102,241,0.08);
          animation: lnNavIn .4s ease;
        }
        @keyframes lnNavIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

        .ln-left {
          display: flex; align-items: center; gap: 11px;
          cursor: pointer; flex-shrink: 0;
          animation: lnSlideR .5s ease;
        }
        @keyframes lnSlideR { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }

        .ln-hamburger {
          display: none; width: 36px; height: 36px; border-radius: 10px;
          background: rgba(99,102,241,.1); border: none; cursor: pointer;
          align-items: center; justify-content: center;
          flex-direction: column; gap: 4px; padding: 0;
          transition: all .2s; flex-shrink: 0;
        }
        .ln-hamburger:hover { background: rgba(99,102,241,.18); transform: scale(1.05); }
        .ln-hamburger span {
          display: block; width: 16px; height: 2px;
          background: #6366f1; border-radius: 2px; transition: all .3s;
        }
        @media(max-width:900px) { .ln-hamburger { display: flex !important; } }

        .ln-logo-box {
          width: 38px; height: 38px; border-radius: 11px;
          background: linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
          box-shadow: 0 4px 16px rgba(99,102,241,.35);
          animation: lnSpinIn .8s cubic-bezier(.34,1.56,.64,1);
          transition: transform .3s;
        }
        .ln-logo-box:hover { transform: scale(1.08) rotate(5deg); }
        @keyframes lnSpinIn { from{transform:rotate(-180deg) scale(0)} to{transform:rotate(0) scale(1)} }

        .ln-brand-main {
          font-family: 'Sora', sans-serif;
          font-size: 16px; font-weight: 800; letter-spacing: -.03em;
          background: linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .ln-brand-sub {
          font-size: 9px; font-weight: 700; letter-spacing: .14em;
          color: rgba(99,102,241,.45); text-transform: uppercase; margin-top: 1px;
        }

        .ln-center { flex:1; text-align:center; }
        .ln-tagline {
          font-size: 12px; font-weight: 600; letter-spacing: .06em;
          background: linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          opacity: .7;
        }
        @media(max-width:640px){ .ln-center { display:none; } }

        .ln-right { display: flex; align-items: center; gap: 12px; }

        .ln-live {
          display: flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 20px;
          background: rgba(16,185,129,.1);
          border: 1.5px solid rgba(16,185,129,.25);
          font-size: 11px; font-weight: 700; color: #059669;
          animation: livePulse 2.5s ease-in-out infinite;
        }
        @keyframes livePulse { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.25)} 50%{box-shadow:0 0 10px rgba(16,185,129,.3)} }
        .ln-live-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #10b981;
          flex-shrink: 0; animation: liveDot 1.5s ease-in-out infinite;
        }
        @keyframes liveDot { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.5)} 50%{box-shadow:0 0 0 4px rgba(16,185,129,.0)} }
        @media(max-width:640px) { .ln-live { display:none !important; } }

        .ln-welcome {
          font-size: 13px; color: rgba(99,102,241,.6); white-space:nowrap;
        }
        .ln-welcome strong { color: #4338ca; font-weight: 800; }
        @media(max-width:640px){ .ln-welcome { display:none; } }

        /* Avatar */
        .ln-ava-wrap { position:relative; }
        .ln-ava-btn {
          position: relative; width: 38px; height: 38px; border-radius: 50%;
          background: linear-gradient(135deg,#6366f1,#ec4899);
          border: 2.5px solid rgba(255,255,255,.9);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: transform .2s, box-shadow .2s;
          box-shadow: 0 4px 14px rgba(99,102,241,.3);
        }
        .ln-ava-btn:hover { transform: scale(1.1); box-shadow: 0 0 22px rgba(99,102,241,.45); }
        .ln-ava-letter { color: #fff; font-size: 15px; font-weight: 900; }
        .ln-ava-ring {
          position: absolute; inset: -4px; border-radius: 50%;
          border: 2px solid transparent;
          background: linear-gradient(135deg,#6366f1,#ec4899) border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: destination-out; mask-composite: exclude;
          animation: ringPulse 2.5s ease-in-out infinite;
        }
        @keyframes ringPulse { 0%,100%{opacity:.4} 50%{opacity:1} }

        /* Dropdown */
        .ln-dd-bg { position:fixed; inset:0; z-index:150; }
        .ln-dd {
          position: absolute; top: 48px; right: 0;
          width: 215px; border-radius: 18px; overflow: hidden; z-index:200;
          background: rgba(255,255,255,.97);
          backdrop-filter: blur(28px) saturate(200%);
          border: 1.5px solid rgba(99,102,241,.18);
          box-shadow: inset 0 1px 0 rgba(255,255,255,1), 0 20px 60px rgba(99,102,241,.2);
          animation: ddIn .22s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes ddIn { from{opacity:0;transform:scale(.88) translateY(-10px)} to{opacity:1;transform:scale(1) translateY(0)} }

        .ln-dd-head {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 16px;
          background: linear-gradient(135deg,rgba(99,102,241,.08),rgba(168,85,247,.05));
          border-bottom: 1px solid rgba(99,102,241,.1);
        }
        .ln-dd-ava {
          width: 36px; height: 36px; border-radius: 50%; flex-shrink:0;
          background: linear-gradient(135deg,#6366f1,#ec4899);
          color: #fff; font-size: 14px; font-weight: 900;
          display: flex; align-items: center; justify-content: center;
        }
        .ln-dd-name { font-size: 13.5px; font-weight: 800; color: #1e1b4b; }
        .ln-dd-role { font-size: 11px; color: rgba(99,102,241,.6); margin-top: 2px; }

        .ln-dd-item {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 12px 16px;
          font-size: 13px; font-weight: 600; border: none; cursor: pointer;
          text-align: left; transition: all .18s;
          background: transparent; color: #4338ca;
          font-family: 'Plus Jakarta Sans', sans-serif;
          border-bottom: 1px solid rgba(99,102,241,.06);
        }
        .ln-dd-item:last-child { border-bottom: none; }
        .ln-dd-item:hover { background: rgba(99,102,241,.06); padding-left: 20px; }
        .ln-dd-item.danger { color: #dc2626; }
        .ln-dd-item.danger:hover { background: rgba(239,68,68,.06); }
        .ln-dd-icon { font-size: 15px; }
      `}</style>

      <nav className="ln-nav">
        <div className="ln-left" onClick={() => navigate("/admin")}>
          <button
            className="ln-hamburger"
            onClick={e => { e.stopPropagation(); onMenuClick?.(); }}
            aria-label="Open menu"
          >
            <span /><span /><span />
          </button>
          <div className="ln-logo-box">🎓</div>
          <div>
            <div className="ln-brand-main">ExamPrep</div>
            <div className="ln-brand-sub">Admin Portal</div>
          </div>
        </div>

        <div className="ln-center">
          <span className="ln-tagline">✦ Manage · Create · Inspire</span>
        </div>

        <div className="ln-right">
          <div className="ln-live">
            <span className="ln-live-dot" />
            Live
          </div>
          <span className="ln-welcome">Welcome, <strong>{name}</strong></span>
          <div className="ln-ava-wrap">
            <button className="ln-ava-btn" onClick={() => setOpen(o => !o)}>
              <span className="ln-ava-letter">{firstLetter}</span>
              <span className="ln-ava-ring" />
            </button>
            {open && (
              <>
                <div className="ln-dd-bg" onClick={() => setOpen(false)} />
                <div className="ln-dd">
                  <div className="ln-dd-head">
                    <div className="ln-dd-ava">{firstLetter}</div>
                    <div>
                      <div className="ln-dd-name">{name}</div>
                      <div className="ln-dd-role">Administrator</div>
                    </div>
                  </div>
                  <button className="ln-dd-item" onClick={() => { navigate("/admin"); setOpen(false); }}>
                    <span className="ln-dd-icon">🏠</span> Dashboard
                  </button>
                  <button className="ln-dd-item danger" onClick={logout}>
                    <span className="ln-dd-icon">🚪</span> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default AdminNavbar;