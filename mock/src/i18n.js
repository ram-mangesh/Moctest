import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      appName: "ExamPrep",
      search: "Search exams...",
      logout: "Logout"
    }
  },
  hi: {
    translation: {
      appName: "एग्जाम प्रेप",
      search: "परीक्षा खोजें...",
      logout: "लॉगआउट"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("lang") || "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;