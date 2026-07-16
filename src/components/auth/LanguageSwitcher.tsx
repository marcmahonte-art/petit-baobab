import React from "react";
import { Globe, ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n-provider";

export const LanguageSwitcher: React.FC = () => {
  const { lang, setLanguage } = useI18n();

  const handleLangToggle = () => {
    setLanguage(lang === "fr" ? "en" : "fr");
  };

  return (
    <button
      onClick={handleLangToggle}
      className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors select-none cursor-pointer"
    >
      <Globe className="w-4 h-4 text-gray-500" />
      <span>{lang === "fr" ? "Français" : "English"}</span>
      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
    </button>
  );
};
