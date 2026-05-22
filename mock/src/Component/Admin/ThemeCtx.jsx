import { createContext } from "react";

export const ThemeCtx = createContext({ dark: true, toggle: () => {} });

// ─── Fake API (mirrors your real api calls — swap with your axios instance) ──
export const fakeDb = {
  exams: [
    { id: 1, name: "SSC CGL 2025" },
    { id: 2, name: "UPSC Prelims" },
  ],
  subjects: [
    { id: 1, examId: 1, name: "Mathematics" },
    { id: 2, examId: 1, name: "English" },
    { id: 3, examId: 2, name: "History" },
  ],
  topics: [
    { id: 1, subjectId: 1, name: "Percentage" },
    { id: 2, subjectId: 1, name: "Algebra" },
    { id: 3, subjectId: 2, name: "Grammar" },
  ],
  questions: [
    {
      id: 1, topicId: 1, subjectId: 1,
      question: "What is 25% of 200?",
      type: "MCQ", difficulty: "EASY",
      options: ["25", "50", "75", "100"],
      correct: 1, correctMultiple: [], correctNumeric: null, tolerance: null,
      subject: { name: "Mathematics" }, topic: { name: "Percentage" }
    },
  ],
  nextId: { exams: 3, subjects: 4, topics: 4, questions: 2 },
};

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export const api = {
  get: async (url) => {
    await delay();
    if (url === "/admin/exams") return { data: [...fakeDb.exams] };
    if (url.startsWith("/admin/subjects?examId=")) {
      const eid = Number(url.split("=")[1]);
      return { data: fakeDb.subjects.filter(s => s.examId === eid) };
    }
    if (url.startsWith("/admin/topics?subjectId=")) {
      const sid = Number(url.split("=")[1]);
      return { data: fakeDb.topics.filter(t => t.subjectId === sid) };
    }
    if (url.startsWith("/admin/questions?topicId=")) {
      const tid = Number(url.split("=")[1]);
      return { data: fakeDb.questions.filter(q => q.topicId === tid) };
    }
    if (url.startsWith("/review/drafts/topic/")) return { data: [] };
    return { data: [] };
  },
  post: async (url, body) => {
    await delay();
    if (url === "/admin/exams") {
      const item = { id: fakeDb.nextId.exams++, name: body.name };
      fakeDb.exams.push(item);
      return { data: item };
    }
    if (url === "/admin/subjects") {
      const item = { id: fakeDb.nextId.subjects++, examId: Number(body.examId), name: body.name };
      fakeDb.subjects.push(item);
      return { data: item };
    }
    if (url === "/admin/topics") {
      const item = { id: fakeDb.nextId.topics++, subjectId: Number(body.subjectId), name: body.name };
      fakeDb.topics.push(item);
      return { data: item };
    }
    if (url === "/admin/questions") {
      const sub = fakeDb.subjects.find(s => s.id === fakeDb.topics.find(t => t.id === body.topicId)?.subjectId);
      const top = fakeDb.topics.find(t => t.id === body.topicId);
      const item = { id: fakeDb.nextId.questions++, ...body, subject: { name: sub?.name || "" }, topic: { name: top?.name || "" } };
      fakeDb.questions.push(item);
      return { data: item };
    }
    return { data: {} };
  },
  put: async (url, body) => {
    await delay();
    if (url.startsWith("/admin/exams/")) {
      const id = Number(url.split("/").pop());
      const idx = fakeDb.exams.findIndex(e => e.id === id);
      if (idx !== -1) fakeDb.exams[idx] = { ...fakeDb.exams[idx], ...body };
    }
    if (url.startsWith("/admin/subjects/")) {
      const id = Number(url.split("/").pop());
      const idx = fakeDb.subjects.findIndex(s => s.id === id);
      if (idx !== -1) fakeDb.subjects[idx] = { ...fakeDb.subjects[idx], ...body };
    }
    if (url.startsWith("/admin/topics/")) {
      const id = Number(url.split("/").pop());
      const idx = fakeDb.topics.findIndex(t => t.id === id);
      if (idx !== -1) fakeDb.topics[idx] = { ...fakeDb.topics[idx], ...body };
    }
    if (url.startsWith("/admin/questions/")) {
      const id = Number(url.split("/").pop());
      const idx = fakeDb.questions.findIndex(q => q.id === id);
      if (idx !== -1) fakeDb.questions[idx] = { ...fakeDb.questions[idx], ...body };
    }
    return { data: {} };
  },
  delete: async (url) => {
    await delay();
    if (url.startsWith("/admin/exams/")) {
      const id = Number(url.split("/").pop());
      fakeDb.exams = fakeDb.exams.filter(e => e.id !== id);
    }
    if (url.startsWith("/admin/subjects/")) {
      const id = Number(url.split("/").pop());
      fakeDb.subjects = fakeDb.subjects.filter(s => s.id !== id);
    }
    if (url.startsWith("/admin/topics/")) {
      const id = Number(url.split("/").pop());
      fakeDb.topics = fakeDb.topics.filter(t => t.id !== id);
    }
    if (url.startsWith("/admin/questions/")) {
      const id = Number(url.split("/").pop());
      fakeDb.questions = fakeDb.questions.filter(q => q.id !== id);
    }
    return { data: {} };
  }
};