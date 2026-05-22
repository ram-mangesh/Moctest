import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../Api/axios";
import { useTranslation } from "react-i18next";

/**
 * UserNavbar – White-mode only, premium design
 * Dark mode toggle removed. Light/white UI locked.
 */
const UserNavbar = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchFocus, setSearchFocus] = useState(false);

  const name = localStorage.getItem("name") || t("common.user");
  const firstLetter = name.charAt(0).toUpperCase();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(() => {
      api.get(`/user/exams/search?query=${encodeURIComponent(query)}`)
        .then((res) => setResults(res.data))
        .catch(() => setResults([]));
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const logout = () => { localStorage.clear(); navigate("/"); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        .un-bar {
          position: sticky; top: 0; z-index: 100;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1.5px solid #e8edff;
          padding: 0 24px;
          height: 64px;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-shadow: 0 1px 16px rgba(79,110,247,.07);
        }

        .un-logo {
          font-size: 19px; font-weight: 900; letter-spacing: -.04em;
          background: linear-gradient(135deg, #4f6ef7, #818cf8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; cursor: pointer; flex-shrink: 0;
          user-select: none; transition: opacity .2s;
          text-decoration: none;
        }
        .un-logo:hover { opacity: .8; }

        .un-search-wrap {
          position: relative; flex: 1; max-width: 340px;
          display: none;
        }
        @media(min-width: 768px) { .un-search-wrap { display: block; } }

        .un-search-box {
          display: flex; align-items: center; gap: 8px;
          background: #f6f8ff; border: 1.5px solid #e0e6ff;
          border-radius: 12px; padding: 9px 14px;
          transition: border-color .2s, box-shadow .2s;
        }
        .un-search-box.focused {
          border-color: #4f6ef7;
          box-shadow: 0 0 0 3px rgba(79,110,247,.12);
          background: #fff;
        }
        .un-search-box input {
          flex: 1; background: none; border: none; outline: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13.5px; color: #0d1333;
        }
        .un-search-box input::placeholder { color: #9aa3cc; }
        .un-search-icon { color: #9aa3cc; font-size: 15px; }
        .un-search-clear { 
          cursor: pointer; color: #9aa3cc; font-size: 15px; 
          line-height: 1; transition: color .15s;
        }
        .un-search-clear:hover { color: #4f6ef7; }

        .un-drop {
          position: absolute; top: calc(100% + 8px); left: 0; right: 0;
          background: #fff; border: 1.5px solid #e0e6ff;
          border-radius: 14px; box-shadow: 0 8px 32px rgba(79,110,247,.14);
          overflow: hidden; z-index: 300;
          animation: unDropIn .18s ease;
        }
        @keyframes unDropIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .un-drop-item {
          padding: 11px 16px; cursor: pointer; font-size: 13.5px;
          color: #0d1333; transition: background .15s;
          border-bottom: 1px solid #f0f3ff;
        }
        .un-drop-item:last-child { border-bottom: none; }
        .un-drop-item:hover { background: #f6f8ff; }
        .un-drop-item-sub { font-size: 11px; color: #9aa3cc; margin-left: 6px; }

        .un-right {
          display: flex; align-items: center; gap: 10px; position: relative;
        }

        .un-lang {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px; font-weight: 600;
          padding: 7px 11px; border-radius: 10px;
          border: 1.5px solid #e0e6ff; background: #f6f8ff;
          color: #0d1333; cursor: pointer; outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .un-lang:hover { border-color: #4f6ef7; }
        .un-lang:focus { border-color: #4f6ef7; box-shadow: 0 0 0 3px rgba(79,110,247,.12); }

        .un-name {
          font-size: 13.5px; font-weight: 600; color: #3a4374;
          display: none;
        }
        @media(min-width: 768px) { .un-name { display: block; } }

        .un-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          background: linear-gradient(135deg, #4f6ef7, #818cf8);
          color: #fff; font-size: 15px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; user-select: none; flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(79,110,247,.28);
          transition: transform .2s, box-shadow .2s;
        }
        .un-avatar:hover { transform: scale(1.06); box-shadow: 0 6px 18px rgba(79,110,247,.38); }

        .un-menu {
          position: absolute; right: 0; top: calc(100% + 10px);
          background: #fff; border: 1.5px solid #e0e6ff;
          border-radius: 16px; box-shadow: 0 8px 32px rgba(79,110,247,.14);
          overflow: hidden; min-width: 170px; z-index: 200;
          animation: unDropIn .18s ease;
        }
        .un-menu-item {
          display: flex; align-items: center; gap: 10px;
          width: 100%; text-align: left; padding: 12px 16px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13.5px; font-weight: 600; color: #0d1333;
          background: none; border: none; cursor: pointer;
          transition: background .15s;
          border-bottom: 1px solid #f0f3ff;
        }
        .un-menu-item:last-child { border-bottom: none; }
        .un-menu-item:hover { background: #f6f8ff; }
        .un-menu-item.danger { color: #f43f5e; }
        .un-menu-item.danger:hover { background: #fff1f4; }

        .un-menu-header {
          padding: 14px 16px 10px;
          border-bottom: 1px solid #f0f3ff;
        }
        .un-menu-header-name {
          font-size: 14px; font-weight: 800; color: #0d1333;
        }
        .un-menu-header-role {
          font-size: 11.5px; color: #9aa3cc; font-weight: 500;
          margin-top: 2px;
        }
      `}</style>

      <nav className="un-bar">
        {/* Logo */}
        <span className="un-logo" onClick={() => navigate("/")}>ExamPrep</span>

        {/* Search */}
        <div className="un-search-wrap">
          <div className={`un-search-box${searchFocus ? " focused" : ""}`}>
            <span className="un-search-icon">🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setTimeout(() => setSearchFocus(false), 200)}
              placeholder={t("navbar.searchPlaceholder") || "Search exams…"}
            />
            {query && (
              <span className="un-search-clear" onClick={() => { setQuery(""); setResults([]); }}>×</span>
            )}
          </div>
          {results.length > 0 && (
            <div className="un-drop">
              {results.map((exam) => (
                <div
                  key={exam.id}
                  className="un-drop-item"
                  onClick={() => { navigate(`/exam/${exam.id}`); setQuery(""); setResults([]); }}
                >
                  {exam.name}
                  <span className="un-drop-item-sub">({exam.subjectCount} {t("exam.subjects")})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="un-right">
          <select
            value={i18n.language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="un-lang"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="mr">मराठी</option>
          </select>

          <span className="un-name">{name}</span>

          <div className="un-avatar" onClick={() => setOpen(!open)}>
            {firstLetter}
          </div>

          {open && (
            <div className="un-menu">
              <div className="un-menu-header">
                <div className="un-menu-header-name">{name}</div>
                <div className="un-menu-header-role">Student</div>
              </div>
              <button
                className="un-menu-item"
                onClick={() => { navigate("/settings"); setOpen(false); }}
              >
                ⚙️ Settings
              </button>
              <button className="un-menu-item danger" onClick={logout}>
                🚪 {t("navbar.logout")}
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default UserNavbar;
