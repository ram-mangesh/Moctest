import { useEffect, useState } from "react";
import api from "../../Api/axios";
import UserLayout from "../UserLayout";
import ExamCard from "../Component/ExamCard";
import { AiChatIcon, AiChatSlider } from "../Component/AiChat";
import VoiceAiTutor from "../Component/VoiceAiTutor";
import WellbeingWidget from "../Component/WellbeingWidget";

const Home = () => {
  const [exams, setExams] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api.get("/user/exams").then((res) => setExams(res.data));
  }, []);

  return (
    <UserLayout>
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          /* Page header */
          .hm-eyebrow {
            display: inline-flex; align-items: center; gap: 6px;
            font-size: 11px; font-weight: 700; letter-spacing: .1em;
            text-transform: uppercase; color: #6366f1;
            background: rgba(99,102,241,.09);
            border: 1px solid rgba(99,102,241,.18);
            border-radius: 20px; padding: 4px 12px; margin-bottom: 10px;
          }
          .hm-eyebrow::before {
            content: ''; width: 5px; height: 5px; border-radius: 50%; background: #6366f1;
          }

          .hm-title {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 26px; font-weight: 900; letter-spacing: -.03em;
            color: #1e1b4b; margin-bottom: 4px;
            animation: fadeUp .4s ease both;
          }
          .hm-sub {
            font-size: 14px; color: rgba(99,102,241,.55); font-weight: 400;
            margin-bottom: 26px; animation: fadeUp .4s ease .05s both;
          }

          /* Grid */
          .hm-grid {
            display: grid; grid-template-columns: 1fr; gap: 16px;
          }
          @media(min-width: 640px)  { .hm-grid { grid-template-columns: repeat(2, 1fr); } }
          @media(min-width: 1100px) { .hm-grid { grid-template-columns: repeat(3, 1fr); } }

          .hm-item { animation: fadeUp .45s ease both; }
        `}</style>

        <div className="hm-eyebrow">Welcome back</div>
        <h2 className="hm-title">Choose an Exam</h2>
        <p className="hm-sub">Pick any exam below to start practising</p>

        <WellbeingWidget />

        <div className="hm-grid">
          {exams.map((exam, i) => (
            <div
              key={exam.id}
              className="hm-item"
              style={{ animationDelay: `${i * 0.07}s` }}>
              <ExamCard exam={exam} />
            </div>
          ))}
        </div>

        <AiChatIcon onClick={() => setOpen(true)} />
        <AiChatSlider
          open={open}
          onClose={() => setOpen(false)}
        />
        <VoiceAiTutor
          open={open}
          onClose={() => setOpen(false)}
        />
      </>
    </UserLayout>
  );
};

export default Home;
