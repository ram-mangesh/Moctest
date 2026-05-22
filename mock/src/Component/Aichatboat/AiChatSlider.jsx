import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Api/axios";
import { useTranslation } from "react-i18next";
import { Gamepad2 } from "lucide-react";
import ExamQuestGame from "../Game/ExamQuestGame";

const AiChatSlider = ({ open, onClose }) => {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showGame, setShowGame] = useState(false);

  const navigate = useNavigate();
  const username =
    localStorage.getItem("username") || t("common.student");

  // 🔥 FIRST-TIME vs RETURNING WELCOME
  useEffect(() => {
    if (!open) return;

    const alreadyWelcomed = localStorage.getItem("ai_welcomed");

    const welcomeMessage = !alreadyWelcomed
      ? t("ai.welcomeFirst", { name: username })
      : t("ai.welcomeBack", { name: username });

    localStorage.setItem("ai_welcomed", "true");

    setMessages([
      {
        role: "ai",
        text: welcomeMessage
      }
    ]);
  }, [open, username, t]);

  // SEND PROMPT
  const sendPrompt = async () => {
    if (!prompt.trim()) return;

    setMessages(prev => [...prev, { role: "user", text: prompt }]);
    setLoading(true);

    try {
      const res = await api.post("/user/ai/chat", prompt, {
        headers: { "Content-Type": "text/plain" }
      });

      setMessages(prev => [
        ...prev,
        { role: "ai", text: res.data }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "ai", text: t("ai.unavailable") }
      ]);
    }

    setPrompt("");
    setLoading(false);
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl
      transform transition-transform duration-300 z-50 flex flex-col
      ${open ? "translate-x-0" : "translate-x-full"}`}
    >
      {showGame ? (
        <ExamQuestGame onClose={() => setShowGame(false)} />
      ) : (
      <>
        {/* HEADER */}
        <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
          <h3 className="font-semibold">
            {t("ai.title")}
          </h3>
          <div className="flex gap-4">
            <button
              onClick={() => setShowGame(true)}
              className="hover:scale-110 transition-transform"
              title="Mini Game Focus"
            >
              <Gamepad2 size={20} />
            </button>
            <button onClick={onClose}>✖</button>
          </div>
        </div>

        {/* CHAT */}
        <div className="p-3 flex-1 overflow-y-auto space-y-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-2 rounded text-sm whitespace-pre-wrap
                  ${m.role === "user"
                  ? "bg-blue-100 text-right"
                  : "bg-gray-100 text-left"}`}
            >
              {m.text}
            </div>
          ))}

          {loading && (
            <p className="text-xs">
              {t("ai.thinking")}
            </p>
          )}
        </div>

        {/* INPUT */}
        <div className="p-3 border-t flex gap-2">
          <input
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            className="flex-1 border rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
            placeholder={t("ai.placeholder")}
          />
          <button
            onClick={sendPrompt}
            className="bg-blue-600 text-white px-3 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            {t("common.send")}
          </button>
        </div>
      </>
      )}
    </div>
  );
};

export default AiChatSlider;