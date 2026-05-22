import { useEffect, useState } from "react";
import api from "../Api/axios";
import UserLayout from "../User/UserLayout";
import ExamCard from "../User/Component/ExamCard";

const RealExamsPage = () => {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    api.get("/user/exams").then(res => setExams(res.data));
  }, []);

  return (
    <UserLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exams.map(exam => (
          <ExamCard
            key={exam.id}
            exam={exam}
            isRealExam   // ✅ THIS FLAG
          />
        ))}
      </div>
    </UserLayout>
  );
};

export default RealExamsPage;