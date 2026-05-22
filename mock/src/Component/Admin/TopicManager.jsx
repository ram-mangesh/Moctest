import React, { useEffect, useState } from "react";
import api from "../Api/axios";
import { SharedStyles } from "./ExamManager";

const TopicManager = ({ isDark }) => {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [examId, setExamId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const d = isDark;

  useEffect(() => { api.get("/admin/exams").then(r => setExams(r.data)); }, []);

  const loadSubjects = async (eid) => {
    const res = await api.get(`/admin/subjects?examId=${eid}`);
    setSubjects(res.data); setSubjectId(""); setTopics([]);
  };

  const loadTopics = async (sid) => {
    if (!sid) return;
    const res = await api.get(`/admin/topics?subjectId=${sid}`);
    setTopics(res.data);
  };

  const submit = async () => {
    if (!subjectId) return alert("Select subject first");
    if (!name.trim()) return alert("Enter topic name");
    if (editId) {
      await api.put(`/admin/topics/${editId}`, { name, subjectId });
    } else {
      await api.post("/admin/topics", { name, subjectId });
    }
    setName(""); setEditId(null); loadTopics(subjectId);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this topic?")) return;
    await api.delete(`/admin/topics/${id}`);
    loadTopics(subjectId);
  };

  return (
    <div className="mgr">
      <div className={`mgr-card ${d ? "mgr-card-dark" : "mgr-card-light"}`} style={{ "--glow": "rgba(16,185,129,.2)" }}>
        <div className="mgr-card-header">
          <span className="mgr-card-icon">🗂️</span>
          <span className={`mgr-card-title ${d ? "t-dark" : "t-light"}`}>{editId ? "Update Topic" : "Add New Topic"}</span>
        </div>

        <div className="mgr-grid-2">
          <div>
            <label className={`mgr-label ${d ? "mgr-label-dark" : "mgr-label-light"}`}>Exam</label>
            <select
              value={examId}
              onChange={e => { setExamId(e.target.value); loadSubjects(e.target.value); }}
              className={`mgr-select ${d ? "mgr-select-dark" : "mgr-select-light"}`}
              style={{ "--focus": "#10b981" }}
            >
              <option value="">— Select Exam —</option>
              {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label className={`mgr-label ${d ? "mgr-label-dark" : "mgr-label-light"}`}>Subject</label>
            <select
              value={subjectId}
              onChange={e => { setSubjectId(e.target.value); loadTopics(e.target.value); setEditId(null); setName(""); }}
              disabled={!examId}
              className={`mgr-select ${d ? "mgr-select-dark" : "mgr-select-light"}`}
              style={{ "--focus": "#10b981" }}
            >
              <option value="">— Select Subject —</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="mgr-row" style={{ marginTop: 14 }}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="Topic name (e.g. Algebra, Photosynthesis...)"
            disabled={!subjectId}
            className={`mgr-input ${d ? "mgr-input-dark" : "mgr-input-light"}`}
            style={{ "--focus": "#10b981" }}
          />
          <button
            onClick={submit} disabled={!subjectId}
            className="mgr-btn"
            style={{ background: "linear-gradient(135deg,#059669,#06b6d4)", boxShadow: "0 4px 16px rgba(16,185,129,.35)" }}
          >
            {editId ? "✏️ Update" : "➕ Add"}
          </button>
          {editId && (
            <button onClick={() => { setEditId(null); setName(""); }} className={`mgr-ghost ${d ? "mgr-ghost-dark" : "mgr-ghost-light"}`}>Cancel</button>
          )}
        </div>
      </div>

      {subjectId && <>
        <div className="mgr-list-hdr">
          <span className={`mgr-list-title ${d ? "t-dark" : "t-light"}`}>Topics</span>
          <span className="mgr-count" style={{ background: "rgba(16,185,129,.12)", color: "#34d399" }}>{topics.length} total</span>
        </div>

        {topics.length === 0 && (
          <div className={`mgr-empty ${d ? "mgr-empty-dark" : "mgr-empty-light"}`}>
            <span className="mgr-empty-icon">🗃️</span>
            <p>No topics yet — add your first one!</p>
          </div>
        )}

        <div className="mgr-list">
          {topics.map((t, i) => (
            <div key={t.id} className={`mgr-item ${d ? "mgr-item-dark" : "mgr-item-light"}`} style={{ "--delay": `${i * .045}s`, "--hover-glow": "rgba(16,185,129,.1)" }}>
              <div className="mgr-item-l">
                <span className="mgr-num" style={{ background: "rgba(16,185,129,.12)", color: "#34d399" }}>{i + 1}</span>
                <span className={`mgr-name ${d ? "t-dark" : "t-light"}`}>{t.name}</span>
              </div>
              <div className="mgr-actions">
                <button className="mgr-edit" style={{ background: "rgba(16,185,129,.12)", color: "#34d399" }} onClick={() => { setEditId(t.id); setName(t.name); }}>✏️ Edit</button>
                <button className="mgr-del" onClick={() => remove(t.id)}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      </>}

      <SharedStyles isDark={isDark} />
    </div>
  );
};

export default TopicManager;
