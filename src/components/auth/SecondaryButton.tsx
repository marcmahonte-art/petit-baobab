import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface SecondaryButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  isLoading?: boolean;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
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
      className={`w-full h-11 md:h-14 bg-white border-2 border-[#E8E8EF] hover:border-[#6D4CFF] text-[#1C1C3A] font-bold text-sm md:text-base rounded-full flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer ${
        className || ""
      }`}
      {...props}
    >
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
    </motion.button>
  );
};
