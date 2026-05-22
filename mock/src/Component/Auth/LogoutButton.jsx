import { useNavigate } from "react-router-dom";

/**
 * LogoutButton — Light Glassmorphic
 *
 * variant="default"    ghost red pill  (navbars, sidebars)
 * variant="prominent"  filled gradient (standalone pages)
 * variant="minimal"    text-only       (dropdowns, tight spaces)
 * variant="icon"       icon-only circle (very tight spaces)
 */
const LogoutButton = ({ variant = "default" }) => {
  const navigate = useNavigate();

  const logout = () => {
    ["token", "role", "name", "userId"].forEach(k => localStorage.removeItem(k));
    navigate("/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        /* ── shared base ── */
        .lgb2 {
          display: inline-flex; align-items: center; gap: 7px;
          border: none; cursor: pointer; outline: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700; letter-spacing: .01em;
          transition: all .22s cubic-bezier(.4,0,.2,1);
          white-space: nowrap; position: relative; overflow: hidden;
          /* ripple on click */
        }
        /* shimmer sweep on hover */
        .lgb2::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(120deg,transparent 25%,rgba(255,255,255,.36),transparent 75%);
          transform: translateX(-100%);
          transition: transform .5s ease;
          pointer-events: none;
        }
        .lgb2:hover::before { transform: translateX(100%); }
        .lgb2:active { transform: scale(.96) !important; }
        .lgb2-ico { font-size: 15px; line-height: 1; flex-shrink: 0; }

        /* ════ DEFAULT — soft glass ghost ════ */
        .lgb2--default {
          padding: 9px 18px;
          border-radius: 11px;
          background: rgba(239,68,68,.08);
          color: #dc2626;
          border: 1.5px solid rgba(239,68,68,.2);
          backdrop-filter: blur(12px) saturate(160%);
          font-size: 13.5px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.65), 0 2px 8px rgba(239,68,68,.08);
        }
        .lgb2--default:hover {
          background: rgba(239,68,68,.15);
          border-color: rgba(239,68,68,.35);
          color: #b91c1c;
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 20px rgba(239,68,68,.2), inset 0 1px 0 rgba(255,255,255,.65);
        }

        /* ════ PROMINENT — gradient fill ════ */
        .lgb2--prominent {
          padding: 12px 26px;
          border-radius: 13px;
          background: linear-gradient(135deg,#ef4444,#dc2626,#b91c1c);
          background-size: 200% 200%;
          background-position: 0% 50%;
          color: #fff;
          font-size: 14.5px;
          box-shadow: 0 6px 22px rgba(239,68,68,.36), inset 0 1px 0 rgba(255,255,255,.2);
        }
        .lgb2--prominent:hover {
          background-position: 100% 50%;
          transform: translateY(-3px) !important;
          box-shadow: 0 12px 32px rgba(239,68,68,.48), inset 0 1px 0 rgba(255,255,255,.2);
          filter: brightness(1.08);
        }

        /* ════ MINIMAL — link style ════ */
        .lgb2--minimal {
          padding: 6px 12px;
          border-radius: 9px;
          background: transparent;
          color: rgba(220,38,38,.75);
          font-size: 13px;
          border: none;
        }
        .lgb2--minimal::before { display: none; }
        .lgb2--minimal:hover {
          background: rgba(239,68,68,.08);
          color: #dc2626;
          transform: none !important;
        }

        /* ════ ICON — circle icon-only ════ */
        .lgb2--icon {
          width: 38px; height: 38px;
          border-radius: 50%; padding: 0;
          background: rgba(239,68,68,.09);
          color: #dc2626;
          border: 1.5px solid rgba(239,68,68,.2);
          backdrop-filter: blur(12px);
          font-size: 17px;
          justify-content: center;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.6);
          position: relative;
        }
        .lgb2--icon .lgb2-ring {
          position: absolute; inset: -4px; border-radius: 50%;
          border: 2px solid transparent;
          background: linear-gradient(135deg,rgba(239,68,68,.5),rgba(239,68,68,.15)) border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: destination-out; mask-composite: exclude;
          opacity: 0; transition: opacity .25s;
          animation: ringPulse 2s ease-in-out infinite;
        }
        @keyframes ringPulse { 0%,100%{opacity:.3} 50%{opacity:.8} }
        .lgb2--icon:hover {
          background: rgba(239,68,68,.16);
          border-color: rgba(239,68,68,.35);
          transform: scale(1.1) !important;
          box-shadow: 0 6px 20px rgba(239,68,68,.22), inset 0 1px 0 rgba(255,255,255,.6);
        }
        .lgb2--icon:hover .lgb2-ring { opacity: 1; }

        /* ── tooltip on icon variant ── */
        .lgb2-tip-wrap { position: relative; display: inline-flex; }
        .lgb2-tip {
          position: absolute; top: calc(100% + 8px); left: 50%;
          transform: translateX(-50%) scale(.88);
          background: rgba(30,27,75,.9); backdrop-filter: blur(12px);
          color: #fff; font-size: 11.5px; font-weight: 700;
          padding: 5px 11px; border-radius: 8px; white-space: nowrap;
          pointer-events: none; opacity: 0;
          transition: all .2s cubic-bezier(.34,1.56,.64,1);
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-shadow: 0 4px 14px rgba(0,0,0,.18);
        }
        .lgb2-tip::before {
          content: '';
          position: absolute; top: -4px; left: 50%; transform: translateX(-50%);
          width: 8px; height: 8px; background: rgba(30,27,75,.9);
          clip-path: polygon(0 100%,50% 0,100% 100%);
        }
        .lgb2-tip-wrap:hover .lgb2-tip {
          opacity: 1; transform: translateX(-50%) scale(1);
        }
      `}</style>

      {variant === "icon" ? (
        <span className="lgb2-tip-wrap">
          <button className="lgb2 lgb2--icon" onClick={logout} title="Logout" aria-label="Logout">
            🚪
            <span className="lgb2-ring" />
          </button>
          <span className="lgb2-tip">Logout</span>
        </span>
      ) : (
        <button className={`lgb2 lgb2--${variant}`} onClick={logout} title="Logout">
          <span className="lgb2-ico">🚪</span>
          Logout
        </button>
      )}
    </>
  );
};

export default LogoutButton;