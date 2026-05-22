import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <select
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="border px-2 py-1 rounded"
      defaultValue="en"
    >
      <option value="en">English</option>
      <option value="hi">हिंदी</option>
      <option value="mr">मराठी</option>
    </select>
  );
};

export default LanguageSwitcher;