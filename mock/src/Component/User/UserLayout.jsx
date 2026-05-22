import { useState } from "react";
import UserNavbar from "./Component/UserNavbar";
import UserSidebar from "./Component/UserSidebar";

const UserLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #eef0ff;
        }

        /* ── Animated gradient background ── */
        .ul-root {
          min-height: 100vh;
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative;
          color: #1e1b4b;
        }

        /* Fixed gradient orbs behind everything */
        .ul-bg {
          position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
        }
        .ul-orb {
          position: absolute; border-radius: 50%; filter: blur(80px); will-change: transform;
        }
        .ul-orb-1 {
          width: 600px; height: 600px; top: -180px; left: -140px;
          background: radial-gradient(circle, rgba(99,102,241,.18) 0%, transparent 65%);
          animation: orbFloat1 22s ease-in-out infinite alternate;
        }
        .ul-orb-2 {
          width: 500px; height: 500px; bottom: -100px; right: -80px;
          background: radial-gradient(circle, rgba(168,85,247,.14) 0%, transparent 65%);
          animation: orbFloat2 28s ease-in-out infinite alternate 5s;
        }
        .ul-orb-3 {
          width: 360px; height: 360px; top: 38%; left: 42%;
          background: radial-gradient(circle, rgba(236,72,153,.09) 0%, transparent 65%);
          animation: orbFloat1 18s ease-in-out infinite alternate 9s;
        }
        .ul-orb-4 {
          width: 280px; height: 280px; top: 10%; right: 28%;
          background: radial-gradient(circle, rgba(6,182,212,.08) 0%, transparent 65%);
          animation: orbFloat2 15s ease-in-out infinite alternate 12s;
        }
        @keyframes orbFloat1 {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(50px, 70px) scale(1.1); }
        }
        @keyframes orbFloat2 {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-45px, 55px) scale(1.08); }
        }

        /* dot grid */
        .ul-grid {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: radial-gradient(circle, rgba(99,102,241,.14) 1px, transparent 1px);
          background-size: 30px 30px; opacity: .22;
        }

        /* ── Shell ── */
        .ul-shell {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; min-height: 100vh;
        }

        /* ── Body row ── */
        .ul-body {
          display: flex; flex: 1; min-height: 0;
        }

        /* ── Sidebar ── */
        .ul-sidebar-wrap {
          width: 248px; flex-shrink: 0;
          background: rgba(255,255,255,.82);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border-right: 1.5px solid rgba(99,102,241,.12);
          min-height: calc(100vh - 64px);
          box-shadow: 2px 0 24px rgba(99,102,241,.06);
        }
        @media (max-width: 900px) {
          .ul-sidebar-wrap {
            position: fixed; top: 64px; left: 0; bottom: 0; z-index: 200;
            transform: translateX(-100%);
            transition: transform .3s cubic-bezier(.4,0,.2,1);
          }
          .ul-sidebar-wrap.open { transform: translateX(0); }
        }

        /* ── Overlay (mobile) ── */
        .ul-overlay {
          display: none; position: fixed; inset: 0; z-index: 199;
          background: rgba(30,27,75,.35); backdrop-filter: blur(3px);
        }
        @media (max-width: 900px) {
          .ul-overlay.open { display: block; }
        }

        /* ── Main content ── */
        .ul-main {
          flex: 1; min-width: 0;
          padding: 28px 32px 48px;
          background: transparent;
        }
        @media (max-width: 900px) {
          .ul-main { padding: 18px 16px 40px; }
        }
      `}</style>

      <div className="ul-root">
        {/* Background */}
        <div className="ul-bg">
          <div className="ul-orb ul-orb-1" />
          <div className="ul-orb ul-orb-2" />
          <div className="ul-orb ul-orb-3" />
          <div className="ul-orb ul-orb-4" />
        </div>
        <div className="ul-grid" />

        {/* Shell */}
        <div className="ul-shell">
          <UserNavbar onMenuClick={() => setSidebarOpen(true)} />

          <div className="ul-body">
            {/* Mobile overlay */}
            <div
              className={`ul-overlay${sidebarOpen ? " open" : ""}`}
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <div className={`ul-sidebar-wrap${sidebarOpen ? " open" : ""}`}>
              <UserSidebar onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Page content */}
            <main className="ul-main">
              {children}
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserLayout;
