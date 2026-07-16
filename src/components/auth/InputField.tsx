import React, { forwardRef } from "react";
import { LucideIcon } from "lucide-react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: LucideIcon;
  success?: boolean;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, icon: Icon, success, className, id, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        <label
          htmlFor={id}
          className="text-xs font-bold text-[#64748B] uppercase tracking-wider select-none"
        >
          {label}
        </label>
        <div className="relative">
          {Icon && (
            <div className="absolute left-4.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none select-none z-10">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <input
            id={id}
            ref={ref}
            className={`w-full h-[46px] md:h-14 ${
              Icon ? "pl-11 md:pl-12" : "px-4"
            } pr-4 rounded-xl md:rounded-2xl border-2 bg-white text-[#1C1C3A] font-semibold text-sm transition-all focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              error
                ? "border-red-500 focus:ring-red-200"
                : success
                ? "border-green-500 focus:ring-green-100"
                : "border-[#E8E8EF] hover:border-[#6D4CFF] focus:border-[#6D4CFF] focus:ring-[#6D4CFF]/20"
            } ${className || ""}`}
            {...props}
          />
        </div>
        {error && (
          <span className="text-xs font-bold text-red-500 mt-0.5 select-none leading-none">
            {error}
          </span>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";
