import React, { useState, useEffect } from "react";
import api from "../Api/axios";

/* ================================================================
   NOTIFICATION MANAGER — Admin Panel
   ▸ View inactive students (2+ days)
   ▸ Send manual SMS, Call, Email to single student
   ▸ Send to ALL inactive students
   ▸ View notification logs
================================================================ */

export default function NotificationManager() {
  const [inactiveStudents, setInactiveStudents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("inactive"); // "inactive" or "logs"
  const [sendingId, setSendingId] = useState(null); // tracking individual send
  const [sendingAll, setSendingAll] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "inactive") {
        const res = await api.get("/admin/notifications/inactive-students");
        setInactiveStudents(res.data || []);
      } else {
        const res = await api.get("/admin/notifications/logs");
        setLogs(res.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch notification data", err);
    }
    setLoading(false);
  };

  const handleSendSingle = async (stuId) => {
    setSendingId(stuId);
    try {
      await api.post(`/admin/notifications/send/${stuId}`);
      alert("✅ Notifications sent successfully!");
    } catch (err) {
      alert("❌ Failed to send notifications.");
    }
    setSendingId(null);
  };

  const handleSendAll = async () => {
    if (!window.confirm("Are you sure you want to send notifications (SMS, Call, Email) to ALL inactive students?")) return;
    setSendingAll(true);
    try {
      const res = await api.post("/admin/notifications/send-all");
      alert(`✅ Sent notifications to ${res.data?.totalNotified} students.`);
    } catch (err) {
      alert("❌ Failed to send bulk notifications.");
    }
    setSendingAll(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        .nm-ey{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8b5cf6;background:rgba(139,92,246,.09);border:1px solid rgba(139,92,246,.18);border-radius:20px;padding:4px 12px;margin-bottom:10px;}
        .nm-title{font-family:'Plus Jakarta Sans',sans-serif;font-size:24px;font-weight:900;letter-spacing:-.03em;color:#0f172a;margin-bottom:4px;}
        .nm-sub{font-size:13px;color:rgba(139,92,246,.6);margin-bottom:24px;}
        .nm-tabs{display:flex;gap:12px;margin-bottom:20px;border-bottom:2px solid rgba(0,0,0,.05);padding-bottom:12px;}
        .nm-tab{background:none;border:none;font-size:14px;font-weight:800;color:rgba(0,0,0,.4);cursor:pointer;padding:8px 16px;border-radius:8px;transition:all .2s;}
        .nm-tab.active{color:#8b5cf6;background:rgba(139,92,246,.1);}
        .nm-tab:hover:not(.active){background:rgba(0,0,0,.05);}
        .nm-panel{background:rgba(255,255,255,.9);border:1.5px solid rgba(139,92,246,.15);border-radius:18px;padding:24px;animation:fadeUp .3s ease both;}
        .nm-grid{display:grid;grid-template-columns:1fr;gap:14px;}
        .nm-card{background:#fff;border:1px solid rgba(0,0,0,.06);border-radius:14px;padding:16px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;box-shadow:0 4px 12px rgba(0,0,0,.02);transition:all .2s;}
        .nm-card:hover{transform:translateY(-2px);box-shadow:0 8px 16px rgba(139,92,246,.08);border-color:rgba(139,92,246,.3);}
        .nm-btn{background:#8b5cf6;color:#fff;border:none;padding:10px 18px;border-radius:10px;font-size:13px;font-weight:800;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:6px;}
        .nm-btn:hover:not(:disabled){background:#7c3aed;transform:scale(1.02);}
        .nm-btn:disabled{opacity:0.6;cursor:not-allowed;}
        .nm-badge{padding:4px 10px;border-radius:20px;font-size:11px;font-weight:800;}
        .nm-log-row{display:flex;align-items:center;gap:12px;padding:12px;border-bottom:1px solid rgba(0,0,0,.05);}
        .nm-log-row:last-child{border-bottom:none;}
      `}</style>

      <div className="nm-ey">📢 Alert Center</div>
      <h2 className="nm-title">Inactive Student Alerts</h2>
      <p className="nm-sub">Monitor students who haven't practiced recently. Trigger automated SMS, Voice calls, and Emails.</p>

      <div className="nm-tabs">
        <button className={`nm-tab ${activeTab === 'inactive' ? 'active' : ''}`} onClick={() => setActiveTab('inactive')}>
          ⚠️ Inactive Students
        </button>
        <button className={`nm-tab ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
          📜 Notification Logs
        </button>
      </div>

      <div className="nm-panel">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'rgba(0,0,0,.4)', fontWeight: 600 }}>⏳ Loading data...</div>
        ) : (
          <>
            {activeTab === "inactive" && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                    Found <span style={{ color: '#ef4444' }}>{inactiveStudents.length}</span> students inactive for 2+ days
                  </div>
                  {inactiveStudents.length > 0 && (
                    <button className="nm-btn" onClick={handleSendAll} disabled={sendingAll}>
                      {sendingAll ? "⏳ Sending to All..." : "🚀 Notify All"}
                    </button>
                  )}
                </div>

                {inactiveStudents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#10b981', fontWeight: 700 }}>
                    🎉 Awesome! No inactive students found.
                  </div>
                ) : (
                  <div className="nm-grid">
                    {inactiveStudents.map(stu => (
                      <div key={stu.id} className="nm-card">
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{stu.name}</div>
                          <div style={{ fontSize: 12, color: 'rgba(0,0,0,.5)' }}>📧 {stu.email} &nbsp; 📱 {stu.phone}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 20, fontWeight: 900, color: '#ef4444' }}>{stu.daysInactive}</div>
                            <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.6 }}>DAYS INACTIVE</div>
                          </div>
                          <button 
                            className="nm-btn" 
                            style={{ background: '#0f172a' }}
                            onClick={() => handleSendSingle(stu.id)}
                            disabled={sendingId === stu.id}
                          >
                            {sendingId === stu.id ? "⏳ Sending..." : "🔔 Alert Now"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "logs" && (
              <>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>
                  Recent Notifications
                </div>
                {logs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: 'rgba(0,0,0,.4)', fontWeight: 600 }}>No logs found.</div>
                ) : (
                  <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.05)', borderRadius: 12, overflow: 'hidden' }}>
                    {logs.map((log) => (
                      <div key={log.id} className="nm-log-row">
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: log.success ? '#dcfce7' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                          {log.channel === "SMS" ? "📱" : log.channel === "CALL" ? "📞" : "📧"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{log.studentName}</div>
                          <div style={{ fontSize: 11, color: 'rgba(0,0,0,.5)' }}>{log.destination} • {new Date(log.sentAt).toLocaleString()}</div>
                          {!log.success && log.errorMessage && (
                            <div style={{ fontSize: 10, color: '#ef4444', marginTop: 4 }}>Error: {log.errorMessage}</div>
                          )}
                        </div>
                        <div>
                          {log.success ? (
                            <span className="nm-badge" style={{ background: '#dcfce7', color: '#16a34a' }}>✅ Delivered</span>
                          ) : (
                            <span className="nm-badge" style={{ background: '#fee2e2', color: '#dc2626' }}>❌ Failed</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
