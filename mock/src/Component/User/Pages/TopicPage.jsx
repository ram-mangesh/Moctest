import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../Api/axios";
import UserLayout from "../UserLayout";
import TopicCard from "../Component/TopicCard";
import DifficultySlider from "../Component/DifficultySlider";
import { useTranslation } from "react-i18next";

const TopicPage = () => {
  const { t }          = useTranslation();
  const { subjectId }  = useParams();
  const navigate       = useNavigate();
  const [topics, setTopics]               = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);

  useEffect(() => {
    api.get(`/user/topics?subjectId=${subjectId}`).then(res => setTopics(res.data));
  }, [subjectId]);

  return (
    <UserLayout>
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .tp2-eyebrow {
            display: inline-flex; align-items: center; gap: 6px;
            font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
            color: #059669; background: rgba(5,150,105,.09);
            border: 1px solid rgba(5,150,105,.18); border-radius: 20px;
            padding: 4px 12px; margin-bottom: 10px;
          }
          .tp2-eyebrow::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: #059669; }

          .tp2-title {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 26px; font-weight: 900; letter-spacing: -.03em;
            color: #1e1b4b; margin-bottom: 4px; animation: fadeUp .4s ease both;
          }
          .tp2-sub {
            font-size: 14px; color: rgba(5,150,105,.5); font-weight: 400;
            margin-bottom: 26px; animation: fadeUp .4s ease .05s both;
          }

          .tp2-empty {
            font-size: 14px; color: rgba(5,150,105,.5); padding: 44px;
            text-align: center;
            background: rgba(255,255,255,.6); backdrop-filter: blur(16px);
            border: 1.5px dashed rgba(5,150,105,.2); border-radius: 18px;
          }

          .tp2-grid {
            display: grid; grid-template-columns: repeat(1, 1fr); gap: 9px;
          }
          @media(min-width: 640px) { .tp2-grid { grid-template-columns: repeat(2, 1fr); } }

          .tp2-item { animation: fadeUp .38s ease both; }

          /* difficulty modal overlay */
          .tp2-modal-bg {
            position: fixed; inset: 0; background: rgba(30,27,75,.35);
            backdrop-filter: blur(6px); z-index: 400;
            display: flex; align-items: center; justify-content: center;
            animation: fadeIn .2s ease;
          }
          @keyframes fadeIn { from{opacity:0} to{opacity:1} }
          .tp2-modal {
            background: rgba(255,255,255,.95);
            backdrop-filter: blur(24px); border: 1.5px solid rgba(99,102,241,.14);
            border-radius: 22px; padding: 28px; width: 100%; max-width: 380px;
            box-shadow: 0 20px 60px rgba(99,102,241,.2);
            animation: slideUp .3s cubic-bezier(.34,1.56,.64,1);
          }
          @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
          .tp2-modal-title {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 17px; font-weight: 800; color: #1e1b4b; margin-bottom: 4px;
          }
          .tp2-modal-sub { font-size: 13px; color: rgba(99,102,241,.5); margin-bottom: 20px; }
          .tp2-modal-close {
            position: absolute; top: 16px; right: 16px;
            width: 30px; height: 30px; border-radius: 9px;
            background: rgba(99,102,241,.09); border: none; cursor: pointer;
            font-size: 16px; color: rgba(99,102,241,.5); display: flex;
            align-items: center; justify-content: center; transition: all .15s;
          }
          .tp2-modal-close:hover { background: rgba(99,102,241,.16); color: #6366f1; }
        `}</style>

        <div className="tp2-eyebrow">Topics</div>
        <h2 className="tp2-title">{t("exam.topics", "Topics")}</h2>
        <p className="tp2-sub">Pick a topic and choose your difficulty level</p>

        {topics.length === 0 && (
          <p className="tp2-empty">{t("exam.noTopics", "No topics found")}</p>
        )}

        <div className="tp2-grid">
          {topics.map((topic, i) => (
            <div
              key={topic.id}
              className="tp2-item"
              style={{ animationDelay: `${i * .06}s` }}
              onClick={() => setSelectedTopic(topic)}
            >
              <TopicCard topic={topic} />
            </div>
          ))}
        </div>

        {/* Difficulty modal — shown when a topic is clicked */}
        {selectedTopic && (
          <div className="tp2-modal-bg" onClick={() => setSelectedTopic(null)}>
            <div className="tp2-modal" style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
              <button className="tp2-modal-close" onClick={() => setSelectedTopic(null)}>×</button>
              <div className="tp2-modal-title">{selectedTopic.name}</div>
              <div className="tp2-modal-sub">{selectedTopic.questionCount ?? "—"} questions available</div>
              <DifficultySlider
                topicId={selectedTopic.id}
                onConfirm={(diff) => {
                  setSelectedTopic(null);
                  navigate(`/test/${selectedTopic.id}`, { state: { difficulty: diff } });
                }}
              />
            </div>
          </div>
        )}
      </>
    </UserLayout>
  );
};

export default TopicPage;
