import React, { useState } from "react";
import LogoutButton from "../Auth/LogoutButton";

const AdminPanel = () => {
  const [question, setQuestion] = useState("");
  const [subject, setSubject] = useState("");   // 🔥 NEW
  const [topic, setTopic] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Unauthorized. Please login as admin.");
      return;
    }

    try {
      await fetch("http://localhost:8089/admin/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          question,
          subject,     // 🔥 SEND SUBJECT
          topic,
          options,
          correct
        })
      });

      alert("✅ Question Added");

      setQuestion("");
      setSubject("");
      setTopic("");
      setOptions(["", "", "", ""]);
      setCorrect(0);
    } catch (err) {
      alert("❌ Failed to add question");
    }
  };

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <LogoutButton />
      </div>

      {/* FORM */}
      <div className="p-6 max-w-xl mx-auto bg-white shadow rounded-xl">

        <input
          placeholder="Question"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          className="border p-2 w-full mb-2 rounded"
        />

        {/* 🔥 SUBJECT */}
        <input
          placeholder="Subject (e.g. Maths)"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="border p-2 w-full mb-2 rounded"
        />

        <input
          placeholder="Topic (e.g. Percentage)"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          className="border p-2 w-full mb-2 rounded"
        />

        {options.map((opt, i) => (
          <input
            key={i}
            placeholder={`Option ${i + 1}`}
            value={opt}
            onChange={e => {
              const newOps = [...options];
              newOps[i] = e.target.value;
              setOptions(newOps);
            }}
            className="border p-2 w-full mb-2 rounded"
          />
        ))}

        <select
          value={correct}
          onChange={e => setCorrect(Number(e.target.value))}
          className="border p-2 w-full mb-4 rounded"
        >
          <option value={0}>Correct Option 1</option>
          <option value={1}>Correct Option 2</option>
          <option value={2}>Correct Option 3</option>
          <option value={3}>Correct Option 4</option>
        </select>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition"
        >
          Add Question
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
