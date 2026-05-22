import React, { useState, useEffect } from "react";
import api from "../Api/axios";

/**
 * Admin Wellbeing Monitor — Smart Watch Analytics
 * Displays real-time health data of students and alerts for high stress.
 */
export default function AdminWellbeingMonitor() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHighRisk();
  }, []);

  const fetchHighRisk = async () => {
    try {
      const res = await api.get("/wellbeing/admin/high-risk");
      setData(res.data || []);
    } catch (err) {
      console.error("Failed to fetch wellbeing data", err);
    }
    setLoading(false);
  };

  return (
    <div className="w-full">
      <style>{`
        @keyframes pulseAlert { 0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 70% { box-shadow: 0 0 0 10px rgba(239,68,68,0); } 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); } }
        .wb-card { background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,0.05); padding: 20px; transition: all 0.3s; }
        .wb-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        .wb-risk-badge { background: #fee2e2; color: #ef4444; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; display: inline-flex; align-items: center; gap: 4px; animation: pulseAlert 2s infinite; }
        .metric-box { flex: 1; padding: 12px; border-radius: 12px; background: #f8fafc; text-align: center; }
        .metric-val { font-size: 18px; font-weight: 900; color: #0f172a; }
        .metric-lbl { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; }
      `}</style>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 leading-tight">Student Wellbeing Monitor</h2>
          <p className="text-sm text-slate-500 font-medium">Wearable data analytics for stress & burnout detection.</p>
        </div>
        <button onClick={fetchHighRisk} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center font-bold text-slate-400">Loading wearable data...</div>
      ) : data.length === 0 ? (
        <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
           <div className="text-4xl mb-4">🧘</div>
           <h3 className="text-lg font-bold text-slate-700">All students are stable</h3>
           <p className="text-slate-500">No high-stress or burnout risks detected currently.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((wb) => (
            <div key={wb.id} className="wb-card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{wb.student?.name}</h3>
                  <p className="text-xs text-slate-500 font-medium italic">Synced from {wb.deviceModel || 'Unknown Device'}</p>
                </div>
                <div className="wb-risk-badge">
                  <span>⚠️</span> HIGH STRESS
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="metric-box">
                   <div className="metric-val text-red-500">{wb.heartRate}</div>
                   <div className="metric-lbl">BPM</div>
                </div>
                <div className="metric-box">
                   <div className="metric-val text-orange-500">{wb.stressLevel}%</div>
                   <div className="metric-lbl">Stress</div>
                </div>
                <div className="metric-box">
                   <div className="metric-val text-blue-500">{wb.oxygenLevels}%</div>
                   <div className="metric-lbl">SpO2</div>
                </div>
                <div className="metric-box">
                   <div className="metric-val text-indigo-500">{Math.floor(wb.sleepMinutes/60)}h</div>
                   <div className="metric-lbl">Sleep</div>
                </div>
              </div>

              <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                <div className="text-[10px] font-black text-orange-400 mb-1 uppercase tracking-widest">AI Stress Insight</div>
                <p className="text-xs text-orange-800 font-semibold leading-relaxed">
                  {wb.aiRecommendation}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                 <span>Recorded: {new Date(wb.recordedAt).toLocaleString()}</span>
                 <button className="text-indigo-600 hover:text-indigo-800 underline">Send Advice</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
