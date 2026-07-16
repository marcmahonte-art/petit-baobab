import React, { forwardRef, useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, success, className, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = (e: React.MouseEvent) => {
      e.preventDefault();
      setShowPassword((prev) => !prev);
    };

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        <label
          htmlFor={id}
          className="text-xs font-bold text-[#64748B] uppercase tracking-wider select-none"
        >
          {label}
        </label>
        <div className="relative">
          <div className="absolute left-4.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none select-none z-10">
            <Lock className="w-5 h-5" />
          </div>
          <input
            id={id}
            ref={ref}
            type={showPassword ? "text" : "password"}
            className={`w-full h-[46px] md:h-14 pl-11 md:pl-12 pr-11 md:pr-12 rounded-xl md:rounded-2xl border-2 bg-white text-[#1C1C3A] font-semibold text-sm transition-all focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              error
                ? "border-red-500 focus:ring-red-200"
                : success
                ? "border-green-500 focus:ring-green-100"
                : "border-[#E8E8EF] hover:border-[#6D4CFF] focus:border-[#6D4CFF] focus:ring-[#6D4CFF]/20"
            } ${className || ""}`}
            {...props}
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1C1C3A] focus:outline-none transition-colors select-none z-10 cursor-pointer"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
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

PasswordInput.displayName = "PasswordInput";
