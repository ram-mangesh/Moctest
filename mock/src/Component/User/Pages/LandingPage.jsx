import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";

const SLIDES = [
  {
    titleKey:    "landing.slide1.title",
    highlightKey:"landing.slide1.highlight",
    descKey:     "landing.slide1.desc",
    featureKeys: "landing.slide1.features",
    emoji: "🎯",
    accent: "#6366f1",
    accentRgb: "99,102,241",
  },
  {
    titleKey:    "landing.slide2.title",
    highlightKey:"landing.slide2.highlight",
    descKey:     "landing.slide2.desc",
    featureKeys: "landing.slide2.features",
    emoji: "🤖",
    accent: "#8b5cf6",
    accentRgb: "139,92,246",
  },
  {
    titleKey:    "landing.slide3.title",
    highlightKey:"landing.slide3.highlight",
    descKey:     "landing.slide3.desc",
    featureKeys: "landing.slide3.features",
    emoji: "📊",
    accent: "#06b6d4",
    accentRgb: "6,182,212",
  },
];

const STATS = [
  { val: "10K+",  label: "Questions" },
  { val: "500+",  label: "Exams"     },
  { val: "98%",   label: "Pass Rate" },
  { val: "50K+",  label: "Students"  },
];

const TRUST_BADGES = ["SSC CGL", "UPSC", "JEE", "NEET", "CAT", "GATE"];

const LandingPage = () => {
  const { t }    = useTranslation();
  const navigate = useNavigate();
  const [idx,    setIdx]    = useState(0);
  const [prev,   setPrev]   = useState(null);
  const [exiting,setExiting]= useState(false);
  const timerRef = useRef(null);

  const goTo = (i) => {
    if (i === idx) return;
    setPrev(idx);
    setExiting(true);
    setTimeout(() => {
      setIdx(i);
      setPrev(null);
      setExiting(false);
    }, 350);
  };

  /* auto-advance */
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setIdx(p => {
        const next = (p + 1) % SLIDES.length;
        goTo(next);
        return p;                   /* goTo handles actual change */
      });
    }, 5500);
    return () => clearInterval(timerRef.current);
  }, [idx]);

  const slide    = SLIDES[idx];
  const features = t(slide.featureKeys, {
    returnObjects: true,
    defaultValue: [
      "AI-powered question bank",
      "Topic-wise deep practice",
      "Real exam simulation",
      "Instant detailed feedback",
    ],
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Sora:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'Plus Jakarta Sans',sans-serif; }

        /* ══════════════════════════════════════════
           ROOT — always light glassmorphic
        ══════════════════════════════════════════ */
        .lp2-root {
          min-height: 100vh;
          display: flex; flex-direction: column;
          position: relative; overflow: hidden;
          background: linear-gradient(160deg,#eef0ff 0%,#e8ecff 25%,#f0eaff 55%,#fce8f3 82%,#f5f0ff 100%);
          color: #1e1b4b;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* ── animated mesh background ── */
        .lp2-bg { position:fixed; inset:0; z-index:0; pointer-events:none; }
        .lp2-orb {
          position:absolute; border-radius:50%; filter:blur(90px);
          will-change:transform; transition:background 1s ease;
        }
        .lp2-o1 {
          width:640px;height:640px;top:-200px;left:-120px;
          background:radial-gradient(circle,rgba(var(--ar,99,102,241),.22)0%,transparent 65%);
          animation:lpO1 20s ease-in-out infinite alternate;
        }
        .lp2-o2 {
          width:520px;height:520px;bottom:-130px;right:-100px;
          background:radial-gradient(circle,rgba(168,85,247,.16)0%,transparent 65%);
          animation:lpO2 26s ease-in-out infinite alternate 4s;
        }
        .lp2-o3 {
          width:340px;height:340px;top:35%;left:43%;
          background:radial-gradient(circle,rgba(236,72,153,.11)0%,transparent 65%);
          animation:lpO1 17s ease-in-out infinite alternate 8s;
        }
        .lp2-o4 {
          width:260px;height:260px;top:12%;right:26%;
          background:radial-gradient(circle,rgba(6,182,212,.1)0%,transparent 65%);
          animation:lpO2 14s ease-in-out infinite alternate 11s;
        }
        @keyframes lpO1{0%{transform:translate(0,0)scale(1)}100%{transform:translate(55px,75px)scale(1.1)}}
        @keyframes lpO2{0%{transform:translate(0,0)scale(1)}100%{transform:translate(-50px,60px)scale(1.08)}}

        /* dot-grid overlay */
        .lp2-grid {
          position:fixed;inset:0;z-index:0;pointer-events:none;
          background-image:radial-gradient(circle,rgba(99,102,241,.16)1px,transparent 1px);
          background-size:32px 32px; opacity:.28;
        }

        /* rising particles */
        .lp2-pts { position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden; }
        .lp2-pt  {
          position:absolute;border-radius:50%;
          width:calc(1.5px+var(--i)*.38px);height:calc(1.5px+var(--i)*.38px);
          background:rgba(99,102,241,calc(.07+var(--i)*.01));
          left:calc(var(--i)*6.6%+1%);bottom:-8px;
          animation:lpPt calc(12s+var(--i)*.7s) linear calc(var(--i)*.55s) infinite;
        }
        @keyframes lpPt{0%{transform:translateY(0);opacity:0}8%{opacity:1}88%{opacity:.18}100%{transform:translateY(-106vh);opacity:0}}

        /* ══ NAVBAR ══ */
        .lp2-nav {
          position: sticky; top:0; z-index:100;
          display:flex;align-items:center;justify-content:space-between;
          padding:0 44px; height:68px; gap:16px;
          background:rgba(255,255,255,.82);
          backdrop-filter:blur(28px) saturate(200%);
          -webkit-backdrop-filter:blur(28px) saturate(200%);
          border-bottom:1.5px solid rgba(99,102,241,.11);
          box-shadow:0 2px 24px rgba(99,102,241,.08),inset 0 -1px 0 rgba(255,255,255,.5);
          animation:lpNavIn .45s ease both;
        }
        @keyframes lpNavIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}

        .lp2-nav-brand {
          display:flex;align-items:center;gap:11px;text-decoration:none;cursor:pointer;
          flex-shrink:0;
        }
        .lp2-nav-logo {
          width:36px;height:36px;border-radius:11px;flex-shrink:0;
          background:linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899);
          display:flex;align-items:center;justify-content:center;font-size:19px;
          box-shadow:0 4px 14px rgba(99,102,241,.34);
          animation:spinPop .95s cubic-bezier(.34,1.56,.64,1) both;
          transition:transform .28s cubic-bezier(.34,1.56,.64,1);
        }
        .lp2-nav-logo:hover{transform:scale(1.1) rotate(6deg);}
        @keyframes spinPop{from{transform:rotate(-180deg)scale(0)}to{transform:rotate(0)scale(1)}}
        .lp2-nav-name {
          font-family:'Sora',sans-serif;font-size:16px;font-weight:800;letter-spacing:-.025em;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
        }
        .lp2-nav-badge {
          font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;
          color:rgba(99,102,241,.45);margin-top:1px;display:block;
        }

        /* trust badges ticker */
        .lp2-nav-ticker {
          flex:1;overflow:hidden;
          display:flex;align-items:center;gap:0;
          max-width:360px;
          mask-image:linear-gradient(90deg,transparent,black 12%,black 88%,transparent);
          -webkit-mask-image:linear-gradient(90deg,transparent,black 12%,black 88%,transparent);
        }
        .lp2-ticker-track {
          display:flex;gap:14px;align-items:center;
          animation:lpTick 18s linear infinite;
          white-space:nowrap;
        }
        @keyframes lpTick{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .lp2-ticker-item {
          font-size:11px;font-weight:700;letter-spacing:.08em;
          padding:4px 12px;border-radius:20px;
          background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.15);
          color:#4338ca;white-space:nowrap;flex-shrink:0;
        }

        .lp2-nav-r { display:flex;align-items:center;gap:10px;flex-shrink:0; }

        .lp2-btn-out {
          padding:9px 20px;border-radius:11px;font-size:13.5px;font-weight:700;
          border:1.5px solid rgba(99,102,241,.22);background:rgba(255,255,255,.7);
          color:#4338ca;cursor:pointer;font-family:inherit;
          backdrop-filter:blur(8px);
          transition:all .22s;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.85);
        }
        .lp2-btn-out:hover{
          background:rgba(99,102,241,.09);border-color:rgba(99,102,241,.38);
          transform:translateY(-1px);box-shadow:0 4px 14px rgba(99,102,241,.13),inset 0 1px 0 rgba(255,255,255,.85);
        }

        .lp2-btn-prim {
          padding:9px 22px;border-radius:11px;font-size:13.5px;font-weight:800;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;
          border:none;cursor:pointer;font-family:inherit;
          box-shadow:0 4px 18px rgba(99,102,241,.38);
          transition:all .25s;position:relative;overflow:hidden;
        }
        .lp2-btn-prim::before{
          content:'';position:absolute;inset:0;
          background:linear-gradient(120deg,transparent,rgba(255,255,255,.22),transparent);
          transform:translateX(-100%);transition:transform .55s ease;
        }
        .lp2-btn-prim:hover::before{transform:translateX(100%);}
        .lp2-btn-prim:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(99,102,241,.5);filter:brightness(1.07);}

        /* ══ MAIN — two column hero ══ */
        .lp2-main {
          position:relative;z-index:10;flex:1;
          display:grid;grid-template-columns:1fr 1fr;
          align-items:center;
          padding:0 44px;
          gap:48px;
          max-width:1200px;
          margin:0 auto;
          width:100%;
        }

        /* ── LEFT column — text hero ── */
        .lp2-hero-left {
          display:flex;flex-direction:column;gap:28px;
          padding:52px 0;
          animation:lpFromLeft .75s cubic-bezier(.4,0,.2,1) both;
        }
        @keyframes lpFromLeft{from{opacity:0;transform:translateX(-32px)}to{opacity:1;transform:translateX(0)}}

        /* slide badge */
        .lp2-slide-badge {
          display:inline-flex;align-items:center;gap:9px;
          padding:7px 16px;border-radius:30px;width:fit-content;
          background:rgba(255,255,255,.8);
          border:1.5px solid rgba(var(--ar,99,102,241),.22);
          backdrop-filter:blur(12px);
          box-shadow:0 4px 18px rgba(var(--ar,99,102,241),.12),inset 0 1px 0 rgba(255,255,255,.9);
          transition:border-color .4s,box-shadow .4s;
        }
        .lp2-slide-badge-dot {
          width:8px;height:8px;border-radius:50%;flex-shrink:0;
          background:var(--ac,#6366f1);
          animation:dotPulse 2s ease-in-out infinite;
          box-shadow:0 0 0 0 var(--ac,#6366f1);
        }
        @keyframes dotPulse{0%,100%{box-shadow:0 0 0 0 var(--ac,#6366f1);transform:scale(1)}50%{box-shadow:0 0 0 6px transparent;transform:scale(1.2)}}
        .lp2-slide-badge-txt {
          font-size:12px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;
          color:var(--ac,#6366f1);
        }

        /* headline */
        .lp2-headline {
          font-family:'Sora',sans-serif;
          font-size:clamp(38px,4.8vw,62px);font-weight:800;
          letter-spacing:-.04em;line-height:1.06;
          color:#1e1b4b;
        }
        .lp2-headline-grad {
          background:linear-gradient(135deg,var(--ac,#6366f1) 15%,#8b5cf6 55%,#06b6d4 88%);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
          transition:background .5s;
        }

        .lp2-desc {
          font-size:16px;line-height:1.78;
          color:rgba(67,56,202,.65);
          max-width:440px;
        }

        /* feature list */
        .lp2-features { display:flex;flex-direction:column;gap:10px; }
        .lp2-feat-item {
          display:flex;align-items:center;gap:11px;
          font-size:14px;font-weight:600;color:#374151;
          padding:10px 14px;border-radius:12px;
          background:rgba(255,255,255,.65);
          border:1.5px solid rgba(99,102,241,.11);
          backdrop-filter:blur(8px);
          transition:all .24s;
          animation:lpFeatIn .4s ease both;
        }
        @keyframes lpFeatIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
        .lp2-feat-item:hover{
          background:rgba(var(--ar,99,102,241),.07);
          border-color:rgba(var(--ar,99,102,241),.28);
          transform:translateX(4px);
          box-shadow:0 4px 16px rgba(var(--ar,99,102,241),.1);
        }
        .lp2-feat-check {
          width:22px;height:22px;border-radius:7px;flex-shrink:0;
          background:rgba(var(--ar,99,102,241),.12);
          color:var(--ac,#6366f1);
          display:flex;align-items:center;justify-content:center;
          font-size:12px;font-weight:900;
          transition:background .3s;
        }

        /* CTA row */
        .lp2-cta-row { display:flex;align-items:center;gap:14px;flex-wrap:wrap; }
        .lp2-cta-primary {
          position:relative;overflow:hidden;
          padding:15px 38px;border-radius:14px;font-size:15.5px;font-weight:800;
          color:#fff;border:none;cursor:pointer;font-family:inherit;
          background:linear-gradient(135deg,var(--ac,#6366f1),#8b5cf6,#06b6d4);
          background-size:200% 200%;background-position:0% 50%;
          box-shadow:0 8px 32px rgba(var(--ar,99,102,241),.42);
          transition:all .28s cubic-bezier(.4,0,.2,1);
          letter-spacing:.01em;
        }
        .lp2-cta-primary::before{
          content:'';position:absolute;inset:0;
          background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.24),transparent 70%);
          transform:translateX(-100%);transition:transform .55s ease;
        }
        .lp2-cta-primary:hover::before{transform:translateX(100%);}
        .lp2-cta-primary:hover{
          background-position:100% 50%;
          transform:translateY(-3px);
          box-shadow:0 14px 44px rgba(var(--ar,99,102,241),.52);
          filter:brightness(1.07);
        }
        .lp2-cta-secondary {
          padding:14px 24px;border-radius:14px;font-size:14.5px;font-weight:700;
          background:rgba(255,255,255,.78);
          border:1.5px solid rgba(99,102,241,.22);
          color:#4338ca;cursor:pointer;font-family:inherit;
          backdrop-filter:blur(10px);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.9);
          transition:all .24s;
        }
        .lp2-cta-secondary:hover{
          background:rgba(99,102,241,.09);border-color:rgba(99,102,241,.38);
          transform:translateY(-2px);box-shadow:0 6px 20px rgba(99,102,241,.14),inset 0 1px 0 rgba(255,255,255,.9);
        }

        /* social proof */
        .lp2-social-proof {
          display:flex;align-items:center;gap:12px;
          padding-top:4px;
        }
        .lp2-avatars { display:flex; }
        .lp2-av {
          width:30px;height:30px;border-radius:50%;border:2px solid rgba(255,255,255,.9);
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          margin-left:-8px;first-child:margin-left:0;
          display:flex;align-items:center;justify-content:center;
          font-size:11px;font-weight:800;color:#fff;
          box-shadow:0 2px 8px rgba(99,102,241,.25);
        }
        .lp2-av:first-child{margin-left:0;}
        .lp2-proof-txt{
          font-size:12.5px;font-weight:600;
          color:rgba(67,56,202,.65);
        }
        .lp2-proof-txt strong{color:#4338ca;font-weight:800;}

        /* ── RIGHT column — glass card ── */
        .lp2-hero-right {
          display:flex;flex-direction:column;gap:20px;
          padding:52px 0;
          animation:lpFromRight .75s cubic-bezier(.4,0,.2,1) .07s both;
        }
        @keyframes lpFromRight{from{opacity:0;transform:translateX(32px)}to{opacity:1;transform:translateX(0)}}

        /* main glass panel */
        .lp2-glass-panel {
          border-radius:26px;
          background:rgba(255,255,255,.86);
          backdrop-filter:blur(28px) saturate(200%);
          -webkit-backdrop-filter:blur(28px) saturate(200%);
          border:1.5px solid rgba(99,102,241,.13);
          box-shadow:0 20px 56px rgba(99,102,241,.14),inset 0 1px 0 rgba(255,255,255,.98);
          overflow:hidden;
          position:relative;
        }
        .lp2-glass-panel::before{
          content:'';position:absolute;top:-45px;right:-45px;
          width:150px;height:150px;border-radius:50%;
          background:radial-gradient(circle,rgba(var(--ar,99,102,241),.1)0%,transparent 70%);
          pointer-events:none;transition:background .5s;
        }

        /* panel top accent bar */
        .lp2-panel-accent {
          height:3px;width:100%;
          background:linear-gradient(90deg,var(--ac,#6366f1),#8b5cf6,#06b6d4);
          transition:background .5s;
          animation:accentSlide .5s ease;
        }
        @keyframes accentSlide{from{transform:scaleX(0);transform-origin:left}to{transform:scaleX(1)}}

        /* panel header */
        .lp2-panel-hdr {
          padding:22px 26px 18px;
          display:flex;align-items:center;gap:14px;
          border-bottom:1px solid rgba(99,102,241,.09);
        }
        .lp2-panel-icon {
          width:48px;height:48px;border-radius:14px;flex-shrink:0;
          background:rgba(var(--ar,99,102,241),.1);
          border:1.5px solid rgba(var(--ar,99,102,241),.22);
          box-shadow:0 0 20px rgba(var(--ar,99,102,241),.16);
          display:flex;align-items:center;justify-content:center;font-size:24px;
          animation:iconPop .5s cubic-bezier(.34,1.56,.64,1) both;
          transition:background .3s,border-color .3s;
        }
        @keyframes iconPop{from{transform:scale(0)rotate(-20deg)}to{transform:scale(1)rotate(0)}}
        .lp2-panel-slide-title{
          font-family:'Sora',sans-serif;font-size:18px;font-weight:800;
          letter-spacing:-.02em;color:#1e1b4b;
          animation:txtIn .38s ease both;
        }
        @keyframes txtIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .lp2-panel-slide-sub{
          font-size:12.5px;color:rgba(99,102,241,.55);font-weight:500;margin-top:3px;
          animation:txtIn .38s ease .06s both;
        }

        /* slide dots inside panel */
        .lp2-panel-dots{display:flex;gap:7px;margin-left:auto;flex-shrink:0;}
        .lp2-pdot{
          width:8px;height:8px;border-radius:50%;border:none;cursor:pointer;
          transition:all .3s;
        }
        .lp2-pdot.on{
          background:var(--ac,#6366f1);
          transform:scale(1.4);
          box-shadow:0 0 8px rgba(var(--ar,99,102,241),.5);
        }
        .lp2-pdot.off{background:rgba(99,102,241,.18);}
        .lp2-pdot.off:hover{background:rgba(99,102,241,.38);}

        /* panel body */
        .lp2-panel-body { padding:20px 26px 26px;display:flex;flex-direction:column;gap:14px; }

        /* slide feature items inside panel */
        .lp2-pf-item {
          display:flex;align-items:center;gap:12px;
          padding:12px 14px;border-radius:13px;
          background:rgba(var(--ar,99,102,241),.05);
          border:1.5px solid rgba(var(--ar,99,102,241),.11);
          font-size:13.5px;font-weight:600;color:#374151;
          transition:all .22s;
          animation:pfIn .4s ease both;
        }
        @keyframes pfIn{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
        .lp2-pf-item:hover{
          background:rgba(var(--ar,99,102,241),.1);
          border-color:rgba(var(--ar,99,102,241),.25);
          transform:translateX(3px);
        }
        .lp2-pf-num {
          width:26px;height:26px;border-radius:8px;flex-shrink:0;
          background:linear-gradient(135deg,var(--ac,#6366f1),#8b5cf6);
          color:#fff;font-size:11px;font-weight:900;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 3px 10px rgba(var(--ar,99,102,241),.3);
        }

        /* stats strip */
        .lp2-stats-strip {
          border-radius:20px;
          background:rgba(255,255,255,.82);
          backdrop-filter:blur(20px) saturate(180%);
          border:1.5px solid rgba(99,102,241,.12);
          box-shadow:0 8px 28px rgba(99,102,241,.1),inset 0 1px 0 rgba(255,255,255,.95);
          display:grid;grid-template-columns:repeat(4,1fr);
          overflow:hidden;
        }
        .lp2-stat {
          padding:18px 12px;text-align:center;
          border-right:1px solid rgba(99,102,241,.1);
          transition:background .2s;cursor:default;
        }
        .lp2-stat:last-child{border-right:none;}
        .lp2-stat:hover{background:rgba(99,102,241,.05);}
        .lp2-stat-val {
          font-family:'Sora',sans-serif;
          font-size:22px;font-weight:800;
          color:#1e1b4b;letter-spacing:-.03em;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
        }
        .lp2-stat-lbl {
          font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
          color:rgba(99,102,241,.45);margin-top:3px;
        }

        /* ══ SLIDE TRANSITION ══ */
        .lp2-slide-exit { animation:lpSlideOut .35s ease forwards; }
        .lp2-slide-enter{ animation:lpSlideIn .4s cubic-bezier(.4,0,.2,1) both; }
        @keyframes lpSlideOut{to{opacity:0;transform:translateY(10px)}}
        @keyframes lpSlideIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}

        /* ══ FOOTER ══ */
        .lp2-foot {
          position:relative;z-index:10;
          padding:22px 44px;
          border-top:1.5px solid rgba(99,102,241,.1);
          background:rgba(255,255,255,.6);
          backdrop-filter:blur(16px);
          display:flex;align-items:center;justify-content:space-between;
          gap:16px;flex-wrap:wrap;
        }
        .lp2-foot-brand{
          font-family:'Sora',sans-serif;font-size:14px;font-weight:800;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
        }
        .lp2-foot-txt{font-size:12.5px;color:rgba(99,102,241,.48);font-weight:500;}
        .lp2-foot-links{display:flex;gap:18px;}
        .lp2-foot-link{
          font-size:12.5px;font-weight:600;color:rgba(99,102,241,.55);
          text-decoration:none;transition:color .18s;
        }
        .lp2-foot-link:hover{color:#6366f1;}

        /* ══ RESPONSIVE ══ */
        @media(max-width:960px){
          .lp2-main{grid-template-columns:1fr;padding:0 24px;gap:24px;}
          .lp2-hero-left{padding:36px 0 0;}
          .lp2-hero-right{padding:0 0 36px;}
          .lp2-nav{padding:0 20px;}
          .lp2-nav-ticker{display:none;}
          .lp2-foot{padding:18px 20px;}
        }
        @media(max-width:600px){
          .lp2-main{padding:0 16px;}
          .lp2-headline{font-size:clamp(32px,8vw,46px);}
          .lp2-stats-strip{grid-template-columns:1fr 1fr;}
          .lp2-stat:nth-child(2){border-right:none;}
          .lp2-stat:nth-child(3){border-top:1px solid rgba(99,102,241,.1);}
          .lp2-stat:nth-child(4){border-top:1px solid rgba(99,102,241,.1);border-right:none;}
          .lp2-cta-row{flex-direction:column;align-items:stretch;}
          .lp2-cta-primary,.lp2-cta-secondary{text-align:center;}
          .lp2-foot-links{display:none;}
        }
      `}</style>

      <div
        className="lp2-root"
        style={{
          "--ac":  slide.accent,
          "--ar":  slide.accentRgb,
        }}
      >
        {/* ── background ── */}
        <div className="lp2-bg">
          <div className="lp2-orb lp2-o1" />
          <div className="lp2-orb lp2-o2" />
          <div className="lp2-orb lp2-o3" />
          <div className="lp2-orb lp2-o4" />
        </div>
        <div className="lp2-grid" />
        <div className="lp2-pts">
          {Array.from({ length: 13 }, (_, i) => (
            <span key={i} className="lp2-pt" style={{ "--i": i }} />
          ))}
        </div>

        {/* ══ NAVBAR ══ */}
        <header className="lp2-nav">
          <div className="lp2-nav-brand" onClick={() => navigate("/")}>
            <div className="lp2-nav-logo">🎓</div>
            <div>
              <div className="lp2-nav-name">
                {t("landing.brandPrimary", "ExamPrep")}
              </div>
              <span className="lp2-nav-badge">Student Portal</span>
            </div>
          </div>

          {/* ticker */}
          <div className="lp2-nav-ticker">
            <div className="lp2-ticker-track">
              {[...TRUST_BADGES, ...TRUST_BADGES].map((b, i) => (
                <span key={i} className="lp2-ticker-item">{b}</span>
              ))}
            </div>
          </div>

          <div className="lp2-nav-r">
            <button className="lp2-btn-out" onClick={() => navigate("/login")}>
              {t("landing.login", "Login")}
            </button>
            <button className="lp2-btn-prim" onClick={() => navigate("/register")}>
              {t("landing.register", "Get Started")}
            </button>
          </div>
        </header>

        {/* ══ TWO-COLUMN HERO ══ */}
        <main className="lp2-main">

          {/* ── LEFT: Text hero ── */}
          <div className="lp2-hero-left">

            {/* slide indicator badge */}
            <div className="lp2-slide-badge">
              <span className="lp2-slide-badge-dot" />
              <span className="lp2-slide-badge-txt">
                {t(slide.highlightKey, "Smart Preparation")}
              </span>
            </div>

            {/* headline */}
            <h1 className={`lp2-headline${exiting ? " lp2-slide-exit" : " lp2-slide-enter"}`} key={idx + "h"}>
              {t(slide.titleKey, "Ace Every")}<br />
              <span className="lp2-headline-grad">Exam.</span>
            </h1>

            {/* description */}
            <p className={`lp2-desc${exiting ? " lp2-slide-exit" : " lp2-slide-enter"}`} key={idx + "d"}>
              {t(slide.descKey, "Practice smarter and score higher with personalised AI-powered tests, detailed analytics, and real exam simulation.")}
            </p>

            {/* feature bullets */}
            <div className={`lp2-features${exiting ? " lp2-slide-exit" : ""}`} key={idx + "f"}>
              {(Array.isArray(features) ? features : []).map((f, i) => (
                <div
                  key={i}
                  className="lp2-feat-item"
                  style={{ animationDelay: `${i * .08}s` }}
                >
                  <span className="lp2-feat-check">✓</span>
                  {f}
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="lp2-cta-row">
              <button className="lp2-cta-primary" onClick={() => navigate("/login")}>
                {t("landing.startPractice", "Start Practising Free")} →
              </button>
              <button className="lp2-cta-secondary" onClick={() => navigate("/register")}>
                {t("landing.register", "Create Account")}
              </button>
            </div>

            {/* social proof */}
            <div className="lp2-social-proof">
              <div className="lp2-avatars">
                {["A","S","R","M"].map((l, i) => (
                  <div key={i} className="lp2-av" style={{
                    background: `linear-gradient(135deg,${["#6366f1,#8b5cf6","#8b5cf6,#ec4899","#06b6d4,#6366f1","#10b981,#06b6d4"][i]})`,
                    zIndex: 4 - i,
                  }}>
                    {l}
                  </div>
                ))}
              </div>
              <span className="lp2-proof-txt">
                Joined by <strong>50,000+</strong> students this year
              </span>
            </div>
          </div>

          {/* ── RIGHT: Glass panel card ── */}
          <div className="lp2-hero-right">

            {/* main interactive panel */}
            <div className="lp2-glass-panel">
              <div className="lp2-panel-accent" key={idx + "bar"} />

              <div className="lp2-panel-hdr">
                <div className="lp2-panel-icon" key={idx + "ico"}>
                  {slide.emoji}
                </div>
                <div>
                  <div className="lp2-panel-slide-title" key={idx + "pt"}>
                    {t(slide.highlightKey, "Smart Preparation")}
                  </div>
                  <div className="lp2-panel-slide-sub" key={idx + "ps"}>
                    {t(slide.titleKey, "Ace Every Exam")}
                  </div>
                </div>
                {/* slide dots */}
                <div className="lp2-panel-dots">
                  {SLIDES.map((_, i) => (
                    <button
                      key={i}
                      className={`lp2-pdot ${i === idx ? "on" : "off"}`}
                      onClick={() => goTo(i)}
                    />
                  ))}
                </div>
              </div>

              <div className="lp2-panel-body" key={idx + "body"}>
                {(Array.isArray(features) ? features : []).map((f, i) => (
                  <div
                    key={i}
                    className="lp2-pf-item"
                    style={{ animationDelay: `${i * .09}s` }}
                  >
                    <span className="lp2-pf-num">{i + 1}</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* stats strip */}
            <div className="lp2-stats-strip">
              {STATS.map(({ val, label }) => (
                <div key={label} className="lp2-stat">
                  <div className="lp2-stat-val">{val}</div>
                  <div className="lp2-stat-lbl">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* ══ FOOTER ══ */}
        <footer className="lp2-foot">
          <span className="lp2-foot-brand">ExamPrep</span>
          <span className="lp2-foot-txt">
            {t("landing.footer", "© 2026 ExamPrep. All rights reserved.")}
          </span>
          <div className="lp2-foot-links">
            {["Privacy", "Terms", "Support"].map(l => (
              <a key={l} href="#" className="lp2-foot-link">{l}</a>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;