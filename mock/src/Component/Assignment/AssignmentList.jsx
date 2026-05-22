import { useEffect, useState } from "react";
import api from "../Api/axios";
import UserLayout from "../User/UserLayout";

const AssignmentList = () => {
  const standardId = localStorage.getItem("standardId"); // EXAM = STD

  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [attempts, setAttempts] = useState({});
  const [uploading, setUploading] = useState(null);

  /* ===============================
     LOAD SUBJECTS FOR MY STANDARD
     =============================== */
  useEffect(() => {
    if (!standardId) return;

    api
      .get(`/user/subjects?examId=${standardId}`)
      .then(res => setSubjects(res.data))
      .catch(() => setSubjects([]));
  }, [standardId]);

  /* ===============================
     LOAD ASSIGNMENTS (TOPICS)
     =============================== */
  useEffect(() => {
    subjects.forEach(subject => {
      api
        .get(`/user/topics?subjectId=${subject.id}`)
        .then(res => {
          setAssignments(prev => ({
            ...prev,
            [subject.id]: res.data
          }));
        });
    });
  }, [subjects]);

  /* ===============================
     LOAD ATTEMPTS / STATUS
     =============================== */
  useEffect(() => {
    api
      .get(`/user/assignment/attempts?standardId=${standardId}`)
      .then(res => {
        const map = {};
        res.data.forEach(a => {
          map[a.assignmentId] = a;
        });
        setAttempts(map);
      })
      .catch(() => setAttempts({}));
  }, [standardId]);

  /* ===============================
     FILE UPLOAD
     =============================== */
  const uploadAssignment = async (assignmentId, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("assignmentId", assignmentId);
    formData.append("file", file);

    setUploading(assignmentId);

    try {
      await api.post("/user/assignment/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const res = await api.get(
        `/user/assignment/attempts?standardId=${standardId}`
      );

      const map = {};
      res.data.forEach(a => {
        map[a.assignmentId] = a;
      });
      setAttempts(map);
    } catch {
      alert("Upload failed");
    }

    setUploading(null);
  };

  /* ===============================
     STATUS
     =============================== */
  const getStatus = (id) => {
    const a = attempts[id];
    if (!a) return "Pending";
    if (a && !a.aiEvaluated) return "Submitted";
    return "Evaluated";
  };

  return (
    <UserLayout>
      <h2 className="text-2xl font-bold mb-6">
        📘 My Assignments
      </h2>

      {subjects.length === 0 && (
        <p className="text-gray-500">
          No subjects available for your standard
        </p>
      )}

      {subjects.map(subject => (
        <div key={subject.id} className="mb-8">
          {/* SUBJECT HEADER */}
          <h3 className="text-lg font-semibold mb-3">
            {subject.name}
          </h3>

          {/* ASSIGNMENTS */}
          {assignments[subject.id]?.length === 0 && (
            <p className="text-sm text-gray-500">
              No assignments
            </p>
          )}

          <div className="space-y-4">
            {assignments[subject.id]?.map(a => {
              const attempt = attempts[a.id];
              const status = getStatus(a.id);

              return (
                <div
                  key={a.id}
                  className="bg-white border rounded p-4 shadow"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">
                      {a.name}
                    </h4>

                    <span
                      className={`text-sm font-semibold ${
                        status === "Pending"
                          ? "text-yellow-600"
                          : status === "Submitted"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    {a.description || "Written assignment"}
                  </p>

                  {/* UPLOAD */}
                  {status === "Pending" && (
                    <div className="mt-3 flex items-center gap-3">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.png"
                        onChange={(e) =>
                          uploadAssignment(
                            a.id,
                            e.target.files[0]
                          )
                        }
                      />
                      {uploading === a.id && (
                        <span className="text-sm text-gray-500">
                          Uploading...
                        </span>
                      )}
                    </div>
                  )}

                  {/* SUBMITTED / EVALUATED */}
                  {status !== "Pending" && (
                    <div className="mt-3 text-sm">
                      <p>
                        📤 Submitted:{" "}
                        {new Date(
                          attempt.submittedAt
                        ).toLocaleDateString()}
                      </p>

                      <p>
                        👨‍🏫 Reviewed:{" "}
                        {attempt.reviewed
                          ? "✅ Yes"
                          : "❌ No"}
                      </p>
                    </div>
                  )}

                  {/* AI FEEDBACK */}
                  {status === "Evaluated" && (
                    <div className="mt-4 bg-blue-50 p-3 rounded">
                      <p className="font-medium">
                        🤖 AI Feedback
                      </p>
                      <p className="mt-1 text-sm">
                        Score:{" "}
                        <b>{attempt.score}%</b>
                      </p>
                      <p className="mt-2 text-sm">
                        {attempt.aiRecommendation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </UserLayout>
  );
};

export default AssignmentList;