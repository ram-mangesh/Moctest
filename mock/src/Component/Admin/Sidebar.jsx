import { useState } from "react";
import { useNavigate } from "react-router-dom";

const NAV = [
  { id: "exam",        icon: "📋", label: "Exam Manager",     color: "#2563eb", rgb: "37,99,235"   },
  { id: "subject",     icon: "📚", label: "Subject Manager",  color: "#7c3aed", rgb: "124,58,237"  },
  { id: "topic",       icon: "🏷️",  label: "Topic Manager",    color: "#0d9488", rgb: "13,148,136"  },
  { id: "question",    icon: "❓", label: "Question Manager", color: "#d97706", rgb: "217,119,6"   },
  { id: "ai",          icon: "🤖", label: "AI Generator",     color: "#059669", rgb: "5,150,105"   },
  { id: "annotations", icon: "✏️", label: "Annotations",      color: "#0891b2", rgb: "8,145,178"   },
  { id: "students",    icon: "👨‍🎓", label: "Student Insights", color: "#dc2626", rgb: "220,38,38"   },
  { id: "overview",    icon: "📊", label: "Platform Overview", color: "#6366f1", rgb: "99,102,241"  },
  { id: "difficulty",  icon: "🎯", label: "Difficulty Analyzer",color: "#ea580c", rgb: "234,88,12"   },
  { id: "notifications",icon: "🔔", label: "Alert Center",     color: "#8b5cf6", rgb: "139,92,246"  },
  { id: "wellbeing",   icon: "⌚", label: "Wellbeing Monitor",color: "#10b981", rgb: "16,185,129"  },
];

/**
 * Layout architecture — single merged glassmorphic shell:
 *
 * ┌────────────────────────────────────────────────────────┐ ← TOPBAR (fixed, full width, h=64, z=201)
 * │ [🎓 ExamPrep] │ [/ ExamMgr]  🔍 Search  ··· Live 🔔 [A]│
 * │   sidebar cell │         navbar cell                    │
 * ├────────────────┼───────────────────────────────────────┤
 * │  SIDEBAR NAV   │   MAIN CONTENT AREA                   │
 * │  (264px)       │                                       │
 * │  • nav items   │                                       │
 * │  • user card   │                                       │
 * └────────────────┴───────────────────────────────────────┘
 *
 * Key trick: the topbar is rendered as two cells.
 * Left cell (264px wide, border-right) = brand, visually identical
 * to sidebar background — they share one continuous glass surface.
 * Right cell (flex:1) = breadcrumb, search, controls — sits above main.
 *
 * On mobile (<900px): sidebar slides off-screen, topbar left cell hides,
 * hamburger appears in right cell.
 */
export function Sidebar({ open, activeTab, setTab, onClose, onHamburger }) {
  const navigate = useNavigate();
  const [dd, setDd]       = useState(false);
  const [search, setSearch] = useState("");

  const name   = localStorage.getItem("name") || "Admin";
  const letter = name.charAt(0).toUpperCase();
  const active = NAV.find(n => n.id === activeTab);

  const logout = () => {
    ["token","name","role"].forEach(k => localStorage.removeItem(k));
    setDd(false);
    navigate("/login");
  };

  const filtered = search.trim()
    ? NAV.filter(n => n.label.toLowerCase().includes(search.toLowerCase()))
    : NAV;

  /* Glass recipe used for both topbar and sidebar — identical values */
  const GLASS_BG     = "rgba(255,255,255,0.98)";
  const GLASS_BLUR   = "blur(28px) saturate(200%)";
  const GLASS_BORDER = "rgba(37,99,235,0.08)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Sora:wght@600;700;800&display=swap');

        /* ────────────────────────────────────────
           TOPBAR — spans full viewport width
        ──────────────────────────────────────── */
        .lgt-bar {
          position: fixed; top: 0; left: 0; right: 0;
          height: 64px; z-index: 201;
          display: flex; align-items: stretch;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: ${GLASS_BG};
          backdrop-filter: ${GLASS_BLUR};
          -webkit-backdrop-filter: ${GLASS_BLUR};
          border-bottom: 1.5px solid ${GLASS_BORDER};
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.92),
            0 4px 32px rgba(37,99,235,.08);
          animation: lgtBarIn .4s ease both;
        }
        @keyframes lgtBarIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }

        /* Left cell: brand area — same width as sidebar */
        .lgt-brand-cell {
          width: 264px; min-width: 264px; flex-shrink: 0;
          display: flex; align-items: center; gap: 11px;
          padding: 0 20px;
          /* The only divider between "sidebar" and "topbar right" */
          border-right: 1.5px solid ${GLASS_BORDER};
          cursor: pointer;
          position: relative;
          transition: opacity .2s;
        }
        .lgt-brand-cell:hover { opacity: .88; }
        /* Gradient accent underline tying topbar-left to sidebar column */
        .lgt-brand-cell::after {
          content: '';
          position: absolute; bottom: -1px; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, rgba(37,99,235,.55), rgba(13,148,136,.4), transparent);
        }
        @media(max-width:900px) { .lgt-brand-cell { display: none !important; } }

        .lgt-logo {
          width: 36px; height: 36px; border-radius: 11px; flex-shrink: 0;
          background: linear-gradient(135deg,#2563eb,#0d9488);
          display: flex; align-items: center; justify-content: center; font-size: 19px;
          box-shadow: 0 4px 14px rgba(37,99,235,.3);
          animation: logoFloat 4s ease-in-out infinite;
          transition: transform .28s cubic-bezier(.34,1.56,.64,1);
        }
        .lgt-logo:hover { transform: scale(1.1) rotate(6deg) !important; }
        @keyframes logoFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }

        .lgt-brand-name {
          font-family: 'Sora', sans-serif; font-size: 14.5px; font-weight: 800; letter-spacing: -.025em;
          background: linear-gradient(135deg,#2563eb,#0d9488);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          line-height: 1.2;
        }
        .lgt-brand-sub {
          font-size: 8px; font-weight: 700; letter-spacing: .16em;
          color: rgba(37,99,235,.38); text-transform: uppercase; display: block; margin-top: 1px;
        }

        /* Right cell: fills rest of topbar, above main content */
        .lgt-nav-cell {
          flex: 1; display: flex; align-items: center; gap: 12px;
          padding: 0 22px;
        }

        /* Hamburger (mobile only) */
        .lgt-burger {
          display: none; width: 38px; height: 38px; border-radius: 11px;
          background: rgba(37,99,235,.08); border: 1.5px solid rgba(37,99,235,.14);
          flex-direction: column; align-items: center; justify-content: center;
          gap: 4.5px; cursor: pointer; flex-shrink: 0; transition: all .2s;
        }
        .lgt-burger:hover { background: rgba(37,99,235,.16); transform: scale(1.04); }
        .lgt-burger span { display: block; width: 17px; height: 2px; background: #2563eb; border-radius: 2px; }
        @media(max-width:900px) { .lgt-burger { display: flex !important; } }

        /* Breadcrumb pill */
        .lgt-crumb {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 13px; border-radius: 10px;
          transition: all .22s;
          animation: crumbIn .38s ease both;
          white-space: nowrap; flex-shrink: 0;
        }
        @keyframes crumbIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        .lgt-crumb-root { font-size: 11px; color: rgba(37,99,235,.45); font-weight: 600; }
        .lgt-crumb-sep  { font-size: 13px; color: rgba(37,99,235,.3); }
        .lgt-crumb-icon { font-size: 16px; }
        .lgt-crumb-name { font-size: 13.5px; font-weight: 800; letter-spacing: -.01em; }

        /* Search */
        .lgt-search {
          flex: 1; max-width: 300px;
          display: flex; align-items: center; gap: 8px;
          background: rgba(37,99,235,.05);
          border: 1.5px solid rgba(37,99,235,.13);
          border-radius: 11px; padding: 8px 13px;
          transition: all .22s;
        }
        .lgt-search:focus-within {
          background: rgba(255,255,255,.95);
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,.12);
        }
        .lgt-search input {
          border: none; outline: none; background: transparent;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px; color: #0f172a; width: 100%;
        }
        .lgt-search input::placeholder { color: rgba(37,99,235,.36); }
        .lgt-search-clear {
          background: none; border: none; cursor: pointer;
          color: rgba(37,99,235,.4); font-size: 16px; line-height: 1;
          padding: 0; transition: color .15s;
        }
        .lgt-search-clear:hover { color: rgba(37,99,235,.75); }
        @media(max-width:640px) { .lgt-search { max-width: 160px; } }

        /* Spacer */
        .lgt-spacer { flex: 1; }

        /* Live badge */
        .lgt-live {
          display: flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 20px; flex-shrink: 0;
          background: rgba(16,185,129,.09); border: 1.5px solid rgba(16,185,129,.22);
          font-size: 11px; font-weight: 700; color: #059669;
          animation: liveGlow 2.5s ease-in-out infinite;
        }
        @keyframes liveGlow { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.18)} 50%{box-shadow:0 0 10px rgba(16,185,129,.28)} }
        .lgt-live-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #10b981; flex-shrink: 0;
          animation: dotPulse 1.6s ease-in-out infinite;
        }
        @keyframes dotPulse { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.5);transform:scale(1)} 50%{box-shadow:0 0 0 4px rgba(16,185,129,.0);transform:scale(1.1)} }
        @media(max-width:640px) { .lgt-live { display: none !important; } }

        /* Bell */
        .lgt-bell {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          background: rgba(37,99,235,.07); border: 1.5px solid rgba(37,99,235,.13);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 17px; transition: all .2s; position: relative;
        }
        .lgt-bell:hover { background: rgba(37,99,235,.14); transform: scale(1.06); }
        .lgt-bell-dot {
          position: absolute; top: 6px; right: 7px; width: 7px; height: 7px;
          border-radius: 50%; background: #0d9488; border: 2px solid rgba(255,255,255,.9);
          animation: dotPulse 2s ease-in-out infinite;
        }
        @media(max-width:480px) { .lgt-bell { display: none !important; } }

        /* Welcome text */
        .lgt-welcome {
          font-size: 12.5px; color: rgba(37,99,235,.55); white-space: nowrap; flex-shrink: 0;
        }
        .lgt-welcome strong { color: #1e40af; font-weight: 800; }
        @media(max-width:900px) { .lgt-welcome { display: none !important; } }

        /* Avatar */
        .lgt-ava-wrap { position: relative; flex-shrink: 0; }
        .lgt-ava-btn {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg,#2563eb,#0d9488);
          border: 2.5px solid rgba(255,255,255,.92);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 13.5px; font-weight: 900; outline: none;
          box-shadow: 0 4px 12px rgba(37,99,235,.28);
          transition: transform .2s, box-shadow .2s; position: relative;
        }
        .lgt-ava-btn:hover { transform: scale(1.12); box-shadow: 0 0 22px rgba(37,99,235,.42); }
        .lgt-ava-ring {
          position: absolute; inset: -3px; border-radius: 50%;
          border: 2px solid transparent;
          background: linear-gradient(135deg,#2563eb,#0d9488) border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: destination-out; mask-composite: exclude;
          animation: ringPulse 2.5s ease-in-out infinite;
        }
        @keyframes ringPulse { 0%,100%{opacity:.35} 50%{opacity:1} }

        /* Dropdown */
        .lgt-dd-bg { position: fixed; inset: 0; z-index: 300; }
        .lgt-dd {
          position: absolute; top: 48px; right: 0; width: 220px;
          border-radius: 18px; overflow: hidden; z-index: 301;
          background: rgba(255,255,255,.98);
          backdrop-filter: blur(24px) saturate(200%);
          border: 1.5px solid rgba(37,99,235,.18);
          box-shadow: 0 20px 60px rgba(37,99,235,.22), inset 0 1px 0 rgba(255,255,255,1);
          animation: ddIn .22s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes ddIn { from{opacity:0;transform:scale(.88) translateY(-8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .lgt-dd-head {
          display: flex; align-items: center; gap: 10px; padding: 14px 16px;
          background: linear-gradient(135deg,rgba(37,99,235,.08),rgba(13,148,136,.05));
          border-bottom: 1px solid rgba(37,99,235,.09);
        }
        .lgt-dd-ava {
          width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg,#2563eb,#0d9488);
          color: #fff; font-size: 14px; font-weight: 900;
          display: flex; align-items: center; justify-content: center;
        }
        .lgt-dd-name { font-size: 13px; font-weight: 800; color: #0f172a; }
        .lgt-dd-role { font-size: 10.5px; color: rgba(37,99,235,.6); margin-top: 1px; }
        .lgt-dd-item {
          display: flex; align-items: center; gap: 9px;
          width: 100%; padding: 11px 16px;
          font-size: 13px; font-weight: 600; border: none; cursor: pointer;
          text-align: left; background: transparent; color: #1e40af;
          font-family: 'Plus Jakarta Sans', sans-serif;
          border-bottom: 1px solid rgba(37,99,235,.06);
          transition: all .16s;
        }
        .lgt-dd-item:last-child { border-bottom: none; }
        .lgt-dd-item:hover { background: rgba(37,99,235,.06); padding-left: 20px; }
        .lgt-dd-item.danger { color: #dc2626; }
        .lgt-dd-item.danger:hover { background: rgba(239,68,68,.06); }

        /* ────────────────────────────────────────
           SIDEBAR — starts exactly below topbar
        ──────────────────────────────────────── */
        .lgt-sb {
          position: fixed; top: 64px; left: 0; bottom: 0; width: 264px; z-index: 200;
          display: flex; flex-direction: column;
          /* Identical glass recipe — seamless with topbar */
          background: ${GLASS_BG};
          backdrop-filter: ${GLASS_BLUR};
          -webkit-backdrop-filter: ${GLASS_BLUR};
          border-right: 1.5px solid ${GLASS_BORDER};
          box-shadow: 3px 0 32px rgba(37,99,235,.07);
          transition: transform .35s cubic-bezier(.4,0,.2,1);
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        @media(min-width:901px) { .lgt-sb { transform: translateX(0) !important; } }
        @media(max-width:900px) {
          .lgt-sb { top: 62px; transform: translateX(-264px) !important; }
          .lgt-sb.open { transform: translateX(0) !important; }
          .lgt-bar { height: 62px; }
        }

        /* Nav */
        .lgt-nav { flex: 1; overflow-y: auto; padding: 8px 0 4px; }
        .lgt-nav::-webkit-scrollbar { width: 4px; }
        .lgt-nav::-webkit-scrollbar-thumb { background: rgba(37,99,235,.14); border-radius: 4px; }

        .lgt-sec-lbl {
          font-size: 9px; font-weight: 800; letter-spacing: .18em;
          text-transform: uppercase; color: rgba(37,99,235,.28);
          padding: 10px 20px 5px;
        }
        .lgt-no-result {
          padding: 18px 20px; text-align: center;
          font-size: 12.5px; color: rgba(37,99,235,.4); font-weight: 600;
        }

        /* Nav item */
        .lgt-item {
          display: flex; align-items: center; gap: 11px;
          width: calc(100% - 14px); margin: 2px 7px;
          padding: 10px 13px; border-radius: 13px;
          border: 1.5px solid transparent; outline: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13.5px; font-weight: 700;
          cursor: pointer; text-align: left;
          transition: all .22s cubic-bezier(.4,0,.2,1);
          color: rgba(67,56,202,.48); background: transparent;
          position: relative; overflow: hidden;
          animation: itemIn .38s ease both;
        }
        @keyframes itemIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
        .lgt-item:hover:not(.lgt-active) {
          background: rgba(37,99,235,.05);
          color: #1e40af; border-color: rgba(37,99,235,.1);
          transform: translateX(3px);
        }
        .lgt-item.lgt-active {
          color: var(--ic,#2563eb);
          transform: translateX(4px);
          border-color: rgba(var(--ir,37,99,235),.22);
          background: rgba(var(--ir,37,99,235),.09);
          box-shadow: 0 3px 16px rgba(var(--ir,37,99,235),.14);
        }

        /* Stripe */
        .lgt-stripe {
          position: absolute; left: 0; top: 18%; bottom: 18%; width: 3px;
          border-radius: 0 3px 3px 0;
          background: var(--ic,#2563eb); box-shadow: 0 0 8px var(--ic,#2563eb);
          animation: stripeAnim .25s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes stripeAnim { from{top:50%;bottom:50%} to{top:18%;bottom:18%} }

        /* Glow behind active */
        .lgt-glow {
          position: absolute; inset: 0; border-radius: 13px; pointer-events: none;
          background: radial-gradient(ellipse at 20% 50%, rgba(var(--ir,37,99,235),.14) 0%, transparent 70%);
          animation: glowCyc 3s ease-in-out infinite;
        }
        @keyframes glowCyc { 0%,100%{opacity:.5} 50%{opacity:1} }

        .lgt-icon {
          width: 31px; height: 31px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 16px;
          background: rgba(37,99,235,.07);
          transition: transform .22s cubic-bezier(.34,1.56,.64,1), background .22s;
        }
        .lgt-item.lgt-active .lgt-icon {
          background: rgba(var(--ir,37,99,235),.14);
          transform: scale(1.1) rotate(-4deg);
        }
        .lgt-item:hover .lgt-icon { transform: scale(1.08); }

        /* AI shimmer pill */
        .lgt-ai-pill {
          position: relative; overflow: hidden; margin-left: auto; flex-shrink: 0;
          font-size: 9px; font-weight: 900; padding: 3px 8px; border-radius: 20px;
          background: linear-gradient(135deg,#059669,#0891b2); color: #fff;
          animation: aiPulse 2.2s ease-in-out infinite;
        }
        @keyframes aiPulse { 0%,100%{box-shadow:0 0 5px rgba(16,185,129,.4)} 50%{box-shadow:0 0 14px rgba(16,185,129,.7)} }
        .lgt-ai-shim {
          position: absolute; inset: 0;
          background: linear-gradient(120deg,transparent,rgba(255,255,255,.4),transparent);
          animation: shimPass 2.5s linear infinite;
        }
        @keyframes shimPass { from{transform:translateX(-100%)} to{transform:translateX(200%)} }

        /* Footer */
        .lgt-footer {
          border-top: 1px solid rgba(37,99,235,.09);
          padding: 12px 10px; flex-shrink: 0;
        }
        .lgt-user {
          display: flex; align-items: center; gap: 10px;
          background: rgba(37,99,235,.06); border: 1px solid rgba(37,99,235,.11);
          border-radius: 13px; padding: 10px 12px;
          transition: all .2s; cursor: pointer;
        }
        .lgt-user:hover { background: rgba(37,99,235,.1); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(37,99,235,.12); }
        .lgt-uava {
          width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg,#2563eb,#0d9488);
          color: #fff; font-size: 13px; font-weight: 900;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 10px rgba(37,99,235,.26);
        }
        .lgt-uname { font-size: 12.5px; font-weight: 800; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .lgt-urole { font-size: 10px; font-weight: 600; color: #2563eb; margin-top: 1px; }
        .lgt-sdot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; animation: dotPulse 2s ease-in-out infinite; }
        .lgt-stxt { font-size: 9.5px; color: rgba(37,99,235,.42); font-weight: 600; }
        .lgt-ver {
          font-size: 8.5px; font-weight: 800; padding: 2px 8px; border-radius: 20px;
          background: rgba(37,99,235,.1); color: rgba(37,99,235,.55); letter-spacing: .08em;
          margin-left: auto; flex-shrink: 0;
        }

        /* Mobile overlay */
        .lgt-overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(37,99,235,.12); backdrop-filter: blur(4px);
          z-index: 199;
        }
        @media(max-width:900px) { .lgt-overlay.show { display: block; } }

        /* Main offset utility (used in AdminDashboard) */
        .lgt-content {
          margin-left: 264px; padding-top: 64px;
          transition: margin-left .35s cubic-bezier(.4,0,.2,1);
        }
        @media(max-width:900px) { .lgt-content { margin-left: 0 !important; padding-top: 62px !important; } }
      `}</style>

      {/* ═══════════════════════════════════════════════
          TOPBAR — full-width, merged with sidebar left cell
      ═══════════════════════════════════════════════ */}
      <header className="lgt-bar">

        {/* LEFT CELL — brand, identical glass to sidebar below */}
        <div className="lgt-brand-cell" onClick={() => navigate("/admin")}>
          <div className="lgt-logo">🎓</div>
          <div>
            <div className="lgt-brand-name">ExamPrep</div>
            <span className="lgt-brand-sub">Admin Panel</span>
          </div>
        </div>

        {/* RIGHT CELL — controls above main content */}
        <div className="lgt-nav-cell">

          {/* Mobile hamburger */}
          <button className="lgt-burger" onClick={onHamburger} aria-label="Menu">
            <span /><span /><span />
          </button>

          {/* Breadcrumb */}
          <div
            className="lgt-crumb"
            style={{
              background: `rgba(${active?.rgb || "37,99,235"},.09)`,
              border: `1.5px solid rgba(${active?.rgb || "37,99,235"},.2)`,
            }}
          >
            <span className="lgt-crumb-root">Admin</span>
            <span className="lgt-crumb-sep">/</span>
            <span className="lgt-crumb-icon">{active?.icon}</span>
            <span className="lgt-crumb-name" style={{ color: active?.color || "#2563eb" }}>
              {active?.label}
            </span>
          </div>

          {/* Search */}
          <div className="lgt-search">
            <span style={{ fontSize: 14, color: "rgba(37,99,235,.4)", flexShrink: 0 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search pages…"
              onKeyDown={e => {
                if (e.key === "Escape") setSearch("");
                if (e.key === "Enter" && filtered.length === 1) {
                  setTab(filtered[0].id); setSearch("");
                }
              }}
            />
            {search && (
              <button className="lgt-search-clear" onClick={() => setSearch("")}>×</button>
            )}
          </div>

          <div className="lgt-spacer" />

          {/* Live indicator */}
          <div className="lgt-live">
            <span className="lgt-live-dot" />
            Live
          </div>

          {/* Bell */}
          <button className="lgt-bell" title="Notifications">
            🔔<span className="lgt-bell-dot" />
          </button>

          {/* Welcome */}
          <span className="lgt-welcome">
            Hi, <strong>{name}</strong>
          </span>

          {/* Avatar + dropdown */}
          <div className="lgt-ava-wrap">
            <button className="lgt-ava-btn" onClick={() => setDd(o => !o)}>
              {letter}
              <span className="lgt-ava-ring" />
            </button>
            {dd && (
              <>
                <div className="lgt-dd-bg" onClick={() => setDd(false)} />
                <div className="lgt-dd">
                  <div className="lgt-dd-head">
                    <div className="lgt-dd-ava">{letter}</div>
                    <div>
                      <div className="lgt-dd-name">{name}</div>
                      <div className="lgt-dd-role">Administrator</div>
                    </div>
                  </div>
                  {/* <button className="lgt-dd-item" onClick={() => { navigate("/admin"); setDd(false); }}>
                    🏠 Dashboard
                  </button>
                  <button className="lgt-dd-item" onClick={() => { navigate("/profile"); setDd(false); }}>
                    👤 Profile
                  </button>
                  <button className="lgt-dd-item" onClick={() => { navigate("/settings"); setDd(false); }}>
                    ⚙️ Settings
                  </button> */}
                  <button className="lgt-dd-item danger" onClick={logout}>
                    🚪 Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════
          SIDEBAR — starts exactly at px 64 (below topbar)
      ═══════════════════════════════════════════════ */}
      <aside className={`lgt-sb${open ? " open" : ""}`}>
        <nav className="lgt-nav">
          <div className="lgt-sec-lbl">Navigation</div>

          {search.trim() ? (
            filtered.length === 0 ? (
              <div className="lgt-no-result">No pages match "{search}"</div>
            ) : (
              filtered.map((item, i) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    className={`lgt-item${isActive ? " lgt-active" : ""}`}
                    onClick={() => { setTab(item.id); setSearch(""); onClose?.(); }}
                    style={{ "--ic": item.color, "--ir": item.rgb, animationDelay: `${i * .04}s` }}
                  >
                    {isActive && <span className="lgt-stripe" />}
                    {isActive && <span className="lgt-glow" />}
                    <div className="lgt-icon">{item.icon}</div>
                    {item.label}
                  </button>
                );
              })
            )
          ) : (
            NAV.map((item, i) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  className={`lgt-item${isActive ? " lgt-active" : ""}`}
                  onClick={() => { setTab(item.id); onClose?.(); }}
                  style={{ "--ic": item.color, "--ir": item.rgb, animationDelay: `${i * .055}s` }}
                >
                  {isActive && <span className="lgt-stripe" />}
                  {isActive && <span className="lgt-glow" />}
                  <div className="lgt-icon">{item.icon}</div>
                  {item.label}
                  {item.id === "ai" && (
                    <span className="lgt-ai-pill">
                      AI <span className="lgt-ai-shim" />
                    </span>
                  )}
                </button>
              );
            })
          )}
        </nav>

        {/* User footer */}
        <div className="lgt-footer">
          <div className="lgt-user">
            <div className="lgt-uava">{letter}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="lgt-uname">{name}</div>
              <div className="lgt-urole">Super Admin</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                <span className="lgt-sdot" />
                <span className="lgt-stxt">Online</span>
              </div>
            </div>
            <span className="lgt-ver">v2.1</span>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      <div className={`lgt-overlay${open ? " show" : ""}`} onClick={onClose} />
    </>
  );
}