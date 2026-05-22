import React, { useState, useEffect } from "react";
import api from "../Api/axios";

/**
 * My Wearable — User Side
 * Simulates a Smart Watch connection to sync vitals for wellbeing monitoring.
 */
export default function MyWearable() {
  const [vitals, setVitals] = useState({
    heartRate: 72,
    steps: 1200,
    stressLevel: 25,
    sleepMinutes: 420,
    oxygenLevels: 98,
    bodyTemp: 36.6,
    calories: 450
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [aiAdvice, setAiAdvice] = useState("Your metrics are looking great! Ready for some focused studying?");

  // Simulate real-time heart rate variation
  useEffect(() => {
    const timer = setInterval(() => {
      setVitals(prev => ({
        ...prev,
        heartRate: prev.heartRate + (Math.random() > 0.5 ? 1 : -1)
      }));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    const userId = localStorage.getItem("userId"); // Assuming userId is stored in localStorage
    if (!userId) {
       alert("Please login first to sync watch data.");
       setIsSyncing(false);
       return;
    }

    try {
      const payload = {
        ...vitals,
        deviceModel: "Mega Watch Pro",
        deviceId: "MW-77890X"
      };
      const res = await api.post(`/wellbeing/sync/${userId}`, payload);
      setLastSync(new Date().toLocaleTimeString());
      setAiAdvice(res.data.aiRecommendation);
    } catch (err) {
      console.error("Sync failed", err);
    }
    setIsSyncing(false);
  };

  const simulateStress = () => {
    setVitals(prev => ({
      ...prev,
      heartRate: 112,
      stressLevel: 85
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <style>{`
        .watch-face { width: 200px; height: 200px; border-radius: 50%; border: 8px solid #334155; position: relative; background: #000; box-shadow: 0 0 30px rgba(0,0,0,0.2); margin: 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; }
        .watch-inner { text-align: center; color: #fff; }
        .pulse { animation: heartPulse 1s infinite; display: inline-block; color: #ef4444; margin-right: 5px; }
        @keyframes heartPulse { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
      `}</style>

      <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="flex flex-col md:flex-row gap-10 items-center">
          
          <div className="flex-shrink-0">
             <div className="watch-face">
                <div className="watch-inner">
                   <div className="text-[10px] font-bold text-slate-400 mb-1">MEGA WATCH</div>
                   <div className="text-3xl font-black mb-1">
                      <span className="pulse">❤️</span>{vitals.heartRate}
                   </div>
                   <div className="text-[10px] font-bold text-indigo-400">STRESS: {vitals.stressLevel}%</div>
                   <div className="mt-4 text-[9px] text-slate-500 uppercase">Step Counter</div>
                   <div className="text-xs font-bold">{vitals.steps}</div>
                </div>
                <div className="absolute top-0 w-full h-1/3 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
             </div>
             <div className="mt-6 text-center">
                <button 
                  onClick={handleSync}
                  disabled={isSyncing}
                  className={`px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-lg ${isSyncing ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0'}`}
                >
                  {isSyncing ? "SYNCING..." : "SYNC TO CLOUD"}
                </button>
                {lastSync && <p className="mt-2 text-[10px] text-slate-400 font-bold uppercase">Last Sync: {lastSync}</p>}
             </div>
          </div>

          <div className="flex-1">
             <div className="mb-6">
                <h1 className="text-3xl font-black text-slate-900 mb-2">My Wearable Buddy</h1>
                <p className="text-slate-500 font-medium">Sync your smart watch to monitor study stress and body vitals.</p>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <div className="text-[10px] font-black text-slate-400 mb-2 uppercase">Oxygen Level</div>
                   <div className="text-2xl font-black text-blue-600">{vitals.oxygenLevels}%</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <div className="text-[10px] font-black text-slate-400 mb-2 uppercase">Sleep Quality</div>
                   <div className="text-2xl font-black text-indigo-600">{(vitals.sleepMinutes/60).toFixed(1)} hrs</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <div className="text-[10px] font-black text-slate-400 mb-2 uppercase">Body Temp</div>
                   <div className="text-2xl font-black text-orange-600">{vitals.bodyTemp}°C</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <div className="text-[10px] font-black text-slate-400 mb-2 uppercase">Daily Calories</div>
                   <div className="text-2xl font-black text-emerald-600">{vitals.calories} kcal</div>
                </div>
             </div>

             <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs">🤖</div>
                   <div className="text-xs font-black text-indigo-900 uppercase">AI Wellbeing Coach</div>
                </div>
                <p className="text-sm text-indigo-800 font-bold leading-relaxed">
                   "{aiAdvice}"
                </p>
             </div>

             <div className="mt-8 flex gap-4">
                <button onClick={simulateStress} className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl border border-red-100 transition-colors">
                   Simulation: High Stress
                </button>
                <button onClick={() => setVitals(v => ({...v, heartRate: 72, stressLevel: 25}))} className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 transition-colors">
                   Reset
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
