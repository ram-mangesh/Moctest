import React, { createContext, useState, useEffect } from "react";

// Global CSS injection
export function injectStyles(dark) {
  const id = "ep-user-styles";
  let el = document.getElementById(id);
  if (!el) { el = document.createElement("style"); el.id = id; document.head.appendChild(el); }
  const lk = document.getElementById("ep-user-font");
  if (!lk) {
    const l = document.createElement("link"); l.id = "ep-user-font"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300&family=Clash+Display:wght@400;500;600;700&display=swap";
    document.head.appendChild(l);
  }
  el.textContent = `
    :root {
      --bg:      #f0f4ff;
      --bg2:     #ffffff;
      --bg3:     #e8eeff;
      --surf:    #ffffff;
      --surf2:   #f6f8ff;
      --surf3:   #edf0ff;
      --border:  #e0e6ff;
      --text:    #0d1333;
      --text2:   #5a6490;
      --accent:  #4f6ef7;
      --cyan:    #06d6d6;
      --amber:   #f59e0b;
      --rose:    #f43f5e;
      --green:   #10b981;
      --violet:  #8b5cf6;
      --g1: linear-gradient(135deg,#4f6ef7,#818cf8);
      --g2: linear-gradient(135deg,#f43f5e,#f59e0b);
      --g3: linear-gradient(135deg,#10b981,#06d6d6);
      --g4: linear-gradient(135deg,#8b5cf6,#4f6ef7);
      --sh: 0 2px 16px rgba(79,110,247,.10);
      --sh2: 0 8px 36px rgba(79,110,247,.16);
    }
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Plus Jakarta Sans',sans-serif!important;background:var(--bg);color:var(--text)}
    ::-webkit-scrollbar{width:5px;height:5px}
    ::-webkit-scrollbar-track{background:var(--bg)}
    ::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px}

    @keyframes fadeUp   {from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn   {from{opacity:0}to{opacity:1}}
    @keyframes slideL   {from{opacity:0;transform:translateX(-18px)}to{opacity:1;transform:translateX(0)}}
    @keyframes pop      {0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
    @keyframes spin     {to{transform:rotate(360deg)}}
    @keyframes float    {0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
    @keyframes wiggle   {0%,100%{transform:rotate(0)}25%{transform:rotate(-9deg)}75%{transform:rotate(9deg)}}
    @keyframes pulse    {0%,100%{opacity:1}50%{opacity:.45}}
    @keyframes gshift   {0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    @keyframes shimmer  {from{background-position:-200% 0}to{background-position:200% 0}}
    @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes ticker   {from{transform:translateX(100%)}to{transform:translateX(-100%)}}
    @keyframes progress-fill{from{width:0}to{width:var(--pw,40%)}}

    .ep-grad-text{background:linear-gradient(270deg,#4f6ef7,#06d6d6,#f94f7b,#ffb020,#2dd976);background-size:300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:gshift 6s ease infinite}
    .ep-float{animation:float 3s ease-in-out infinite}
    .ep-wiggle{animation:wiggle 1.5s ease-in-out infinite}
    .ep-pulse{animation:pulse 2s ease-in-out infinite}
    .ep-spin{animation:spin .8s linear infinite}

    /* Input */
    .ep-input{width:100%;background:var(--surf2);border:1.5px solid var(--border);border-radius:12px;padding:10px 14px;color:var(--text);font-family:inherit;font-size:14px;outline:none;transition:border-color .2s,box-shadow .2s;resize:vertical}
    .ep-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(79,110,247,.15)}
    .ep-input::placeholder{color:var(--text2)}
    .ep-input:disabled{opacity:.4;cursor:not-allowed}
    select.ep-input option{background:var(--surf)}

    /* Buttons */
    .ep-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:10px 20px;border-radius:12px;border:none;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap}
    .ep-btn:active{transform:scale(.97)}
    .ep-btn:disabled{opacity:.5;cursor:not-allowed}
    .ep-btn-primary{background:var(--g1);color:#fff;box-shadow:0 4px 15px rgba(79,110,247,.35)}
    .ep-btn-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 24px rgba(79,110,247,.5)}
    .ep-btn-success{background:var(--g3);color:#fff;box-shadow:0 4px 12px rgba(45,217,118,.3)}
    .ep-btn-success:hover:not(:disabled){transform:translateY(-1px)}
    .ep-btn-danger{background:rgba(249,79,123,.1);color:var(--rose);border:1.5px solid rgba(249,79,123,.3)}
    .ep-btn-danger:hover:not(:disabled){background:rgba(249,79,123,.2)}
    .ep-btn-ghost{background:var(--surf2);color:var(--text);border:1.5px solid var(--border)}
    .ep-btn-ghost:hover:not(:disabled){border-color:var(--accent);color:var(--accent)}
    .ep-btn-warn{background:rgba(255,176,32,.1);color:var(--amber);border:1.5px solid rgba(255,176,32,.3)}
    .ep-btn-warn:hover:not(:disabled){background:rgba(255,176,32,.2)}
    .ep-btn-violet{background:var(--g4);color:#fff;box-shadow:0 4px 15px rgba(168,85,247,.3)}
    .ep-btn-sm{padding:6px 13px;font-size:12px;border-radius:9px}
    .ep-btn-full{width:100%}

    /* Badge */
    .ep-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700}
    .ep-badge-blue{background:rgba(79,110,247,.15);color:#818cf8;border:1px solid rgba(79,110,247,.25)}
    .ep-badge-cyan{background:rgba(6,214,214,.15);color:var(--cyan);border:1px solid rgba(6,214,214,.25)}
    .ep-badge-amber{background:rgba(255,176,32,.15);color:var(--amber);border:1px solid rgba(255,176,32,.25)}
    .ep-badge-green{background:rgba(45,217,118,.15);color:var(--green);border:1px solid rgba(45,217,118,.25)}
    .ep-badge-rose{background:rgba(249,79,123,.15);color:var(--rose);border:1px solid rgba(249,79,123,.25)}
    .ep-badge-violet{background:rgba(168,85,247,.15);color:var(--violet);border:1px solid rgba(168,85,247,.25)}

    /* Card */
    .ep-card{background:var(--surf);border:1.5px solid var(--border);border-radius:20px;box-shadow:var(--sh)}
    .ep-card-body{padding:22px}
    .ep-card-hdr{padding:18px 22px;border-bottom:1.5px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}

    /* List item */
    .ep-li{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;border-radius:14px;margin-bottom:8px;background:var(--surf2);border:1.5px solid var(--border);transition:all .2s;animation:fadeUp .3s ease both}
    .ep-li:hover{border-color:var(--accent);transform:translateX(3px)}

    /* Sidebar */
    .ep-sidebar{position:fixed;top:0;left:0;bottom:0;width:258px;background:var(--surf);border-right:1.5px solid var(--border);z-index:200;display:flex;flex-direction:column;transition:transform .35s cubic-bezier(.4,0,.2,1)}
    .ep-sidebar.closed{transform:translateX(-258px)}
    .ep-main{margin-left:258px;min-height:100vh;display:flex;flex-direction:column;transition:margin-left .35s cubic-bezier(.4,0,.2,1)}
    .ep-main.full{margin-left:0}

    /* Mobile */
    .ep-mob-ov{display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:199;opacity:0;pointer-events:none;transition:opacity .3s}
    @media(max-width:900px){
      .ep-sidebar{transform:translateX(-258px)!important}
      .ep-sidebar.mob-open{transform:translateX(0)!important}
      .ep-main{margin-left:0!important}
      .ep-mob-ov{display:block}
      .ep-mob-ov.show{opacity:1;pointer-events:all}
      .ep-hide-mob{display:none!important}
    }
    @media(max-width:600px){
      .ep-card-body{padding:14px}
      .ep-grid2{grid-template-columns:1fr!important}
    }

    /* Modal */
    .ep-modal-ov{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(12px);z-index:400;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn .2s ease}
    .ep-modal{background:var(--surf);border:1.5px solid var(--border);border-radius:24px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;box-shadow:var(--sh2);animation:fadeUp .35s cubic-bezier(.34,1.56,.64,1)}

    /* Toast */
    .ep-toast-wrap{position:fixed;bottom:24px;right:24px;z-index:999;display:flex;flex-direction:column;gap:8px}
    .ep-toast{display:flex;align-items:center;gap:12px;padding:13px 18px;border-radius:16px;background:var(--surf);border:1.5px solid var(--border);box-shadow:var(--sh2);font-size:14px;font-weight:600;min-width:260px;color:var(--text);animation:slideDown .35s cubic-bezier(.34,1.56,.64,1)}
    .ep-toast.success{border-color:rgba(45,217,118,.4)}
    .ep-toast.error{border-color:rgba(249,79,123,.4)}
    .ep-toast.info{border-color:rgba(79,110,247,.4)}

    /* Progress */
    .ep-prog{height:6px;background:var(--border);border-radius:6px;overflow:hidden}
    .ep-prog-fill{height:100%;background:var(--g1);border-radius:6px;transition:width .8s ease}

    /* Empty */
    .ep-empty{text-align:center;padding:52px 20px}
    .ep-empty-icon{font-size:60px;display:block;margin-bottom:14px;animation:float 3s ease-in-out infinite}
    .ep-empty h3{font-size:19px;font-weight:800;color:var(--text);margin-bottom:6px}
    .ep-empty p{font-size:13px;color:var(--text2)}

    /* Spinner */
    .ep-spinner{width:18px;height:18px;border:2.5px solid rgba(255,255,255,.25);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite}

    /* Question palette */
    .ep-palette-btn{width:36px;height:36px;border-radius:9px;font-weight:700;font-size:12px;cursor:pointer;border:1.5px solid var(--border);transition:all .15s;background:var(--surf2);color:var(--text)}
    .ep-palette-btn:hover{border-color:var(--accent)}
    .ep-palette-btn.answered{background:rgba(45,217,118,.25);border-color:var(--green);color:var(--green)}
    .ep-palette-btn.review{background:rgba(255,176,32,.25);border-color:var(--amber);color:var(--amber)}
    .ep-palette-btn.review-answered{background:rgba(168,85,247,.25);border-color:var(--violet);color:var(--violet)}
    .ep-palette-btn.active{box-shadow:0 0 0 3px rgba(79,110,247,.5)}

    /* Test */
    .ep-test-opt{display:block;width:100%;text-align:left;padding:12px 16px;border-radius:12px;margin-bottom:9px;background:var(--surf2);border:1.5px solid var(--border);color:var(--text);font-family:inherit;font-size:14px;font-weight:500;cursor:pointer;transition:all .2s}
    .ep-test-opt:hover{border-color:var(--accent);background:rgba(79,110,247,.06)}
    .ep-test-opt.selected{background:rgba(79,110,247,.12);border-color:var(--accent);color:var(--accent)}

    /* Ranking podium */
    .ep-podium-1{background:linear-gradient(135deg,rgba(255,176,32,.15),rgba(255,176,32,.05));border-color:rgba(255,176,32,.4)!important}
    .ep-podium-2{background:linear-gradient(135deg,rgba(192,192,192,.12),rgba(192,192,192,.04));border-color:rgba(192,192,192,.3)!important}
    .ep-podium-3{background:linear-gradient(135deg,rgba(205,127,50,.12),rgba(205,127,50,.04));border-color:rgba(205,127,50,.3)!important}

    /* Ticker */
    .ep-ticker{overflow:hidden;white-space:nowrap;background:linear-gradient(90deg,rgba(79,110,247,.08),rgba(6,214,214,.08));border-radius:10px;padding:8px 0}
    .ep-ticker-inner{display:inline-block;animation:ticker 25s linear infinite;font-size:13px;color:var(--text2);font-weight:500}

    /* Stat glow */
    .ep-stat{background:var(--surf);border:1.5px solid var(--border);border-radius:20px;padding:22px;position:relative;overflow:hidden;transition:all .25s;animation:fadeUp .45s ease both}
    .ep-stat:hover{transform:translateY(-3px);box-shadow:var(--sh)}

    /* Form label */
    .ep-lbl{display:block;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--text2);margin-bottom:7px}
    .ep-fg{margin-bottom:16px}
    .ep-row2{display:grid;grid-template-columns:1fr 1fr;gap:14px}

    /* Section label */
    .ep-sec-lbl{font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--text2);padding:10px 14px 6px}

    /* Nav link */
    .ep-nav-lnk{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:13px;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;text-decoration:none;color:var(--text2);border:1.5px solid transparent;margin-bottom:3px;position:relative}
    .ep-nav-lnk:hover{background:var(--surf2);color:var(--text)}
    .ep-nav-lnk.active{background:rgba(79,110,247,.1);color:var(--accent);border-color:rgba(79,110,247,.25)}
    .ep-nav-lnk.active::before{content:'';position:absolute;left:0;top:20%;bottom:20%;width:3px;background:var(--accent);border-radius:0 3px 3px 0}
    .ep-nav-icon{font-size:18px;width:22px;text-align:center;flex-shrink:0}

    /* Search dropdown */
    .ep-search-drop{position:absolute;top:calc(100%+6px);left:0;right:0;background:var(--surf);border:1.5px solid var(--border);border-radius:14px;box-shadow:var(--sh2);overflow:hidden;z-index:300;animation:slideDown .2s ease}
    .ep-search-item{padding:10px 14px;cursor:pointer;font-size:13px;transition:background .15s;color:var(--text)}
    .ep-search-item:hover{background:var(--surf2)}

    /* Landing slide */
    .ep-slide-enter{animation:fadeUp .5s ease}
    .ep-feature-card{background:var(--surf2);border:1.5px solid var(--border);border-radius:16px;padding:18px;text-align:left;animation:fadeUp .4s ease both;transition:all .25s}
    .ep-feature-card:hover{border-color:var(--accent);transform:translateY(-3px)}

    /* Scratchpad */
    .ep-scratch-tool{padding:6px 12px;border-radius:9px;border:1.5px solid var(--border);background:var(--surf2);color:var(--text);font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;font-family:inherit}
    .ep-scratch-tool.active{background:var(--accent);color:#fff;border-color:var(--accent)}

    /* Violation counter */
    .ep-viol{position:fixed;top:74px;right:16px;background:rgba(249,79,123,.12);border:1.5px solid rgba(249,79,123,.35);border-radius:12px;padding:8px 14px;font-size:12px;font-weight:700;color:var(--rose);z-index:500;animation:pulse 2s ease-in-out infinite}
    /* Dashboard responsive grid */
    .ep-dash-main { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
    .ep-dash-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 22px; }
    .ep-dash-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .ep-exams-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; }
    .ep-exams-header { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 22px; }
    .ep-exams-search { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }

    @media(max-width:1100px){
      .ep-dash-main { grid-template-columns: 1fr; }
      .ep-dash-right { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
    }
    @media(max-width:860px){
      .ep-dash-stats { grid-template-columns: repeat(2, 1fr); }
      .ep-dash-actions { grid-template-columns: repeat(3, 1fr); }
    }
    @media(max-width:600px){
      .ep-dash-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; }
      .ep-dash-actions { grid-template-columns: repeat(2, 1fr); }
      .ep-exams-grid { grid-template-columns: 1fr; }
      .ep-dash-right { grid-template-columns: 1fr; }
      .ep-hero-btns { flex-direction: column; width: 100%; }
      .ep-hero-btns .ep-btn { width: 100%; justify-content: center; }
    }
  `;
}

// Theme is locked to light/white mode
export const ThemeCtx = createContext({ dark: false, toggle: () => {} });

export function ThemeProvider({ children }) {
  // Always light mode — dark mode removed
  const dark = false;
  const toggle = () => {}; // no-op: dark mode disabled

  useEffect(() => {
    injectStyles(false);
  }, []);

  return (
    <ThemeCtx.Provider value={{ dark, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}
