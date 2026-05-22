import React, { useEffect, useState } from "react";
import api from "../Api/axios";
import { SharedStyles } from "./ExamManager";

const SubjectManager = ({ isDark }) => {
  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState("");
  const [name, setName] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [editId, setEditId] = useState(null);
  const d = isDark;

  useEffect(() => { api.get("/admin/exams").then(r => setExams(r.data)); }, []);

  const loadSubjects = async (id) => {
    if (!id) { setSubjects([]); return; }
    const res = await api.get(`/admin/subjects?examId=${id}`);
    setSubjects(res.data);
  };

  const submit = async () => {
    if (!examId) return alert("Select exam first");
    if (!name.trim()) return alert("Enter subject name");
    if (editId) {
      await api.put(`/admin/subjects/${editId}`, { name });
    } else {
      await api.post("/admin/subjects", { name, examId });
    }
    setName(""); setEditId(null); loadSubjects(examId);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this subject?")) return;
    await api.delete(`/admin/subjects/${id}`);
    loadSubjects(examId);
  };

  return (
    <div className="mgr">
      {/* Form */}
      <div className={`mgr-card ${d ? "mgr-card-dark" : "mgr-card-light"}`} style={{ "--glow": "rgba(168,85,247,.25)" }}>
        <div className="mgr-card-header">
          <span className="mgr-card-icon">📚</span>
          <span className={`mgr-card-title ${d ? "t-dark" : "t-light"}`}>
            {editId ? "Update Subject" : "Add New Subject"}
          </span>
        </div>

        <div className="mgr-field">
          <label className={`mgr-label ${d ? "mgr-label-dark" : "mgr-label-light"}`}>Select Exam</label>
          <select
            value={examId}
            onChange={e => { setExamId(e.target.value); setEditId(null); setName(""); loadSubjects(e.target.value); }}
            className={`mgr-select ${d ? "mgr-select-dark" : "mgr-select-light"}`}
            style={{ "--focus": "#a855f7" }}
          >
            <option value="">— Choose an exam —</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>

        <div className="mgr-row" style={{ marginTop: 12 }}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="Subject name (e.g. Mathematics)"
            disabled={!examId}
            className={`mgr-input ${d ? "mgr-input-dark" : "mgr-input-light"}`}
            style={{ "--focus": "#a855f7" }}
          />
          <button
            onClick={submit} disabled={!examId}
            className="mgr-btn"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 4px 16px rgba(168,85,247,.4)" }}
          >
            {editId ? "✏️ Update" : "➕ Add"}
          </button>
          {editId && (
            <button onClick={() => { setEditId(null); setName(""); }} className={`mgr-ghost ${d ? "mgr-ghost-dark" : "mgr-ghost-light"}`}>Cancel</button>
          )}
        </div>
      </div>

      {examId && <>
        <div className="mgr-list-hdr">
          <span className={`mgr-list-title ${d ? "t-dark" : "t-light"}`}>Subjects</span>
          <span className="mgr-count" style={{ background: "rgba(168,85,247,.12)", color: "#c084fc" }}>{subjects.length} total</span>
        </div>

        {subjects.length === 0 && (
          <div className={`mgr-empty ${d ? "mgr-empty-dark" : "mgr-empty-light"}`}>
            <span className="mgr-empty-icon">📭</span>
            <p>No subjects yet for this exam.</p>
          </div>
        )}

        <div className="mgr-list">
          {subjects.map((s, i) => (
            <div key={s.id} className={`mgr-item ${d ? "mgr-item-dark" : "mgr-item-light"}`} style={{ "--delay": `${i * .045}s`, "--hover-glow": "rgba(168,85,247,.12)" }}>
              <div className="mgr-item-l">
                <span className="mgr-num" style={{ background: "rgba(168,85,247,.12)", color: "#c084fc" }}>{i + 1}</span>
                <span className={`mgr-name ${d ? "t-dark" : "t-light"}`}>{s.name}</span>
              </div>
              <div className="mgr-actions">
                <button className="mgr-edit" style={{ "--ec": "#a855f7", background: "rgba(168,85,247,.12)", color: "#c084fc" }} onClick={() => { setEditId(s.id); setName(s.name); }}>✏️ Edit</button>
                <button className="mgr-del" onClick={() => remove(s.id)}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      </>}

      <SharedStyles isDark={isDark} />
      <style>{`.mgr-field{margin-bottom:0;}`}</style>
    </div>
  );
};

export default SubjectManager;
