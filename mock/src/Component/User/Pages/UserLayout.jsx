import UserNavbar from "./UserNavbar";
import UserSidebar from "./UserSidebar";

/**
 * UserLayout (Pages version)
 * White-mode only – dark body/main classes removed.
 * Premium white background with subtle gradient.
 */
const UserLayout = ({ children }) => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #f0f4ff;
          color: #0d1333;
        }

        /* ── Shell ── */
        .ul-shell {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .ul-body {
          display: flex;
          flex: 1;
          min-height: 0;
        }

        /* ── Sidebar ── */
        .ul-sidebar {
          width: 250px;
          flex-shrink: 0;
          background: #ffffff;
          border-right: 1.5px solid #e8edff;
          min-height: calc(100vh - 64px);
          display: flex; flex-direction: column;
          box-shadow: 2px 0 20px rgba(79,110,247,.05);
        }
        @media(max-width:767px) {
          .ul-sidebar { display: none; }
        }

        /* ── Main content area ── */
        .ul-main {
          flex: 1;
          min-width: 0;
          padding: 28px 32px;
          background: #f0f4ff;
        }

        @media (max-width: 767px) {
          .ul-main { padding: 18px 14px; }
        }
      `}</style>

      <div className="ul-shell">
        <UserNavbar />

        <div className="ul-body">
          <aside className="ul-sidebar">
            <UserSidebar />
          </aside>
          <main className="ul-main">{children}</main>
        </div>
      </div>
    </>
  );
};

export default UserLayout;
