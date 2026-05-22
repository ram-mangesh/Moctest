import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../Api/axios";

const Login = () => {
  const { t }    = useTranslation();
  const navigate = useNavigate();
  const [form,     setForm]     = useState({ email: "", password: "" });
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);
  const [focused,  setFocused]  = useState({});

  const active = (name) => focused[name] || !!form[name];

  const onChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token",  res.data.token);
      localStorage.setItem("role",   res.data.role);
      localStorage.setItem("name",   res.data.name);
      localStorage.setItem("userId", res.data.id);
      setSuccess(true);
      setTimeout(() => navigate(res.data.role === "ADMIN" ? "/admin" : "/home"), 900);
    } catch {
      setError(t("auth.invalidLogin", "Invalid email or password. Please try again."));
      setLoading(false);
    }
  };

  const FEATURES = [
    { icon: "📝", text: "Exam Manager" },
    { icon: "🤖", text: "AI Generator" },
    { icon: "📊", text: "Analytics"    },
    { icon: "🔒", text: "Secure"       },
    { icon: "⚡",  text: "Instant Access" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Sora:wght@600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; font-family:'Plus Jakarta Sans',sans-serif; }

        /* ─── root ─── */
        .lx-root {
          position:relative; min-height:100vh; overflow:hidden;
          display:flex;
          background:linear-gradient(160deg,#eef0ff 0%,#e8ecff 28%,#f0eaff 55%,#fce8f3 82%,#fef3fb 100%);
          color:#1e1b4b;
        }

        /* ─── animated mesh orbs ─── */
        .lx-mesh { position:fixed;inset:0;z-index:0;pointer-events:none; }
        .lx-orb {
          position:absolute; border-radius:50%; filter:blur(88px); will-change:transform;
        }
        .lx-orb1 {
          width:620px;height:620px;top:-180px;left:-120px;
          background:radial-gradient(circle,rgba(99,102,241,.2)0%,transparent 65%);
          animation:o1 20s ease-in-out infinite alternate;
        }
        .lx-orb2 {
          width:500px;height:500px;bottom:-120px;right:-90px;
          background:radial-gradient(circle,rgba(168,85,247,.16)0%,transparent 65%);
          animation:o2 25s ease-in-out infinite alternate 3s;
        }
        .lx-orb3 {
          width:320px;height:320px;top:38%;left:42%;
          background:radial-gradient(circle,rgba(236,72,153,.12)0%,transparent 65%);
          animation:o3 16s ease-in-out infinite alternate 6s;
        }
        .lx-orb4 {
          width:260px;height:260px;top:10%;right:28%;
          background:radial-gradient(circle,rgba(6,182,212,.1)0%,transparent 65%);
          animation:o1 19s ease-in-out infinite alternate 9s;
        }
        @keyframes o1{0%{transform:translate(0,0)scale(1)}100%{transform:translate(50px,70px)scale(1.1)}}
        @keyframes o2{0%{transform:translate(0,0)scale(1)}100%{transform:translate(-45px,55px)scale(1.08)}}
        @keyframes o3{0%{transform:translate(0,0)}100%{transform:translate(-35px,-45px)}}

        /* dot grid */
        .lx-dots {
          position:fixed;inset:0;z-index:0;pointer-events:none;
          background-image:radial-gradient(circle,rgba(99,102,241,.17)1px,transparent 1px);
          background-size:30px 30px; opacity:.3;
        }

        /* particles */
        .lx-pts{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;}
        .lx-pt{
          position:absolute;border-radius:50%;
          width:calc(1.5px + var(--i)*.35px);height:calc(1.5px + var(--i)*.35px);
          background:rgba(99,102,241,calc(.07+var(--i)*.009));
          left:calc(var(--i)*6.6%+1%);bottom:-8px;
          animation:ptUp calc(11s+var(--i)*.6s) linear calc(var(--i)*.5s) infinite;
        }
        @keyframes ptUp{0%{transform:translateY(0);opacity:0}8%{opacity:1}88%{opacity:.18}100%{transform:translateY(-106vh);opacity:0}}

        /* ─── layout ─── */
        .lx-wrap{position:relative;z-index:10;display:flex;width:100%;min-height:100vh;}

        /* ═══ LEFT HERO ═══ */
        .lx-left{
          flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
          padding:64px 56px;
          border-right:1.5px solid rgba(99,102,241,.1);
          animation:fromLeft .75s cubic-bezier(.4,0,.2,1) both;
          position:relative;
        }
        @keyframes fromLeft{from{opacity:0;transform:translateX(-36px)}to{opacity:1;transform:translateX(0)}}
        .lx-li{max-width:460px;width:100%;position:relative;}

        /* brand pill */
        .lx-brand{
          display:inline-flex;align-items:center;gap:11px;
          padding:9px 22px;border-radius:40px;margin-bottom:44px;
          background:rgba(255,255,255,.82);
          border:1.5px solid rgba(99,102,241,.2);
          backdrop-filter:blur(16px) saturate(180%);
          box-shadow:0 6px 28px rgba(99,102,241,.13),inset 0 1px 0 rgba(255,255,255,.95);
          animation:dropIn .55s cubic-bezier(.34,1.56,.64,1) .12s both;
          transition:transform .25s,box-shadow .25s;cursor:default;
        }
        .lx-brand:hover{transform:translateY(-3px);box-shadow:0 10px 36px rgba(99,102,241,.2),inset 0 1px 0 rgba(255,255,255,.95);}
        @keyframes dropIn{from{opacity:0;transform:translateY(-14px)scale(.92)}to{opacity:1;transform:translateY(0)scale(1)}}
        .lx-brand-icon{
          width:34px;height:34px;border-radius:10px;flex-shrink:0;
          background:linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899);
          display:flex;align-items:center;justify-content:center;font-size:18px;
          box-shadow:0 4px 14px rgba(99,102,241,.38);
          animation:spinPop .95s cubic-bezier(.34,1.56,.64,1) both;
        }
        @keyframes spinPop{from{transform:rotate(-180deg)scale(0)}to{transform:rotate(0)scale(1)}}
        .lx-brand-name{
          font-family:'Sora',sans-serif;font-size:15.5px;font-weight:800;letter-spacing:-.02em;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
        }

        /* headline */
        .lx-h1{
          font-family:'Sora',sans-serif;
          font-size:clamp(44px,5.5vw,70px);font-weight:800;
          letter-spacing:-.045em;line-height:1.03;color:#1e1b4b;
          margin-bottom:20px;
          animation:riseUp .7s ease .2s both;
        }
        .lx-grad{
          background:linear-gradient(135deg,#6366f1 15%,#8b5cf6 52%,#06b6d4 88%);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
        }
        @keyframes riseUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}

        .lx-sub{
          font-size:16px;line-height:1.75;
          color:rgba(67,56,202,.62);
          margin-bottom:34px;max-width:370px;
          animation:riseUp .7s ease .28s both;
        }

        /* chips */
        .lx-chips{display:flex;flex-wrap:wrap;gap:9px;margin-bottom:44px;animation:riseUp .7s ease .34s both;}
        .lx-chip{
          display:inline-flex;align-items:center;gap:6px;
          font-size:12px;font-weight:600;padding:6px 15px;border-radius:24px;
          background:rgba(255,255,255,.75);border:1.5px solid rgba(99,102,241,.17);
          color:#4338ca;backdrop-filter:blur(8px);
          transition:all .22s;cursor:default;
        }
        .lx-chip:hover{background:rgba(99,102,241,.1);border-color:rgba(99,102,241,.36);transform:translateY(-2px) scale(1.04);box-shadow:0 6px 18px rgba(99,102,241,.14);}

        /* glass stat card */
        .lx-card-deco{
          border-radius:22px;padding:22px 24px;
          background:rgba(255,255,255,.86);
          backdrop-filter:blur(26px) saturate(200%);
          border:1.5px solid rgba(99,102,241,.12);
          box-shadow:0 16px 48px rgba(99,102,241,.13),inset 0 1px 0 rgba(255,255,255,.98);
          animation:riseUp .7s ease .42s both;
          position:relative;overflow:hidden;
        }
        .lx-card-deco::after{
          content:'';position:absolute;top:-35px;right:-35px;
          width:110px;height:110px;border-radius:50%;
          background:radial-gradient(circle,rgba(99,102,241,.12)0%,transparent 70%);
          pointer-events:none;
        }
        .lx-deco-top{display:flex;align-items:center;gap:12px;margin-bottom:20px;}
        .lx-deco-av{
          width:42px;height:42px;border-radius:50%;flex-shrink:0;
          background:linear-gradient(135deg,#6366f1,#06b6d4);
          color:#fff;font-size:17px;font-weight:900;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 4px 16px rgba(99,102,241,.34);
        }
        .lx-deco-uname{font-size:14px;font-weight:800;color:#1e1b4b;}
        .lx-deco-role{font-size:11.5px;color:#10b981;font-weight:700;margin-top:1px;}
        .lx-deco-badge{
          margin-left:auto;padding:4px 12px;border-radius:22px;
          font-size:10.5px;font-weight:800;letter-spacing:.05em;
          background:linear-gradient(135deg,rgba(99,102,241,.12),rgba(139,92,246,.1));
          color:#4338ca;border:1px solid rgba(99,102,241,.22);
        }
        .lx-stats{display:flex;}
        .lx-stat{flex:1;text-align:center;padding:10px 4px;border-right:1px solid rgba(99,102,241,.1);}
        .lx-stat:last-child{border-right:none;}
        .lx-stat b{display:block;font-size:22px;font-weight:900;color:#1e1b4b;letter-spacing:-.03em;}
        .lx-stat small{font-size:9.5px;text-transform:uppercase;letter-spacing:.1em;color:rgba(99,102,241,.5);font-weight:700;}

        /* ─── responsive ─── */
        .lx-right{
          width:530px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          padding:48px 48px;
          animation:fromRight .75s cubic-bezier(.4,0,.2,1) .07s both;
        }
        @keyframes fromRight{from{opacity:0;transform:translateX(36px)}to{opacity:1;transform:translateX(0)}}

        /* glass card */
        .lx-card{
          width:100%;max-width:420px;
          border-radius:28px;padding:40px 36px;
          display:flex;flex-direction:column;gap:22px;
          background:rgba(255,255,255,.88);
          backdrop-filter:blur(32px) saturate(200%);
          -webkit-backdrop-filter:blur(32px) saturate(200%);
          border:1.5px solid rgba(99,102,241,.14);
          box-shadow:0 28px 72px rgba(99,102,241,.16),inset 0 1px 0 rgba(255,255,255,.98);
          position:relative;overflow:hidden;
        }
        .lx-card::before{
          content:'';position:absolute;top:-50px;right:-50px;
          width:160px;height:160px;border-radius:50%;
          background:radial-gradient(circle,rgba(99,102,241,.08)0%,transparent 70%);
          pointer-events:none;
        }
        .lx-card::after{
          content:'';position:absolute;bottom:-40px;left:-40px;
          width:130px;height:130px;border-radius:50%;
          background:radial-gradient(circle,rgba(168,85,247,.07)0%,transparent 70%);
          pointer-events:none;
        }

        /* card header */
        .lx-card-hdr{display:flex;align-items:center;gap:16px;}
        .lx-card-icon{
          width:54px;height:54px;border-radius:17px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;font-size:26px;
          background:rgba(99,102,241,.1);
          border:1.5px solid rgba(99,102,241,.24);
          box-shadow:0 0 26px rgba(99,102,241,.2),inset 0 1px 0 rgba(255,255,255,.8);
          animation:spinPop .95s cubic-bezier(.34,1.56,.64,1) both;
        }
        .lx-card-title{
          font-family:'Sora',sans-serif;font-size:24px;font-weight:800;
          letter-spacing:-.035em;color:#1e1b4b;
        }
        .lx-card-sub{font-size:13px;color:rgba(99,102,241,.55);font-weight:500;margin-top:3px;}

        /* error */
        .lx-err{
          padding:12px 15px;border-radius:13px;font-size:13px;font-weight:600;
          background:rgba(239,68,68,.08);border:1.5px solid rgba(239,68,68,.24);
          color:#dc2626;display:flex;align-items:center;gap:9px;
          animation:shake .42s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake{10%,90%{transform:translateX(-2px)}20%,80%{transform:translateX(4px)}30%,50%,70%{transform:translateX(-5px)}40%,60%{transform:translateX(5px)}}

        /* success */
        .lx-success{
          padding:14px 16px;border-radius:13px;font-size:13.5px;font-weight:700;
          background:rgba(16,185,129,.09);border:1.5px solid rgba(16,185,129,.28);
          color:#059669;display:flex;align-items:center;gap:10px;
          animation:dropIn .4s cubic-bezier(.34,1.56,.64,1) both;
        }

        /* ── floating-label field ── */
        .lx-field{position:relative;margin-bottom:0;}
        .lx-field-inner{position:relative;display:flex;align-items:center;}

        .lx-ficon{
          position:absolute;left:15px;font-size:16px;pointer-events:none;z-index:2;
          transition:opacity .2s;
        }
        .lx-finput{
          width:100%;padding:20px 15px 8px 44px;
          border-radius:13px;font-size:14.5px;font-weight:500;
          font-family:inherit;outline:none;
          background:rgba(255,255,255,.78);
          border:1.5px solid rgba(99,102,241,.18);
          color:#1e1b4b;
          transition:border .22s,box-shadow .22s,background .22s;
          appearance:none;
        }
        .lx-finput::placeholder{color:transparent;}
        .lx-finput:focus{
          border-color:#6366f1;background:rgba(255,255,255,.97);
          box-shadow:0 0 0 4px rgba(99,102,241,.11);
        }

        /* floating label */
        .lx-flabel{
          position:absolute;left:44px;top:50%;
          transform:translateY(-50%);
          font-size:14px;font-weight:500;color:rgba(99,102,241,.5);
          pointer-events:none;
          transition:all .22s cubic-bezier(.4,0,.2,1);
          transform-origin:left center;
        }
        .lx-flabel.up{
          top:10px;transform:translateY(0) scale(.78);
          color:#6366f1;font-weight:700;
        }

        .lx-eye{
          position:absolute;right:14px;font-size:16px;line-height:1;
          background:none;border:none;cursor:pointer;padding:4px;z-index:2;
          color:rgba(99,102,241,.4);transition:color .2s,transform .2s;
        }
        .lx-eye:hover{color:#6366f1;transform:scale(1.15);}

        /* ── submit button ── */
        .lx-btn{
          width:100%;padding:14px;border-radius:14px;font-size:15.5px;font-weight:800;
          color:#fff;border:none;cursor:pointer;letter-spacing:.02em;
          background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#06b6d4 100%);
          background-size:200% 200%;background-position:0% 50%;
          box-shadow:0 8px 28px rgba(99,102,241,.42);
          display:flex;align-items:center;justify-content:center;gap:10px;
          transition:all .28s cubic-bezier(.4,0,.2,1);
          position:relative;overflow:hidden;
        }
        .lx-btn::before{
          content:'';position:absolute;inset:0;
          background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.22),transparent 70%);
          transform:translateX(-100%);transition:transform .55s ease;
        }
        .lx-btn:hover::before{transform:translateX(100%);}
        .lx-btn:hover:not(:disabled){
          background-position:100% 50%;
          transform:translateY(-3px);
          box-shadow:0 14px 40px rgba(99,102,241,.5);
          filter:brightness(1.06);
        }
        .lx-btn:active:not(:disabled){transform:translateY(0);box-shadow:0 6px 20px rgba(99,102,241,.38);}
        .lx-btn:disabled{opacity:.65;cursor:not-allowed;}
        .lx-btn.success-state{
          background:linear-gradient(135deg,#10b981,#06b6d4) !important;
          box-shadow:0 8px 28px rgba(16,185,129,.4) !important;
        }
        .lx-spin{
          width:18px;height:18px;border-radius:50%;flex-shrink:0;
          border:2.5px solid rgba(255,255,255,.3);border-top-color:#fff;
          animation:spin .75s linear infinite;
        }
        @keyframes spin{to{transform:rotate(360deg)}}

        /* ── register link ── */
        .lx-reg-link{
          display:block;text-align:center;padding:13px;border-radius:14px;
          font-size:14px;font-weight:700;text-decoration:none;
          color:#4338ca;
          border:1.5px solid rgba(99,102,241,.2);
          background:rgba(99,102,241,.05);
          backdrop-filter:blur(8px);
          transition:all .24s;
        }
        .lx-reg-link:hover{
          background:rgba(99,102,241,.11);border-color:rgba(99,102,241,.36);
          transform:translateY(-2px);box-shadow:0 6px 20px rgba(99,102,241,.13);
        }
        .lx-reg-link span{color:rgba(99,102,241,.5);font-weight:500;}

        /* forgot */
        .lx-forgot{
          text-align:right;font-size:12px;font-weight:700;
          color:rgba(99,102,241,.55);cursor:pointer;transition:color .18s;
          text-decoration:none;display:block;margin-top:-10px;
        }
        .lx-forgot:hover{color:#6366f1;}

        /* ─── responsive ─── */
        @media(max-width:940px){
          .lx-left{display:none;}
          .lx-right{width:100%;padding:32px 20px;}
          .lx-card{max-width:100%;}
        }
        @media(max-width:500px){
          .lx-right{padding:22px 14px;}
          .lx-card{padding:28px 22px;gap:18px;border-radius:22px;}
          .lx-card-title{font-size:21px;}
        }
      `}</style>

      <div className="lx-root">
        {/* ── bg ── */}
        <div className="lx-mesh">
          <div className="lx-orb lx-orb1" />
          <div className="lx-orb lx-orb2" />
          <div className="lx-orb lx-orb3" />
          <div className="lx-orb lx-orb4" />
        </div>
        <div className="lx-dots" />
        <div className="lx-pts">
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i} className="lx-pt" style={{ "--i": i }} />
          ))}
        </div>

        <div className="lx-wrap">

          {/* ════ LEFT HERO ════ */}
          <div className="lx-left">
            <div className="lx-li">

              <div className="lx-brand">
                <div className="lx-brand-icon">🎓</div>
                <span className="lx-brand-name">ExamPrep</span>
              </div>

              <h1 className="lx-h1">
                Welcome<br />
                <span className="lx-grad">Back.</span>
              </h1>

              <p className="lx-sub">
                Your knowledge journey continues here. Sign in and pick up exactly where you left off.
              </p>

              <div className="lx-chips">
                {FEATURES.map(f => (
                  <span key={f.text} className="lx-chip">
                    {f.icon} {f.text}
                  </span>
                ))}
              </div>

              {/* stat card */}
              <div className="lx-card-deco">
                <div className="lx-deco-top">
                  <div className="lx-deco-av">S</div>
                  <div>
                    <div className="lx-deco-uname">System Admin</div>
                    <div className="lx-deco-role">● Active session</div>
                  </div>
                  <span className="lx-deco-badge">Admin</span>
                </div>
                <div className="lx-stats">
                  {[["142","Questions"],["18","Exams"],["6","Subjects"]].map(([n,l]) => (
                    <div key={l} className="lx-stat"><b>{n}</b><small>{l}</small></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ════ RIGHT FORM ════ */}
          <div className="lx-right">
            <form className="lx-card" onSubmit={onSubmit} noValidate>

              {/* header */}
              <div className="lx-card-hdr">
                <div className="lx-card-icon">⚡</div>
                <div>
                  <h2 className="lx-card-title">Sign In</h2>
                  <p className="lx-card-sub">Access your admin dashboard</p>
                </div>
              </div>

              {/* alerts */}
              {error   && <div className="lx-err">⚠️ {error}</div>}
              {success && <div className="lx-success">✅ Login successful! Redirecting…</div>}

              {/* email field */}
              <div className="lx-field">
                <div className="lx-field-inner">
                  <span className="lx-ficon">✉️</span>
                  <input
                    className="lx-finput"
                    type="email" name="email"
                    value={form.email}
                    onChange={onChange}
                    onFocus={() => setFocused(p => ({ ...p, email: true }))}
                    onBlur={()  => setFocused(p => ({ ...p, email: false }))}
                    placeholder="Email"
                    required autoComplete="email"
                  />
                  <label className={`lx-flabel${active("email") ? " up" : ""}`}>
                    Email Address
                  </label>
                </div>
              </div>

              {/* password field */}
              <div className="lx-field">
                <div className="lx-field-inner">
                  <span className="lx-ficon">🔑</span>
                  <input
                    className="lx-finput"
                    type={showPass ? "text" : "password"} name="password"
                    value={form.password}
                    onChange={onChange}
                    onFocus={() => setFocused(p => ({ ...p, password: true }))}
                    onBlur={()  => setFocused(p => ({ ...p, password: false }))}
                    placeholder="Password"
                    required autoComplete="current-password"
                  />
                  <label className={`lx-flabel${active("password") ? " up" : ""}`}>
                    Password
                  </label>
                  <button type="button" className="lx-eye"
                    onClick={() => setShowPass(s => !s)} tabIndex={-1}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <a href="#" className="lx-forgot">Forgot password?</a>

              {/* submit */}
              <button
                type="submit"
                className={`lx-btn${success ? " success-state" : ""}`}
                disabled={loading || success}
              >
                {loading  ? <><span className="lx-spin" /> Signing in…</>
                : success ? <>✅ Redirecting…</>
                :           <>Sign In →</>}
              </button>

              {/* register link */}
              <Link to="/register" className="lx-reg-link">
                <span>New here?</span> Create your account →
              </Link>

            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;