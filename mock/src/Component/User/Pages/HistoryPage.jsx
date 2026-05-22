import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import UserLayout from "../UserLayout";
import api from "../../Api/axios";

const HistoryPage = () => {
  const { t }                     = useTranslation();
  const [attempts, setAttempts]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api.get("/user/test/attempts")
      .then((res) => setAttempts(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit", month: "2-digit", year: "numeric",
      });
    } catch { return "—"; }
  };

  const scoreColor = (pct) => {
    const n = Number(pct);
    if (n >= 75) return "#059669";
    if (n >= 50) return "#d97706";
    return "#dc2626";
  };

  return (
    <UserLayout>
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .hp2-eyebrow {
            display: inline-flex; align-items: center; gap: 6px;
            font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
            color: #06b6d4; background: rgba(6,182,212,.09);
            border: 1px solid rgba(6,182,212,.18); border-radius: 20px;
            padding: 4px 12px; margin-bottom: 10px;
          }
          .hp2-eyebrow::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: #06b6d4; }

          .hp2-title {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 26px; font-weight: 900; letter-spacing: -.03em;
            color: #1e1b4b; margin-bottom: 4px; animation: fadeUp .4s ease both;
          }
          .hp2-sub {
            font-size: 14px; color: rgba(6,182,212,.5); font-weight: 400;
            margin-bottom: 26px; animation: fadeUp .4s ease .05s both;
          }

          /* Spinner */
          .hp2-spinner-wrap {
            display: flex; align-items: center; justify-content: center; padding: 64px;
          }
          .hp2-spinner {
            width: 32px; height: 32px; border-radius: 50%;
            border: 3px solid rgba(99,102,241,.15);
            border-top-color: #6366f1;
            animation: spin .7s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }

          /* Empty */
          .hp2-empty {
            text-align: center; padding: 56px 32px;
            background: rgba(255,255,255,.6); backdrop-filter: blur(16px);
            border: 1.5px dashed rgba(6,182,212,.2); border-radius: 20px;
            color: rgba(6,182,212,.45);
            animation: fadeUp .4s ease both;
          }
          .hp2-empty-icon { font-size: 40px; margin-bottom: 12px; }
          .hp2-empty h3 { font-size: 16px; font-weight: 700; color: #1e1b4b; margin-bottom: 6px; }
          .hp2-empty p  { font-size: 13px; }

          /* Table card */
          .hp2-table-wrap {
            background: rgba(255,255,255,.82);
            backdrop-filter: blur(22px) saturate(180%);
            -webkit-backdrop-filter: blur(22px) saturate(180%);
            border: 1.5px solid rgba(99,102,241,.12);
            border-radius: 20px; overflow: hidden;
            box-shadow: 0 4px 24px rgba(99,102,241,.08), inset 0 1px 0 rgba(255,255,255,.9);
            animation: fadeUp .4s ease both;
          }

          .hp2-table { width: 100%; border-collapse: collapse; font-size: 13px; }

          /* thead */
          .hp2-table thead tr {
            background: rgba(238,240,255,.6);
          }
          .hp2-table th {
            padding: 12px 16px; text-align: left;
            font-size: 10.5px; font-weight: 700; letter-spacing: .1em;
            text-transform: uppercase; color: rgba(99,102,241,.45);
            border-bottom: 1.5px solid rgba(99,102,241,.09);
            white-space: nowrap;
          }
          .hp2-table th.center { text-align: center; }

          /* tbody */
          .hp2-table tbody tr {
            transition: background .15s;
          }
          .hp2-table tbody tr:hover { background: rgba(99,102,241,.03); }
          .hp2-table td {
            padding: 12px 16px;
            border-bottom: 1px solid rgba(99,102,241,.06);
            color: rgba(67,56,202,.7); vertical-align: middle;
          }
          .hp2-table tbody tr:last-child td { border-bottom: none; }
          .hp2-table td.center { text-align: center; }

          /* date chip */
          .hp2-date-chip {
            display: inline-block;
            background: rgba(238,240,255,.8);
            border: 1px solid rgba(99,102,241,.14);
            color: #3730a3; font-size: 11px; font-weight: 600;
            padding: 3px 9px; border-radius: 7px;
          }

          /* exam name */
          .hp2-exam-name { font-weight: 700; color: #1e1b4b; }

          /* correct/wrong badge */
          .hp2-badge {
            display: inline-flex; align-items: center; justify-content: center;
            width: 28px; height: 28px; border-radius: 50%;
            font-weight: 800; font-size: 13px;
          }
          .hp2-badge-correct { background: rgba(5,150,105,.1); color: #059669; }
          .hp2-badge-wrong   { background: rgba(220,38,38,.09); color: #dc2626; }

          /* score */
          .hp2-score { font-weight: 800; font-size: 13.5px; }
        `}</style>

        <div className="hp2-eyebrow">Activity</div>
        <h2 className="hp2-title">{t("history.title", "Test History")}</h2>
        <p className="hp2-sub">All your past attempts in one place</p>

        {loading ? (
          <div className="hp2-spinner-wrap">
            <div className="hp2-spinner" />
          </div>
        ) : attempts.length === 0 ? (
          <div className="hp2-empty">
            <div className="hp2-empty-icon">📋</div>
            <h3>No test history yet</h3>
            <p>Complete a test to see your history here</p>
          </div>
        ) : (
          <div className="hp2-table-wrap">
            <table className="hp2-table">
              <thead>
                <tr>
                  <th>{t("history.date",    "Date")}</th>
                  <th>{t("history.exam",    "Exam")}</th>
                  <th>{t("history.subject", "Subject")}</th>
                  <th>{t("history.topic",   "Topic")}</th>
                  <th className="center">{t("history.total",   "Total")}</th>
                  <th className="center">✓ {t("history.correct", "Correct")}</th>
                  <th className="center">✗ {t("history.wrong",   "Wrong")}</th>
                  <th className="center">{t("history.score",   "Score %")}</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a, i) => (
                  <tr key={i}>
                    <td><span className="hp2-date-chip">{formatDate(a.attemptedAt)}</span></td>
                    <td><span className="hp2-exam-name">{a.examName || "—"}</span></td>
                    <td>{a.subjectName || "—"}</td>
                    <td>{a.topicName   || "—"}</td>
                    <td className="center">{a.total ?? "—"}</td>
                    <td className="center">
                      <span className="hp2-badge hp2-badge-correct">{a.correct ?? 0}</span>
                    </td>
                    <td className="center">
                      <span className="hp2-badge hp2-badge-wrong">{a.wrong ?? 0}</span>
                    </td>
                    <td className="center">
                      <span className="hp2-score" style={{ color: scoreColor(a.scorePercent) }}>
                        {typeof a.scorePercent === "number"
                          ? `${Math.round(a.scorePercent)}%`
                          : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    </UserLayout>
  );
};

export default HistoryPage;
