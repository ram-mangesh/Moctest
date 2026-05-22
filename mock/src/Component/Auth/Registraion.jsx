import React, { useState, useMemo } from "react";
import api from "../Api/axios";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

/* Password strength scorer */
const scorePassword = (pw) => {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};

const STRENGTH = [
  { label: "",         color: "transparent", w: "0%"   },
  { label: "Weak",     color: "#ef4444",     w: "25%"  },
  { label: "Fair",     color: "#f59e0b",     w: "50%"  },
  { label: "Good",     color: "#06b6d4",     w: "75%"  },
  { label: "Strong",   color: "#10b981",     w: "87%"  },
  { label: "Excellent",color: "#10b981",     w: "100%" },
];

const Registration = () => {
  const { t }    = useTranslation();
  const navigate = useNavigate();
  const [form,     setForm]     = useState({ name:"", email:"", phone:"", password:"" });
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);
  const [focused,  setFocused]  = useState({});

  const strength = useMemo(() => scorePassword(form.password), [form.password]);
  const active = (name) => focused[name] || !!form[name];

  const onChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await api.post("/auth/register", form);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.response?.data || t("auth.registerFail","Registration failed. Please try again."));
      setLoading(false);
    }
  };

  const FIELDS = [
    { name:"name",     label:"Full Name",      type:"text",     icon:"👤", ph:"",ac:"name"         },
    { name:"email",    label:"Email Address",  type:"email",    icon:"✉️", ph:"",ac:"email"        },
    { name:"phone",    label:"Phone Number",   type:"tel",      icon:"📱", ph:"",ac:"tel"          },
    { name:"password", label:"Password",       type:"password", icon:"🔑", ph:"",ac:"new-password" },
  ];

  const completedFields = FIELDS.filter(f => !!form[f.name]).length;
  const progressPct = Math.round((completedFields / FIELDS.length) * 100);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Sora:wght@600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; font-family:'Plus Jakarta Sans',sans-serif; }

        /* ─── root ─── */
        .rx-root{
          position:relative;min-height:100vh;overflow:hidden;display:flex;
          background:linear-gradient(160deg,#f5f0ff 0%,#ede8ff 28%,#f8f0ff 55%,#fde7f3 82%,#fff0fb 100%);
          color:#1e1b4b;
        }

        /* ─── background ─── */
        .rx-mesh{position:fixed;inset:0;z-index:0;pointer-events:none;}
        .rx-orb{position:absolute;border-radius:50%;filter:blur(90px);will-change:transform;}
        .rx-o1{width:580px;height:580px;top:-160px;right:-100px;
          background:radial-gradient(circle,rgba(124,58,237,.18)0%,transparent 65%);
          animation:rxO1 22s ease-in-out infinite alternate;}
        .rx-o2{width:460px;height:460px;bottom:-110px;left:-90px;
          background:radial-gradient(circle,rgba(236,72,153,.15)0%,transparent 65%);
          animation:rxO2 26s ease-in-out infinite alternate 4s;}
        .rx-o3{width:300px;height:300px;top:35%;right:30%;
          background:radial-gradient(circle,rgba(99,102,241,.12)0%,transparent 65%);
          animation:rxO1 18s ease-in-out infinite alternate 8s;}
        .rx-o4{width:220px;height:220px;top:8%;left:30%;
          background:radial-gradient(circle,rgba(6,182,212,.1)0%,transparent 65%);
          animation:rxO2 14s ease-in-out infinite alternate 11s;}
        @keyframes rxO1{0%{transform:translate(0,0)scale(1)}100%{transform:translate(-45px,65px)scale(1.1)}}
        @keyframes rxO2{0%{transform:translate(0,0)scale(1)}100%{transform:translate(50px,-55px)scale(1.08)}}

        .rx-dots{
          position:fixed;inset:0;z-index:0;pointer-events:none;
          background-image:radial-gradient(circle,rgba(124,58,237,.16)1px,transparent 1px);
          background-size:30px 30px;opacity:.28;
        }

        .rx-pts{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;}
        .rx-pt{
          position:absolute;border-radius:50%;
          width:calc(1.5px+var(--i)*.35px);height:calc(1.5px+var(--i)*.35px);
          background:rgba(124,58,237,calc(.065+var(--i)*.009));
          left:calc(var(--i)*6.6%+1%);bottom:-8px;
          animation:rxPt calc(11s+var(--i)*.65s) linear calc(var(--i)*.55s) infinite;
        }
        @keyframes rxPt{0%{transform:translateY(0);opacity:0}8%{opacity:1}88%{opacity:.18}100%{transform:translateY(-106vh);opacity:0}}

        /* ─── layout ─── */
        .rx-wrap{position:relative;z-index:10;display:flex;width:100%;min-height:100vh;}

        /* ════ LEFT ════ */
        .rx-left{
          flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
          padding:64px 56px;
          border-right:1.5px solid rgba(124,58,237,.1);
          animation:rxSlL .75s cubic-bezier(.4,0,.2,1) both;
          position:relative;
        }
        @keyframes rxSlL{from{opacity:0;transform:translateX(-36px)}to{opacity:1;transform:translateX(0)}}
        .rx-li{max-width:460px;width:100%;position:relative;}

        /* brand */
        .rx-brand{
          display:inline-flex;align-items:center;gap:11px;
          padding:9px 22px;border-radius:40px;margin-bottom:42px;
          background:rgba(255,255,255,.82);border:1.5px solid rgba(124,58,237,.2);
          backdrop-filter:blur(16px) saturate(180%);
          box-shadow:0 6px 28px rgba(124,58,237,.13),inset 0 1px 0 rgba(255,255,255,.95);
          animation:dropIn .55s cubic-bezier(.34,1.56,.64,1) .12s both;
          transition:transform .25s,box-shadow .25s;cursor:default;
        }
        .rx-brand:hover{transform:translateY(-3px);box-shadow:0 10px 36px rgba(124,58,237,.2),inset 0 1px 0 rgba(255,255,255,.95);}
        @keyframes dropIn{from{opacity:0;transform:translateY(-14px)scale(.92)}to{opacity:1;transform:translateY(0)scale(1)}}
        .rx-brand-icon{
          width:34px;height:34px;border-radius:10px;flex-shrink:0;
          background:linear-gradient(135deg,#7c3aed,#ec4899);
          display:flex;align-items:center;justify-content:center;font-size:18px;
          box-shadow:0 4px 14px rgba(124,58,237,.38);
          animation:spinPop .95s cubic-bezier(.34,1.56,.64,1) both;
        }
        @keyframes spinPop{from{transform:rotate(-180deg)scale(0)}to{transform:rotate(0)scale(1)}}
        .rx-brand-name{
          font-family:'Sora',sans-serif;font-size:15.5px;font-weight:800;letter-spacing:-.02em;
          background:linear-gradient(135deg,#7c3aed,#ec4899);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
        }

        /* headline */
        .rx-h1{
          font-family:'Sora',sans-serif;
          font-size:clamp(44px,5.5vw,70px);font-weight:800;
          letter-spacing:-.045em;line-height:1.03;color:#1e1b4b;
          margin-bottom:20px;
          animation:riseUp .7s ease .2s both;
        }
        .rx-grad{
          background:linear-gradient(135deg,#7c3aed 15%,#ec4899 52%,#a855f7 88%);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
        }
        @keyframes riseUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}

        .rx-sub{
          font-size:16px;line-height:1.75;
          color:rgba(109,40,217,.6);
          margin-bottom:36px;max-width:370px;
          animation:riseUp .7s ease .28s both;
        }

        /* step list */
        .rx-steps{display:flex;flex-direction:column;gap:16px;animation:riseUp .7s ease .34s both;}
        .rx-step{
          display:flex;align-items:flex-start;gap:14px;
          padding:14px 16px;border-radius:16px;
          background:rgba(255,255,255,.72);border:1.5px solid rgba(124,58,237,.12);
          backdrop-filter:blur(10px);
          transition:all .24s;cursor:default;
        }
        .rx-step:hover{background:rgba(255,255,255,.9);border-color:rgba(124,58,237,.26);transform:translateX(4px);box-shadow:0 6px 20px rgba(124,58,237,.1);}
        .rx-step-n{
          width:36px;height:36px;border-radius:11px;flex-shrink:0;
          background:linear-gradient(135deg,rgba(124,58,237,.12),rgba(168,85,247,.1));
          border:1.5px solid rgba(124,58,237,.22);color:#7c3aed;
          font-size:11px;font-weight:900;letter-spacing:.04em;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 2px 10px rgba(124,58,237,.1);
        }
        .rx-step-title{font-size:14px;font-weight:800;color:#1e1b4b;margin-bottom:2px;}
        .rx-step-desc{font-size:12px;color:rgba(109,40,217,.55);line-height:1.5;font-weight:500;}

        /* ════ RIGHT FORM ════ */
        .rx-right{
          width:540px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          padding:44px 44px;
          animation:rxSlR .75s cubic-bezier(.4,0,.2,1) .07s both;
          overflow-y:auto;
        }
        @keyframes rxSlR{from{opacity:0;transform:translateX(36px)}to{opacity:1;transform:translateX(0)}}

        /* glass card */
        .rx-card{
          width:100%;max-width:430px;
          border-radius:28px;padding:38px 34px;
          display:flex;flex-direction:column;gap:20px;
          background:rgba(255,255,255,.88);
          backdrop-filter:blur(32px) saturate(200%);
          -webkit-backdrop-filter:blur(32px) saturate(200%);
          border:1.5px solid rgba(124,58,237,.14);
          box-shadow:0 28px 72px rgba(124,58,237,.15),inset 0 1px 0 rgba(255,255,255,.98);
          position:relative;overflow:hidden;
        }
        .rx-card::before{
          content:'';position:absolute;top:-50px;right:-50px;
          width:160px;height:160px;border-radius:50%;
          background:radial-gradient(circle,rgba(124,58,237,.08)0%,transparent 70%);
          pointer-events:none;
        }
        .rx-card::after{
          content:'';position:absolute;bottom:-40px;left:-40px;
          width:120px;height:120px;border-radius:50%;
          background:radial-gradient(circle,rgba(236,72,153,.07)0%,transparent 70%);
          pointer-events:none;
        }

        /* header */
        .rx-hdr{display:flex;align-items:center;gap:16px;}
        .rx-hdr-icon{
          width:54px;height:54px;border-radius:17px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;font-size:26px;
          background:rgba(124,58,237,.1);
          border:1.5px solid rgba(124,58,237,.24);
          box-shadow:0 0 26px rgba(124,58,237,.18),inset 0 1px 0 rgba(255,255,255,.8);
          animation:spinPop .95s cubic-bezier(.34,1.56,.64,1) both;
        }
        .rx-hdr-title{
          font-family:'Sora',sans-serif;font-size:23px;font-weight:800;
          letter-spacing:-.035em;color:#1e1b4b;
        }
        .rx-hdr-sub{font-size:13px;color:rgba(109,40,217,.55);font-weight:500;margin-top:3px;}

        /* progress bar */
        .rx-progress-wrap{display:flex;flex-direction:column;gap:6px;}
        .rx-progress-top{display:flex;justify-content:space-between;align-items:center;}
        .rx-progress-label{font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:rgba(124,58,237,.5);}
        .rx-progress-pct{font-size:12px;font-weight:800;color:#7c3aed;}
        .rx-progress-track{height:5px;background:rgba(124,58,237,.1);border-radius:99px;overflow:hidden;}
        .rx-progress-fill{
          height:100%;border-radius:99px;
          background:linear-gradient(90deg,#7c3aed,#ec4899);
          transition:width .5s cubic-bezier(.4,0,.2,1);
          box-shadow:0 0 8px rgba(124,58,237,.35);
        }

        /* error / success */
        .rx-err{
          padding:12px 15px;border-radius:13px;font-size:13px;font-weight:600;
          background:rgba(239,68,68,.08);border:1.5px solid rgba(239,68,68,.24);
          color:#dc2626;display:flex;align-items:center;gap:9px;
          animation:shake .42s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake{10%,90%{transform:translateX(-2px)}20%,80%{transform:translateX(4px)}30%,50%,70%{transform:translateX(-5px)}40%,60%{transform:translateX(5px)}}
        .rx-success{
          padding:14px 16px;border-radius:13px;font-size:13.5px;font-weight:700;
          background:rgba(16,185,129,.09);border:1.5px solid rgba(16,185,129,.28);
          color:#059669;display:flex;align-items:center;gap:10px;
          animation:dropIn .4s cubic-bezier(.34,1.56,.64,1) both;
        }

        /* ── floating-label field ── */
        .rx-field{position:relative;}
        .rx-fi{position:relative;display:flex;align-items:center;}
        .rx-ficon{position:absolute;left:15px;font-size:16px;pointer-events:none;z-index:2;}
        .rx-input{
          width:100%;padding:20px 15px 8px 44px;
          border-radius:13px;font-size:14.5px;font-weight:500;
          font-family:inherit;outline:none;appearance:none;
          background:rgba(255,255,255,.78);
          border:1.5px solid rgba(124,58,237,.18);
          color:#1e1b4b;
          transition:border .22s,box-shadow .22s,background .22s;
        }
        .rx-input::placeholder{color:transparent;}
        .rx-input:focus{
          border-color:#7c3aed;background:rgba(255,255,255,.97);
          box-shadow:0 0 0 4px rgba(124,58,237,.11);
        }
        .rx-label{
          position:absolute;left:44px;top:50%;
          transform:translateY(-50%);
          font-size:14px;font-weight:500;color:rgba(109,40,217,.48);
          pointer-events:none;
          transition:all .22s cubic-bezier(.4,0,.2,1);
          transform-origin:left center;
        }
        .rx-label.up{
          top:10px;transform:translateY(0) scale(.78);
          color:#7c3aed;font-weight:700;
        }
        /* Valid state tick */
        .rx-check{
          position:absolute;right:14px;font-size:14px;z-index:2;
          animation:popIn .3s cubic-bezier(.34,1.56,.64,1) both;
        }
        @keyframes popIn{from{transform:scale(0)}to{transform:scale(1)}}

        .rx-eye{
          position:absolute;right:14px;font-size:16px;line-height:1;
          background:none;border:none;cursor:pointer;padding:4px;z-index:2;
          color:rgba(109,40,217,.4);transition:color .2s,transform .2s;
        }
        .rx-eye:hover{color:#7c3aed;transform:scale(1.15);}

        /* password strength */
        .rx-pw-meta{display:flex;flex-direction:column;gap:5px;padding-top:2px;}
        .rx-pw-track{height:4px;background:rgba(124,58,237,.1);border-radius:99px;overflow:hidden;}
        .rx-pw-fill{height:100%;border-radius:99px;transition:width .4s ease,background .4s ease;}
        .rx-pw-hints{display:flex;justify-content:space-between;align-items:center;}
        .rx-pw-label{font-size:11px;font-weight:700;}
        .rx-pw-reqs{display:flex;gap:8px;}
        .rx-pw-req{font-size:10px;font-weight:600;padding:2px 8px;border-radius:8px;transition:all .2s;}
        .rx-pw-req.met{background:rgba(16,185,129,.1);color:#059669;}
        .rx-pw-req.unmet{background:rgba(124,58,237,.07);color:rgba(109,40,217,.45);}

        /* submit */
        .rx-btn{
          width:100%;padding:14px;border-radius:14px;font-size:15.5px;font-weight:800;
          color:#fff;border:none;cursor:pointer;letter-spacing:.02em;
          background:linear-gradient(135deg,#7c3aed 0%,#a855f7 50%,#ec4899 100%);
          background-size:200% 200%;background-position:0% 50%;
          box-shadow:0 8px 28px rgba(124,58,237,.42);
          display:flex;align-items:center;justify-content:center;gap:10px;
          transition:all .28s cubic-bezier(.4,0,.2,1);
          position:relative;overflow:hidden;
        }
        .rx-btn::before{
          content:'';position:absolute;inset:0;
          background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.22),transparent 70%);
          transform:translateX(-100%);transition:transform .55s ease;
        }
        .rx-btn:hover::before{transform:translateX(100%);}
        .rx-btn:hover:not(:disabled){
          background-position:100% 50%;
          transform:translateY(-3px);
          box-shadow:0 14px 40px rgba(124,58,237,.5);
          filter:brightness(1.06);
        }
        .rx-btn:active:not(:disabled){transform:translateY(0);box-shadow:0 6px 20px rgba(124,58,237,.38);}
        .rx-btn:disabled{opacity:.65;cursor:not-allowed;}
        .rx-btn.done{background:linear-gradient(135deg,#10b981,#06b6d4)!important;box-shadow:0 8px 28px rgba(16,185,129,.4)!important;}
        .rx-spin{width:18px;height:18px;border-radius:50%;flex-shrink:0;border:2.5px solid rgba(255,255,255,.3);border-top-color:#fff;animation:spin .75s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg)}}

        /* login link */
        .rx-divider{display:flex;align-items:center;gap:12px;}
        .rx-div-line{flex:1;height:1px;background:rgba(124,58,237,.12);}
        .rx-div-txt{font-size:11.5px;color:rgba(109,40,217,.45);white-space:nowrap;font-weight:600;}
        .rx-login-link{
          display:block;text-align:center;padding:13px;border-radius:14px;
          font-size:14px;font-weight:700;text-decoration:none;
          color:#7c3aed;
          border:1.5px solid rgba(124,58,237,.2);
          background:rgba(124,58,237,.05);
          backdrop-filter:blur(8px);
          transition:all .24s;
        }
        .rx-login-link:hover{background:rgba(124,58,237,.11);border-color:rgba(124,58,237,.36);transform:translateY(-2px);box-shadow:0 6px 20px rgba(124,58,237,.13);}
        .rx-login-link span{color:rgba(109,40,217,.5);font-weight:500;}

        /* terms */
        .rx-terms{font-size:11px;text-align:center;color:rgba(109,40,217,.45);line-height:1.6;}
        .rx-terms a{color:#7c3aed;font-weight:600;text-decoration:none;}
        .rx-terms a:hover{text-decoration:underline;}

        /* responsive */
        @media(max-width:940px){
          .rx-left{display:none;}
          .rx-right{width:100%;padding:32px 20px;}
          .rx-card{max-width:100%;}
        }
        @media(max-width:500px){
          .rx-right{padding:22px 14px;}
          .rx-card{padding:26px 20px;gap:16px;border-radius:22px;}
          .rx-hdr-title{font-size:20px;}
        }
      `}</style>

      <div className="rx-root">
        <div className="rx-mesh">
          <div className="rx-orb rx-o1"/><div className="rx-orb rx-o2"/>
          <div className="rx-orb rx-o3"/><div className="rx-orb rx-o4"/>
        </div>
        <div className="rx-dots" />
        <div className="rx-pts">
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i} className="rx-pt" style={{ "--i": i }} />
          ))}
        </div>

        <div className="rx-wrap">

          {/* ════ LEFT HERO ════ */}
          <div className="rx-left">
            <div className="rx-li">
              <div className="rx-brand">
                <div className="rx-brand-icon">🎓</div>
                <span className="rx-brand-name">ExamPrep</span>
              </div>

              <h1 className="rx-h1">Join<br /><span className="rx-grad">The Team.</span></h1>

              <p className="rx-sub">
                Create your account and unlock the full power of AI-driven exam preparation.
              </p>

              <div className="rx-steps">
                {[
                  ["01","Create Account",   "Fill in your details below"],
                  ["02","Instant Access",   "Dashboard unlocks immediately"],
                  ["03","Start Practising", "Tests, analytics, every exam covered"],
                ].map(([n, title, desc]) => (
                  <div key={n} className="rx-step">
                    <div className="rx-step-n">{n}</div>
                    <div>
                      <div className="rx-step-title">{title}</div>
                      <div className="rx-step-desc">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ════ RIGHT FORM ════ */}
          <div className="rx-right">
            <form className="rx-card" onSubmit={onSubmit} noValidate>

              <div className="rx-hdr">
                <div className="rx-hdr-icon">✨</div>
                <div>
                  <h2 className="rx-hdr-title">Create Account</h2>
                  <p className="rx-hdr-sub">Join ExamPrep — it's free</p>
                </div>
              </div>

              {/* form completion progress */}
              <div className="rx-progress-wrap">
                <div className="rx-progress-top">
                  <span className="rx-progress-label">Profile completion</span>
                  <span className="rx-progress-pct">{progressPct}%</span>
                </div>
                <div className="rx-progress-track">
                  <div className="rx-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
              </div>

              {error   && <div className="rx-err">⚠️ {error}</div>}
              {success && <div className="rx-success">🎉 Account created! Redirecting to login…</div>}

              {/* fields */}
              {FIELDS.map(({ name, label, type, icon, ac }, idx) => {
                const isActive  = active(name);
                const isDone    = !!form[name] && !focused[name];
                const showEye   = name === "password";
                const inputType = showEye ? (showPass ? "text" : "password") : type;

                return (
                  <div key={name} className="rx-field"
                    style={{ animation:`riseUp .5s ease ${idx * .07}s both` }}>
                    <div className="rx-fi">
                      <span className="rx-ficon">{icon}</span>
                      <input
                        className="rx-input"
                        type={inputType}
                        name={name}
                        value={form[name]}
                        onChange={onChange}
                        onFocus={() => setFocused(p => ({ ...p, [name]: true }))}
                        onBlur={()  => setFocused(p => ({ ...p, [name]: false }))}
                        placeholder={label}
                        required
                        autoComplete={ac}
                      />
                      <label className={`rx-label${isActive ? " up" : ""}`}>{label}</label>

                      {showEye ? (
                        <button type="button" className="rx-eye"
                          onClick={() => setShowPass(s => !s)} tabIndex={-1}>
                          {showPass ? "🙈" : "👁️"}
                        </button>
                      ) : (
                        isDone && form[name].length > 1 && (
                          <span className="rx-check">✅</span>
                        )
                      )}
                    </div>

                    {/* password strength */}
                    {name === "password" && form.password && (
                      <div className="rx-pw-meta">
                        <div className="rx-pw-track">
                          <div className="rx-pw-fill"
                            style={{ width: STRENGTH[strength].w, background: STRENGTH[strength].color }} />
                        </div>
                        <div className="rx-pw-hints">
                          <span className="rx-pw-label" style={{ color: STRENGTH[strength].color }}>
                            {STRENGTH[strength].label}
                          </span>
                          <div className="rx-pw-reqs">
                            {[
                              { lbl: "8+ chars", met: form.password.length >= 8 },
                              { lbl: "A–Z",       met: /[A-Z]/.test(form.password) },
                              { lbl: "0–9",       met: /[0-9]/.test(form.password) },
                            ].map(r => (
                              <span key={r.lbl} className={`rx-pw-req ${r.met ? "met" : "unmet"}`}>
                                {r.met ? "✓" : "·"} {r.lbl}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* terms */}
              <p className="rx-terms">
                By creating an account you agree to our{" "}
                <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
              </p>

              <button
                type="submit"
                className={`rx-btn${success ? " done" : ""}`}
                disabled={loading || success}
              >
                {loading  ? <><span className="rx-spin"/> Creating account…</>
                : success ? <>🎉 Account Created!</>
                :           <>Create Account →</>}
              </button>

              <div className="rx-divider">
                <span className="rx-div-line"/><span className="rx-div-txt">already a member?</span><span className="rx-div-line"/>
              </div>

              <Link to="/login" className="rx-login-link">
                <span>Have an account?</span> Sign In Instead →
              </Link>

            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Registration;