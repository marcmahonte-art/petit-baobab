import React from "react";

interface RememberMeProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id?: string;
}

export const RememberMe: React.FC<RememberMeProps> = ({ checked, onChange, label, id }) => {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none group">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4.5 h-4.5 rounded border-2 border-[#E8E8EF] text-[#6D4CFF] focus:ring-2 focus:ring-[#6D4CFF]/20 accent-[#6D4CFF] cursor-pointer transition-all"
      />
      <span className="text-sm font-semibold text-[#64748B] group-hover:text-[#1C1C3A] transition-colors">
        {label}
      </span>
    </label>
  );
};
