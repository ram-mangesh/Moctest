import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../Api/axios";
import { useTranslation } from "react-i18next";

const UserNavbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchFocus, setSearchFocus] = useState(false);

  const name = localStorage.getItem("name") || t("common.user", "Student");
  const firstLetter = name.charAt(0).toUpperCase();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      api
        .get(`/user/exams/search?query=${encodeURIComponent(query)}`)
        .then((res) => setResults(res.data))
        .catch(() => setResults([]));
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        .unv-bar {
          position: sticky; top: 0; z-index: 100;
          height: 64px;
          background: rgba(255,255,255,.82);
          backdrop-filter: blur(28px) saturate(200%);
          -webkit-backdrop-filter: blur(28px) saturate(200%);
          border-bottom: 1.5px solid rgba(99,102,241,.12);
          padding: 0 24px;
          display: flex; align-items: center; justify-content: space-between; gap: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-shadow: 0 2px 24px rgba(99,102,241,.07), inset 0 -1px 0 rgba(255,255,255,.6);
        }

        /* hamburger */
        .unv-ham {
          display: none; background: none; border: none; cursor: pointer;
          font-size: 22px; color: rgba(99,102,241,.7); padding: 4px 6px; border-radius: 8px;
          transition: background .15s;
        }
        .unv-ham:hover { background: rgba(99,102,241,.09); }
        @media (max-width: 900px) { .unv-ham { display: flex; align-items: center; } }

        /* logo */
        .unv-logo {
          font-size: 18px; font-weight: 900; letter-spacing: -.04em;
          background: linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; cursor: pointer; user-select: none; flex-shrink: 0;
          transition: opacity .2s;
        }
        .unv-logo:hover { opacity: .8; }

        /* search */
        .unv-search-wrap {
          position: relative; flex: 1; max-width: 340px;
        }
        @media (max-width: 768px) { .unv-search-wrap { display: none; } }

        .unv-search-box {
          display: flex; align-items: center; gap: 9px;
          background: rgba(238,240,255,.8); border: 1.5px solid rgba(99,102,241,.14);
          border-radius: 13px; padding: 9px 14px;
          transition: all .2s;
        }
        .unv-search-box.focused {
          background: #fff; border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,.12);
        }
        .unv-search-box input {
          flex: 1; background: none; border: none; outline: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13.5px; color: #1e1b4b;
        }
        .unv-search-box input::placeholder { color: rgba(99,102,241,.4); }
        .unv-search-icon { color: rgba(99,102,241,.45); font-size: 15px; }
        .unv-search-clear {
          cursor: pointer; color: rgba(99,102,241,.4); font-size: 16px;
          line-height: 1; transition: color .15s;
        }
        .unv-search-clear:hover { color: #6366f1; }

        /* dropdown */
        .unv-drop {
          position: absolute; top: calc(100% + 8px); left: 0; right: 0;
          background: rgba(255,255,255,.96); border: 1.5px solid rgba(99,102,241,.16);
          border-radius: 14px; box-shadow: 0 10px 40px rgba(99,102,241,.18);
          overflow: hidden; z-index: 300;
          backdrop-filter: blur(20px);
          animation: unvDropIn .18s ease;
        }
        @keyframes unvDropIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .unv-drop-item {
          padding: 11px 16px; cursor: pointer; font-size: 13.5px;
          color: #1e1b4b; transition: background .15s;
          border-bottom: 1px solid rgba(99,102,241,.07);
        }
        .unv-drop-item:last-child { border-bottom: none; }
        .unv-drop-item:hover { background: rgba(99,102,241,.07); }
        .unv-drop-item-sub { font-size: 11px; color: rgba(99,102,241,.45); margin-left: 6px; }

        /* right side */
        .unv-right { display: flex; align-items: center; gap: 10px; position: relative; }

        .unv-lang {
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12.5px; font-weight: 600;
          padding: 7px 11px; border-radius: 10px;
          border: 1.5px solid rgba(99,102,241,.16); background: rgba(238,240,255,.8);
          color: #4338ca; cursor: pointer; outline: none; transition: all .2s;
        }
        .unv-lang:hover { border-color: rgba(99,102,241,.4); background: rgba(238,240,255,1); }
        .unv-lang:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }

        .unv-name {
          font-size: 13.5px; font-weight: 600; color: rgba(67,56,202,.65);
        }
        @media (max-width: 768px) { .unv-name { display: none; } }

        .unv-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff; font-size: 15px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; user-select: none; flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(99,102,241,.32);
          transition: transform .2s, box-shadow .2s;
        }
        .unv-avatar:hover { transform: scale(1.07); box-shadow: 0 6px 20px rgba(99,102,241,.44); }

        /* user menu */
        .unv-menu {
          position: absolute; right: 0; top: calc(100% + 10px);
          background: rgba(255,255,255,.96); border: 1.5px solid rgba(99,102,241,.14);
          border-radius: 18px; box-shadow: 0 10px 40px rgba(99,102,241,.18);
          overflow: hidden; min-width: 180px; z-index: 300;
          backdrop-filter: blur(24px);
          animation: unvDropIn .18s ease;
        }
        .unv-menu-header {
          padding: 14px 16px 10px; border-bottom: 1px solid rgba(99,102,241,.09);
          background: rgba(238,240,255,.5);
        }
        .unv-menu-header-name { font-size: 14px; font-weight: 800; color: #1e1b4b; }
        .unv-menu-header-role { font-size: 11.5px; color: rgba(99,102,241,.5); font-weight: 500; margin-top: 2px; }
        .unv-menu-item {
          display: flex; align-items: center; gap: 10px; width: 100%;
          text-align: left; padding: 12px 16px;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13.5px; font-weight: 600;
          color: #1e1b4b; background: none; border: none; cursor: pointer;
          transition: background .15s; border-bottom: 1px solid rgba(99,102,241,.07);
        }
        .unv-menu-item:last-child { border-bottom: none; }
        .unv-menu-item:hover { background: rgba(99,102,241,.07); }
        .unv-menu-item.danger { color: #dc2626; }
        .unv-menu-item.danger:hover { background: rgba(220,38,38,.06); }
      `}</style>

      <nav className="unv-bar">
        {/* Hamburger */}
        <button
          className="unv-ham"
          onClick={onMenuClick}
          aria-label="Menu">
          ☰
        </button>

        {/* Logo */}
        <span
          className="unv-logo"
          onClick={() => navigate("/home")}>
          ExamPrep
        </span>

        {/* Search */}
        <div className="unv-search-wrap">
          <div className={`unv-search-box${searchFocus ? " focused" : ""}`}>
            <span className="unv-search-icon">🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setTimeout(() => setSearchFocus(false), 200)}
              placeholder={t("navbar.searchPlaceholder", "Search exams…")}
            />
            {query && (
              <span
                className="unv-search-clear"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                }}>
                ×
              </span>
            )}
          </div>
          {results.length > 0 && (
            <div className="unv-drop">
              {results.map((exam) => (
                <div
                  key={exam.id}
                  className="unv-drop-item"
                  onClick={() => {
                    navigate(`/exam/${exam.id}`);
                    setQuery("");
                    setResults([]);
                  }}>
                  {exam.name}
                  <span className="unv-drop-item-sub">
                    ({exam.subjectCount} {t("exam.subjects", "subjects")})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right */}
        <div className="unv-right">
          <select
            value={i18n.language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="unv-lang">
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="mr">मराठी</option>
          </select>

          <span className="unv-name">{name}</span>

          <div
            className="unv-avatar"
            onClick={() => setOpen(!open)}>
            {firstLetter}
          </div>

          {open && (
            <div className="unv-menu">
              <div className="unv-menu-header">
                <div className="unv-menu-header-name">{name}</div>
                <div className="unv-menu-header-role">Student</div>
              </div>
              <button
                className="unv-menu-item"
                onClick={() => {
                  navigate("/settings");
                  setOpen(false);
                }}>
                ⚙️ {t("sidebar.settings", "Settings")}
              </button>
              <button
                className="unv-menu-item danger"
                onClick={logout}>
                🚪 {t("navbar.logout", "Logout")}
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default UserNavbar;
