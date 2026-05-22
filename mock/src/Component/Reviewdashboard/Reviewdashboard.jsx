import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Api/axios";

/**
 * ReviewDashboard — Spaced Repetition Review Schedule
 *
 * Shows topics due for review today + full 30-day schedule.
 * Based on Ebbinghaus forgetting curve intervals.
 *
 * Route: /review  (add to UserRoutes + UserSidebar)
 */

const urgencyColor = (daysOverdue) => {
  if (daysOverdue >= 3) return { bg: "bg-red-50 dark:bg-red-900/20",    border: "border-red-200 dark:border-red-700",    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",    label: "🚨 Overdue" };
  if (daysOverdue >= 1) return { bg: "bg-amber-50 dark:bg-amber-900/20",border: "border-amber-200 dark:border-amber-700",badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",label: "⚠️ Due" };
  return { bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-700", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300", label: "📅 Today" };
};

const fmtDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.round((d - today) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 0)  return `${Math.abs(diff)} days ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const ReviewDashboard = () => {
  const [dueTopics,  setDue]      = useState([]);
  const [schedule,   setSchedule] = useState([]);
  const [loading,    setLoading]  = useState(true);
  const [tab,        setTab]      = useState("due");
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get("/user/review/due").catch(() => ({ data: [] })),
      api.get("/user/review/schedule").catch(() => ({ data: [] })),
    ]).then(([due, sched]) => {
      setDue(due.data || []);
      setSchedule(sched.data || []);
      setLoading(false);
    });
  }, []);

  const startReview = (topicId) => navigate(`/topic/${topicId}`);

  const overdue  = dueTopics.filter((t) => t.daysOverdue >= 1);
  const dueToday = dueTopics.filter((t) => t.daysOverdue === 0);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          🔁 Spaced Repetition Review
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Based on Ebbinghaus forgetting curve — review at the right time, not too early or too late
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Due today",  value: dueTopics.length, color: dueTopics.length > 0 ? "text-red-600" : "text-green-600", bg: dueTopics.length > 0 ? "bg-red-50 dark:bg-red-900/20" : "bg-green-50 dark:bg-green-900/20" },
          { label: "Overdue",    value: overdue.length,   color: overdue.length > 0 ? "text-amber-600" : "text-gray-500",  bg: "bg-gray-50 dark:bg-gray-800" },
          { label: "Upcoming",   value: schedule.length,  color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 border-b border-gray-100 dark:border-gray-700">
        {[
          { id: "due",      label: `📬 Due Today (${dueTopics.length})` },
          { id: "schedule", label: `📅 30-Day Schedule (${schedule.length})` },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition ${
              tab === t.id
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === "due" ? (
        dueTopics.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🎉</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">All caught up!</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              No topics due for review today. Keep studying to build your review queue.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {overdue.length > 0 && (
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">
                ⚠️ Overdue — review these first
              </p>
            )}
            {dueTopics.map((topic) => {
              const u = urgencyColor(topic.daysOverdue);
              return (
                <div key={topic.topicId}
                  className={`rounded-xl border p-4 flex items-center gap-4 ${u.bg} ${u.border}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${u.badge}`}>
                        {u.label}
                      </span>
                      {topic.daysOverdue > 0 && (
                        <span className="text-xs text-gray-400">
                          {topic.daysOverdue} day{topic.daysOverdue !== 1 ? "s" : ""} overdue
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{topic.topicName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {topic.subjectName} · Last score: {Math.round(topic.lastScore)}% · {topic.failCount} attempt{topic.failCount !== 1 ? "s" : ""} below 60%
                    </p>
                  </div>
                  <button onClick={() => startReview(topic.topicId)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shrink-0">
                    Review Now →
                  </button>
                </div>
              );
            })}
          </div>
        )
      ) : (
        schedule.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-500 text-sm">No topics scheduled yet. Complete some tests to start your review schedule.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {schedule.map((topic, i) => {
              const isToday = topic.daysOverdue > 0 || fmtDate(topic.reviewDate) === "Today";
              return (
                <div key={i}
                  className={`flex items-center gap-4 p-3.5 rounded-xl border transition
                    ${isToday
                      ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700"
                      : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}>
                  {/* Date pill */}
                  <div className={`text-center shrink-0 w-16 py-1 rounded-lg text-xs font-semibold
                    ${isToday ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`}>
                    {fmtDate(topic.reviewDate)}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{topic.topicName}</p>
                    <p className="text-xs text-gray-400">{topic.subjectName} · {Math.round(topic.lastScore)}% last score</p>
                  </div>
                  {/* Score bar */}
                  <div className="w-20 shrink-0">
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div style={{ width: topic.lastScore + "%" }}
                        className={`h-full rounded-full ${topic.lastScore >= 75 ? "bg-green-500" : topic.lastScore >= 50 ? "bg-amber-400" : "bg-red-500"}`} />
                    </div>
                    <p className="text-xs text-gray-400 text-right mt-0.5">{Math.round(topic.lastScore)}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* How it works */}
      <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          How spaced repetition works
        </p>
        <div className="grid grid-cols-5 gap-2 text-center">
          {[
            { attempt: "Fail 1×", days: "1 day",   color: "bg-red-100 dark:bg-red-900/30" },
            { attempt: "Fail 2×", days: "3 days",  color: "bg-orange-100 dark:bg-orange-900/30" },
            { attempt: "Fail 3×", days: "7 days",  color: "bg-amber-100 dark:bg-amber-900/30" },
            { attempt: "Fail 4×", days: "14 days", color: "bg-blue-100 dark:bg-blue-900/30" },
            { attempt: "Mastered", days: "30 days", color: "bg-green-100 dark:bg-green-900/30" },
          ].map((step) => (
            <div key={step.attempt} className={`${step.color} rounded-lg p-2`}>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{step.attempt}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">→ {step.days}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">
          Topics you score below 60% are automatically scheduled for review using the Ebbinghaus forgetting curve
        </p>
      </div>
    </div>
  );
};

export default ReviewDashboard;