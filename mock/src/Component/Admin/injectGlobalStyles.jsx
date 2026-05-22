const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Sora:wght@400;600;700;800&display=swap";

export function injectGlobalStyles() {
  const id = "examprep-light-styles";
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("style");
    el.id = id;
    document.head.appendChild(el);
  }

  const link = document.getElementById("examprep-font");
  if (!link) {
    const lk = document.createElement("link");
    lk.id = "examprep-font";
    lk.rel = "stylesheet";
    lk.href = FONT_URL;
    document.head.appendChild(lk);
  }

  el.textContent = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      font-family: 'Plus Jakarta Sans', sans-serif !important;
      background: #eef2ff;
      color: #1e1b4b;
      min-height: 100vh;
    }

    :root {
      /* Light palette */
      --bg:          #eef2ff;
      --bg2:         #e0e7ff;
      --surface:     rgba(255,255,255,0.82);
      --surface2:    rgba(255,255,255,0.55);
      --surface3:    rgba(255,255,255,0.35);
      --border:      rgba(99,102,241,0.14);
      --border2:     rgba(99,102,241,0.22);
      --text:        #1e1b4b;
      --text2:       #4338ca;
      --text3:       rgba(67,56,202,0.5);
      --accent:      #6366f1;
      --accent2:     #818cf8;
      --accent3:     #f59e0b;
      --pink:        #ec4899;
      --cyan:        #06b6d4;
      --green:       #10b981;
      --danger:      #ef4444;
      --violet:      #8b5cf6;
      --grad-brand:  linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899);
      --grad-cyan:   linear-gradient(135deg,#6366f1,#06b6d4);
      --grad-warm:   linear-gradient(135deg,#f59e0b,#ec4899);
      --grad-green:  linear-gradient(135deg,#10b981,#06b6d4);
      --shadow:      0 4px 24px rgba(99,102,241,0.12);
      --shadow-lg:   0 12px 48px rgba(99,102,241,0.2);
      --shadow-xl:   0 20px 60px rgba(99,102,241,0.25);
      --glow-ind:    0 0 24px rgba(99,102,241,0.28);
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.25); border-radius: 4px; }

    /* ── Background Scene ── */
    .ep-scene {
      position: fixed; inset: 0; z-index: 0;
      overflow: hidden; pointer-events: none;
      background: linear-gradient(135deg,#eef2ff 0%,#e0e7ff 40%,#f5f3ff 70%,#fce7f3 100%);
    }
    .ep-scene::before {
      content: '';
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(99,102,241,.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99,102,241,.04) 1px, transparent 1px);
      background-size: 44px 44px;
    }
    .ep-orb {
      position: absolute; border-radius: 50%;
      filter: blur(90px); pointer-events: none;
    }
    .ep-orb-1 {
      width: 580px; height: 580px;
      background: radial-gradient(circle, rgba(99,102,241,.18) 0%, transparent 70%);
      top: -180px; left: -80px;
      animation: orbDrift1 18s ease-in-out infinite alternate;
    }
    .ep-orb-2 {
      width: 460px; height: 460px;
      background: radial-gradient(circle, rgba(168,85,247,.13) 0%, transparent 70%);
      top: 20%; right: -60px;
      animation: orbDrift2 22s ease-in-out infinite alternate;
    }
    .ep-orb-3 {
      width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(236,72,153,.1) 0%, transparent 70%);
      bottom: -80px; left: 35%;
      animation: orbDrift3 26s ease-in-out infinite alternate;
    }
    .ep-orb-4 {
      width: 300px; height: 300px;
      background: radial-gradient(circle, rgba(6,182,212,.1) 0%, transparent 70%);
      top: 50%; left: 20%;
      animation: orbDrift2 20s ease-in-out infinite alternate 4s;
    }
    @keyframes orbDrift1 { 0%{transform:translate(0,0)} 100%{transform:translate(50px,70px)} }
    @keyframes orbDrift2 { 0%{transform:translate(0,0)} 100%{transform:translate(-40px,50px)} }
    @keyframes orbDrift3 { 0%{transform:translate(0,0)} 100%{transform:translate(30px,-40px)} }

    .ep-particle {
      position: absolute; border-radius: 50%;
      background: rgba(99,102,241,.45); pointer-events: none;
    }
    @keyframes particleRise {
      0%   { transform: translateY(0) scale(1); opacity: .5; }
      100% { transform: translateY(-100vh) scale(.3); opacity: 0; }
    }

    /* ── Keyframes ── */
    @keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
    @keyframes slideRight{ from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
    @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes cardIn    { from{opacity:0;transform:scale(.97) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
    @keyframes mainEnter { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pop       { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
    @keyframes spin      { to{transform:rotate(360deg)} }
    @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:.45} }
    @keyframes shimmer   { from{background-position:-200% 0} to{background-position:200% 0} }
    @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
    @keyframes glowPulse { 0%,100%{opacity:.1} 50%{opacity:.22} }
    @keyframes ringPulse { 0%,100%{opacity:.45} 50%{opacity:1} }
    @keyframes spinIn    { from{transform:rotate(-180deg) scale(0)} to{transform:rotate(0) scale(1)} }
    @keyframes stripeIn  { from{top:50%;bottom:50%} to{top:18%;bottom:18%} }
    @keyframes accentBar { from{transform:scaleX(0);transform-origin:left} to{transform:scaleX(1)} }
    @keyframes itemIn    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes hintBounce{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }

    .anim-fadeUp   { animation: fadeUp   .45s ease both; }
    .anim-cardIn   { animation: cardIn   .45s cubic-bezier(.34,1.56,.64,1) both; }
    .anim-mainEnter{ animation: mainEnter .5s ease both; }

    /* ── Glass Panel ── */
    .ep-glass {
      background: rgba(255,255,255,0.75);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid rgba(99,102,241,0.15);
      box-shadow: 0 4px 24px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.9);
    }

    /* ── Inputs ── */
    .ep-input {
      background: rgba(255,255,255,0.85);
      border: 1.5px solid rgba(99,102,241,0.2);
      border-radius: 11px;
      padding: 10px 14px;
      width: 100%;
      color: var(--text);
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 14px;
      outline: none;
      transition: border-color .2s, box-shadow .2s;
      resize: vertical;
    }
    .ep-input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(99,102,241,.15);
      background: #fff;
    }
    .ep-input::placeholder { color: rgba(99,102,241,.4); }
    .ep-input:disabled { opacity:.45; cursor:not-allowed; }
    select.ep-input option { background: #fff; color: #1e1b4b; }

    /* ── Buttons ── */
    .ep-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 7px;
      padding: 10px 20px; border-radius: 11px; border: none;
      font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 700;
      cursor: pointer; transition: all .22s; white-space: nowrap;
      position: relative; overflow: hidden;
    }
    .ep-btn::after {
      content:''; position:absolute; inset:0;
      background:radial-gradient(circle at 50%,rgba(255,255,255,.5)0%,transparent 70%);
      opacity:0; transition:opacity .2s;
    }
    .ep-btn:active::after { opacity:1; }
    .ep-btn:active { transform:scale(.97); }
    .ep-btn:disabled { opacity:.5; cursor:not-allowed; }

    .ep-btn-primary {
      background: linear-gradient(135deg,#6366f1,#8b5cf6);
      color: white;
      box-shadow: 0 4px 16px rgba(99,102,241,.35);
    }
    .ep-btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(99,102,241,.45);
      filter: brightness(1.05);
    }
    .ep-btn-success {
      background: linear-gradient(135deg,#10b981,#06b6d4);
      color: white;
      box-shadow: 0 4px 14px rgba(16,185,129,.3);
    }
    .ep-btn-success:hover:not(:disabled) { transform:translateY(-2px); }
    .ep-btn-ghost {
      background: rgba(255,255,255,0.8);
      color: var(--text2);
      border: 1.5px solid rgba(99,102,241,.2);
      backdrop-filter: blur(8px);
    }
    .ep-btn-ghost:hover:not(:disabled) {
      background: rgba(99,102,241,.08);
      border-color: var(--accent);
      color: var(--accent);
    }
    .ep-btn-danger {
      background: rgba(239,68,68,.1);
      color: #dc2626;
      border: 1.5px solid rgba(239,68,68,.25);
    }
    .ep-btn-danger:hover:not(:disabled) { background: rgba(239,68,68,.18); }
    .ep-btn-sm { padding: 7px 14px; font-size: 12px; border-radius: 9px; }
    .ep-btn-xs { padding: 5px 10px; font-size: 11px; border-radius: 7px; }
    .ep-btn-full { width: 100%; }

    /* ── Badges ── */
    .ep-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 10px; border-radius: 20px;
      font-size: 11px; font-weight: 700; letter-spacing:.03em;
    }
    .ep-badge-indigo { background:rgba(99,102,241,.12); color:#4338ca; border:1px solid rgba(99,102,241,.2); }
    .ep-badge-cyan   { background:rgba(6,182,212,.12);  color:#0891b2; border:1px solid rgba(6,182,212,.2); }
    .ep-badge-amber  { background:rgba(245,158,11,.12); color:#b45309; border:1px solid rgba(245,158,11,.2); }
    .ep-badge-green  { background:rgba(16,185,129,.12); color:#059669; border:1px solid rgba(16,185,129,.2); }
    .ep-badge-red    { background:rgba(239,68,68,.12);  color:#dc2626; border:1px solid rgba(239,68,68,.2); }
    .ep-badge-pink   { background:rgba(236,72,153,.12); color:#be185d; border:1px solid rgba(236,72,153,.2); }

    /* ── Cards ── */
    .ep-card {
      background: rgba(255,255,255,0.78);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1.5px solid rgba(99,102,241,.12);
      border-radius: 18px;
      box-shadow: 0 4px 24px rgba(99,102,241,.09), inset 0 1px 0 rgba(255,255,255,.9);
      transition: box-shadow .25s, transform .25s;
    }
    .ep-card:hover { box-shadow: 0 8px 36px rgba(99,102,241,.16), inset 0 1px 0 rgba(255,255,255,.9); }
    .ep-card-header { padding: 18px 22px; border-bottom: 1px solid rgba(99,102,241,.1); }
    .ep-card-body   { padding: 22px; }

    /* ── List items ── */
    .ep-list-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; border-radius: 12px; margin-bottom: 7px;
      background: rgba(255,255,255,.7);
      border: 1.5px solid rgba(99,102,241,.1);
      transition: all .2s; animation: fadeUp .3s ease both;
    }
    .ep-list-item:hover {
      border-color: rgba(99,102,241,.3);
      transform: translateX(3px);
      background: rgba(99,102,241,.04);
      box-shadow: 0 4px 16px rgba(99,102,241,.1);
    }

    /* ── Modal ── */
    .ep-modal-overlay {
      position: fixed; inset: 0;
      background: rgba(99,102,241,.15); backdrop-filter: blur(12px);
      z-index: 300; display: flex; align-items: center; justify-content: center;
      padding: 16px; animation: fadeIn .2s ease;
    }
    .ep-modal {
      background: rgba(255,255,255,.96);
      backdrop-filter: blur(32px) saturate(200%);
      border: 1.5px solid rgba(99,102,241,.18);
      box-shadow: inset 0 1px 0 rgba(255,255,255,1), var(--shadow-xl);
      border-radius: 24px; width: 100%; max-width: 560px;
      max-height: 90vh; overflow-y: auto;
      animation: fadeUp .35s cubic-bezier(.34,1.56,.64,1);
    }
    .ep-modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 22px 24px 0;
    }
    .ep-modal-title { font-size: 20px; font-weight: 900; color: var(--text); letter-spacing:-.02em; }
    .ep-modal-body  { padding: 20px 24px 24px; }

    /* ── Toast ── */
    .ep-toast-wrap {
      position: fixed; bottom: 24px; right: 24px; z-index: 999;
      display: flex; flex-direction: column; gap: 8px;
    }
    .ep-toast {
      display: flex; align-items: center; gap: 12px;
      padding: 13px 18px; border-radius: 16px;
      background: rgba(255,255,255,.96);
      backdrop-filter: blur(20px);
      border: 1.5px solid rgba(99,102,241,.18);
      box-shadow: var(--shadow-lg);
      font-size: 14px; font-weight: 600;
      min-width: 260px; max-width: 360px; color: var(--text);
      animation: slideDown .35s cubic-bezier(.34,1.56,.64,1);
    }
    .ep-toast.success { border-color: rgba(16,185,129,.4); box-shadow: var(--shadow-lg), 0 0 20px rgba(16,185,129,.12); }
    .ep-toast.error   { border-color: rgba(239,68,68,.4);  box-shadow: var(--shadow-lg), 0 0 20px rgba(239,68,68,.12); }
    .ep-toast.info    { border-color: rgba(99,102,241,.4); box-shadow: var(--shadow-lg), 0 0 20px rgba(99,102,241,.12); }

    /* ── Spinner ── */
    .ep-spinner { width:18px;height:18px;border:2.5px solid rgba(99,102,241,.2);border-top-color:#6366f1;border-radius:50%;animation:spin .7s linear infinite; }

    /* ── Section label ── */
    .ep-section-label {
      font-size: 9.5px; font-weight: 800; letter-spacing:.15em;
      text-transform: uppercase; color: rgba(99,102,241,.45);
      padding: 10px 18px 6px;
    }

    /* ── Gradient text ── */
    .ep-grad-text {
      background: linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      font-weight: 900;
    }

    /* ── Float/wiggle ── */
    .ep-emoji-float  { display:inline-block; animation: float 3s ease-in-out infinite; }
    @keyframes wiggle { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-7deg)} 75%{transform:rotate(7deg)} }

    /* ── Progress ── */
    .ep-progress { height:5px; background:rgba(99,102,241,.12); border-radius:5px; overflow:hidden; }
    .ep-progress-fill { height:100%; background:linear-gradient(90deg,#6366f1,#8b5cf6); border-radius:5px; transition:width .8s ease; }

    /* ── Empty ── */
    .ep-empty { text-align:center; padding:52px 20px; }
    .ep-empty-icon { font-size:52px; margin-bottom:14px; animation:float 3s ease-in-out infinite; display:block; }
    .ep-empty h3 { font-size:17px; font-weight:800; color:var(--text); margin-bottom:6px; letter-spacing:-.02em; }
    .ep-empty p  { font-size:13px; color:var(--text3); }

    /* ── Skeleton ── */
    .ep-skeleton {
      background: linear-gradient(90deg,rgba(99,102,241,.06)0%,rgba(99,102,241,.12)50%,rgba(99,102,241,.06)100%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite; border-radius: 8px;
    }

    /* ── Tabs ── */
    .ep-tabs {
      display:flex; gap:4px;
      background: rgba(255,255,255,.6);
      border: 1.5px solid rgba(99,102,241,.12);
      border-radius: 14px; padding: 5px;
      backdrop-filter: blur(12px);
    }
    .ep-tab {
      display:flex; align-items:center; gap:7px;
      padding:9px 18px; border-radius:10px; font-size:13.5px; font-weight:700;
      cursor:pointer; transition:all .22s; border:none; background:none;
      color:rgba(99,102,241,.5); font-family:'Plus Jakarta Sans',sans-serif; white-space:nowrap;
    }
    .ep-tab.active {
      background: rgba(99,102,241,.12);
      color: #4338ca;
      border: 1px solid rgba(99,102,241,.25);
      box-shadow: 0 2px 12px rgba(99,102,241,.15);
    }
    .ep-tab:hover:not(.active) { color:#4338ca; background:rgba(99,102,241,.05); }

    /* ── Sidebar ── */
    .ep-sidebar {
      position: fixed; top:0; left:0; bottom:0; width:260px; z-index:200;
      display: flex; flex-direction:column;
      background: rgba(255,255,255,0.82);
      backdrop-filter: blur(28px) saturate(200%);
      -webkit-backdrop-filter: blur(28px) saturate(200%);
      border-right: 1.5px solid rgba(99,102,241,.14);
      box-shadow: inset -1px 0 0 rgba(255,255,255,.6), 4px 0 32px rgba(99,102,241,.1);
      transition: transform .35s cubic-bezier(.4,0,.2,1);
    }
    .ep-sidebar.closed { transform: translateX(-260px); }
    .ep-main {
      margin-left: 260px; min-height:100vh;
      transition: margin-left .35s cubic-bezier(.4,0,.2,1);
      display: flex; flex-direction:column;
      position: relative; z-index:1;
    }
    .ep-main.full { margin-left:0; }

    .ep-mob-overlay {
      display:none; position:fixed; inset:0;
      background: rgba(99,102,241,.18); backdrop-filter:blur(4px);
      z-index:199; transition:opacity .3s;
    }
    .ep-hide-mob { }

    /* ── Form helpers ── */
    .ep-form-group { margin-bottom:16px; }
    .ep-label {
      display:block; font-size:11px; font-weight:800;
      text-transform:uppercase; letter-spacing:.08em;
      color:rgba(99,102,241,.6); margin-bottom:7px;
    }
    .ep-form-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .ep-sidebar { transform: translateX(-260px) !important; }
      .ep-sidebar.mob-open { transform: translateX(0) !important; }
      .ep-main { margin-left: 0 !important; }
      .ep-mob-overlay { display:block; opacity:0; pointer-events:none; }
      .ep-mob-overlay.show { opacity:1; pointer-events:all; }
    }
    @media (max-width: 640px) {
      .ep-tabs { flex-wrap:nowrap; overflow-x:auto; }
      .ep-tab  { padding:8px 13px; font-size:12px; }
      .ep-hide-mob { display:none !important; }
    }
    @media (max-width: 480px) {
      .ep-modal { border-radius:18px; }
      .ep-form-row { grid-template-columns:1fr !important; }
    }
  `;
}