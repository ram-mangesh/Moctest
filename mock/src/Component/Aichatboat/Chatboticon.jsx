import { useTranslation } from "react-i18next";

const AiChatIcon = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-center gap-2 z-50">

      {/* TEXT ABOVE ICON */}
      <div className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow">
        {t("ai.iconText")}
      </div>

      {/* CHAT ICON */}
      <button
        onClick={onClick}
        className="bg-blue-600 text-white 
                   w-14 h-14 rounded-full shadow-lg text-2xl
                   flex items-center justify-center 
                   hover:bg-blue-700 transition"
      >
        🤖
      </button>

    </div>
  );
};

export default AiChatIcon;