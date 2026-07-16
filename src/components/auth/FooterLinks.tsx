import React from "react";
import Link from "next/link";

export const FooterLinks: React.FC = () => {
  return (
    <div className="flex gap-4 items-center justify-center text-xs font-semibold text-[#64748B] select-none mt-6">
      <Link href="#" className="hover:text-[#1C1C3A] transition-colors">
        Conditions
      </Link>
      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
      <Link href="#" className="hover:text-[#1C1C3A] transition-colors">
        Confidentialité
      </Link>
    </div>
  );
};
