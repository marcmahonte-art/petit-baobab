import React from "react";

interface DividerProps {
  label: string;
}

export const Divider: React.FC<DividerProps> = ({ label }) => {
  return (
    <div className="w-full flex items-center gap-4 my-4 select-none">
      <div className="flex-1 h-[2px] bg-[#E8E8EF]" />
      <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
        {label}
      </span>
      <div className="flex-1 h-[2px] bg-[#E8E8EF]" />
    </div>
  );
};
