import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Footprints, Moon, Flame, Wind, Watch, RefreshCw, Wifi, WifiOff, Activity, Zap, TrendingUp, TrendingDown, Brain, Smartphone } from 'lucide-react';
import ActivityRing from '../../Charts/ActivityRing';
import HeartRateChart from '../../Charts/HeartRateChart';
import StepsChart from '../../Charts/StepsChart';
import SleepChart from '../../Charts/SleepChart';
import api from '../../Api/axios';
import { fetchTodaySummary, fetchHeartRateData, fetchStepsData, fetchWeeklyTrends, convertToSyncPayload } from '../../Api/GoogleFitService';
import UserLayout from '../UserLayout';

const GoogleFitDashboard = () => {
  const [connected, setConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [summary, setSummary] = useState(null);
  const [heartRateData, setHeartRateData] = useState([]);
  const [stepsData, setStepsData] = useState([]);
  const [weeklyTrends, setWeeklyTrends] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const GOOGLE_CLIENT_ID = '474105204785-gqu4an78s8q66l01rju7mqut1lflk2td.apps.googleusercontent.com';
  const SCOPES = 'https://www.googleapis.com/auth/fitness.activity.read ' +
                 'https://www.googleapis.com/auth/fitness.body.read ' +
                 'https://www.googleapis.com/auth/fitness.blood_pressure.read ' +
                 'https://www.googleapis.com/auth/fitness.heart_rate.read ' +
                 'https://www.googleapis.com/auth/fitness.sleep.read ' +
                 'https://www.googleapis.com/auth/fitness.oxygen_saturation.read';

  const loadLiveData = useCallback(async (token) => {
    try {
      const s = await fetchTodaySummary(token);
      setSummary(s);
      const hrData = await fetchHeartRateData(token);
      setHeartRateData(hrData);
      const stData = await fetchStepsData(token, 10000);
      setStepsData(stData);
      const wtData = await fetchWeeklyTrends(token);
      setWeeklyTrends(wtData);
      setLastSync(new Date());
      return true;
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 401) {
         sessionStorage.removeItem('google_fit_token');
         setConnected(false);
      }
      return false;
    }
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem('google_fit_token');
    if (token) {
      setConnected(true);
      setSyncing(true);
      loadLiveData(token).then(() => setSyncing(false));
    }
  }, [loadLiveData]);

  const handleConnect = () => {
    if (!window.google) {
      alert("Google Identity Services failed to load. Please try refreshing.");
      return;
    }
    setSyncing(true);
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: async (tokenResponse) => {
        if (tokenResponse && tokenResponse.access_token) {
           setConnected(true);
           sessionStorage.setItem('google_fit_token', tokenResponse.access_token);
           await loadLiveData(tokenResponse.access_token);
           setSyncing(false);
        }
      },
      error_callback: () => setSyncing(false)
    });
    tokenClient.requestAccessToken();
  };

  const handleSync = async () => {
    if (!connected) return;
    setSyncing(true);
    const token = sessionStorage.getItem('google_fit_token');
    if(token) {
        await loadLiveData(token);
        try {
          const userId = localStorage.getItem("userId");
          const payload = convertToSyncPayload(summary);
          await api.post(`/wellbeing/sync/${userId}`, payload);
          alert('⌚ Live vitals synced to your wellbeing record!');
        } catch (err) {
          console.log('Backend sync failed:', err.message);
        }
    }
    setTimeout(() => setSyncing(false), 500);
  };

  const handleDisconnect = () => {
    setConnected(false);
    sessionStorage.removeItem('google_fit_token');
    setSummary(null);
    setHeartRateData([]);
    setStepsData([]);
  };

  const handleSimulate = () => {
    setConnected(true);
    setSyncing(true);
    const mockSummary = {
      heartRate: 74, heartRateMin: 62, heartRateMax: 110,
      steps: 8420, stepsGoal: 10000, stepsPercentage: 84,
      calories: 1850, caloriesGoal: 2200, 
      sleep: { totalHours: 7.2, quality: 'Good', qualityScore: 85, totalMinutes: 432, stages: { deep: { percentage: 25, minutes: 108 }, light: { percentage: 50, minutes: 216 }, rem: { percentage: 15, minutes: 65 }, awake: { percentage: 10, minutes: 43 } }, bedTime: '11:30 PM', wakeTime: '06:42 AM' },
      distance: 6.4, distanceGoal: 8.0, activeMinutes: 42, deviceName: 'Simulator Mode', spo2: 98
    };
    const mockHR = Array.from({length: 44}, (_, i) => ({
       hour: `${String(Math.floor(i/1.8)).padStart(2,'0')}:00`,
       value: 65 + Math.floor(Math.random() * 30)
    }));
    const mockSteps = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => ({
       day, date: '10 Apr', steps: 5000 + Math.floor(Math.random() * 5000), goal: 10000
    }));

    setSummary(mockSummary);
    setHeartRateData(mockHR);
    setStepsData(mockSteps);
    setWeeklyTrends({
      insights: [
        { type: 'success', icon: '🌟', message: 'Metabolic focus is high. Great job on the 8K steps!' },
        { type: 'info', icon: '💓', message: 'Resting heart rate is stable at 65bpm. Ready for intensive study.' },
        { type: 'tip', icon: '🧠', message: 'Your brain is most active after the 15-min morning walk detected.' }
      ]
    });
    setLastSync(new Date());
    setTimeout(() => setSyncing(false), 800);
  };

  const statCards = summary ? [
    { icon: Heart, label: 'Heart Rate', value: `${summary.heartRate}`, unit: 'bpm', sub: `${summary.heartRateMin}-${summary.heartRateMax} range`, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
    { icon: Footprints, label: 'Steps', value: summary.steps.toLocaleString(), unit: '', sub: `${summary.stepsPercentage}% of goal`, color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
    { icon: Flame, label: 'Calories', value: summary.calories.toLocaleString(), unit: 'kcal', sub: `Goal: ${summary.caloriesGoal}`, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
    { icon: Moon, label: 'Sleep', value: `${summary.sleep.totalHours}`, unit: 'hrs', sub: `Quality: ${summary.sleep.quality}`, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)' },
    { icon: Wind, label: 'SpO2', value: `${summary.spo2 || 98}`, unit: '%', sub: 'Blood Oxygen', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.2)' },
    { icon: Activity, label: 'Distance', value: `${summary.distance}`, unit: 'km', sub: `Goal: ${summary.distanceGoal} km`, color: '#ec4899', bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.2)' }
  ] : [];

  const tabStyle = (tab) => ({
    padding: '8px 20px', borderRadius: 25, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
    border: 'none', transition: 'all 0.3s ease',
    background: activeTab === tab ? 'linear-gradient(135deg, #10b981, #059669)' : '#f1f5f9',
    color: activeTab === tab ? '#fff' : '#64748b',
    boxShadow: activeTab === tab ? '0 4px 15px rgba(16,185,129,0.3)' : 'none'
  });

  return (
    <UserLayout>
       <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '10px', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
             ⌚ Google Fit Sync
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '4px 0 0' }}>
            {connected ? `Connected to ${summary?.deviceName || 'Watch'}` : 'Connect your smartwatch to track health'}
          </p>
        </div>
        
        {connected && (
          <button onClick={handleSync} disabled={syncing} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 25, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Live Sync'}
          </button>
        )}
      </div>

      {!connected ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: '48px 32px', textAlign: 'center', maxWidth: 520, margin: '40px auto' }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, #10b981, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '2rem' }}> ⌚ </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>Watch Integration</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 24px' }}>
            Sync live heart rate, steps, and sleep data from your Google Fit account.
          </p>
          <button onClick={handleConnect} disabled={syncing} style={{ padding: '14px 36px', borderRadius: 30, border: 'none', cursor: 'pointer', background: '#10b981', color: '#fff', fontSize: '1rem', fontWeight: 700, boxShadow: '0 8px 30px rgba(16,185,129,0.3)', marginRight: 10 }}>
            Connect Google Fit
          </button>
          <button onClick={handleSimulate} style={{ padding: '14px 24px', borderRadius: 30, border: '1.5px solid #10b981', cursor: 'pointer', background: 'transparent', color: '#10b981', fontSize: '1rem', fontWeight: 700 }}>
             Demo Simulator
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            <button style={tabStyle('overview')} onClick={() => setActiveTab('overview')}>📊 Overview</button>
            <button style={tabStyle('heart')} onClick={() => setActiveTab('heart')}>💓 Heart Rate</button>
            <button style={tabStyle('activity')} onClick={() => setActiveTab('activity')}>🏃 Activity</button>
            <button style={tabStyle('sleep')} onClick={() => setActiveTab('sleep')}>🌙 Sleep</button>
            <button style={tabStyle('insights')} onClick={() => setActiveTab('insights')}>🧠 AI Insights</button>
          </div>

          {activeTab === 'overview' && summary && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 20, alignItems: 'start' }}>
                <div style={{ background: '#fff', borderRadius: 24, padding: 24, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <ActivityRing percentage={summary.stepsPercentage} size={150} color="#10b981" label="Steps" value={summary.steps.toLocaleString()} subtitle={`of ${summary.stepsGoal}`} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
                  {statCards.map((card, i) => (
                    <div key={i} style={{ background: card.bg, borderRadius: 18, padding: '16px', border: `1px solid ${card.border}` }}>
                      <card.icon size={18} color={card.color} style={{ marginBottom: 8 }} />
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: card.color }}>{card.value}<span style={{ fontSize: '0.7rem', fontWeight: 400 }}>{card.unit}</span></div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{card.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: '#fff', borderRadius: 24, padding: 20, border: '1px solid #e2e8f0' }}>
                 <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 15 }}>24h Heart Rate</div>
                 <HeartRateChart data={heartRateData} height={200} />
              </div>
            </div>
          )}

          {activeTab === 'heart' && <div style={{ background: '#fff', borderRadius: 24, padding: 24, border: '1px solid #e2e8f0' }}><HeartRateChart data={heartRateData} height={300} /></div>}
          {activeTab === 'activity' && <div style={{ background: '#fff', borderRadius: 24, padding: 24, border: '1px solid #e2e8f0' }}><StepsChart data={stepsData} height={300} /></div>}
          {activeTab === 'sleep' && <div style={{ background: '#fff', borderRadius: 24, padding: 24, border: '1px solid #e2e8f0' }}><SleepChart data={summary.sleep} /></div>}
          {activeTab === 'insights' && weeklyTrends && (
             <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 15 }}>
                {weeklyTrends.insights.map((ins, i) => (
                   <div key={i} style={{ background: '#fff', padding: 15, borderRadius: 16, border: '1px solid #e2e8f0', display: 'flex', gap: 10 }}>
                      <span>{ins.icon}</span>
                      <div style={{ fontSize: '0.85rem', color: '#475569' }}>{ins.message}</div>
                   </div>
                ))}
             </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 30, color: '#94a3b8', fontSize: '0.7rem' }}>
            Last sync: {lastSync?.toLocaleTimeString()} • <button onClick={handleDisconnect} style={{ border: 'none', background: 'none', color: '#ef4444', textDecoration: 'underline', cursor: 'pointer' }}>Disconnect</button>
          </div>
        </>
      )}
    </div>
    </UserLayout>
  );
};

export default GoogleFitDashboard;
