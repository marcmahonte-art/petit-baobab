import React from "react";
import { HelpCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n-provider";

export const NeedHelpLink: React.FC = () => {
  const { lang } = useI18n();

  return (
    <div className="mt-4 text-center">
      <a
        href="#"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-[#64748B] hover:text-[#1C1C3A] transition-colors"
      >
        <HelpCircle className="w-4 h-4 text-gray-400" />
        <span>{lang === "fr" ? "Besoin d'aide ?" : "Need help?"}</span>
      </a>
    </div>
  );
};
