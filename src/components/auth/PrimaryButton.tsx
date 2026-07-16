import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface PrimaryButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  isLoading?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  isLoading,
  className,
  disabled,
  ...props
}) => {
  return (
    <motion.button
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : undefined}
      disabled={disabled || isLoading}
      className={`w-full h-11 md:h-14 bg-gradient-to-r from-[#6D4CFF] to-[#8C6EFF] text-white font-bold text-sm md:text-base rounded-full md:rounded-full shadow-[0_4px_12px_rgba(109,76,255,0.15)] flex items-center justify-center gap-2 transition-all hover:shadow-[0_6px_20px_rgba(109,76,255,0.25)] focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/50 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer ${
        className || ""
      }`}
      {...props}
    >
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
    </motion.button>
  );
};
