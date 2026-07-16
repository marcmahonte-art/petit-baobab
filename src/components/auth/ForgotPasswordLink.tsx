import React from "react";
import Link from "next/link";

interface ForgotPasswordLinkProps {
  label: string;
  href: string;
}

export const ForgotPasswordLink: React.FC<ForgotPasswordLinkProps> = ({ label, href }) => {
  return (
    <Link
      href={href}
      className="text-sm font-bold text-[#6D4CFF] hover:text-[#5A3EE0] hover:underline transition-colors select-none"
    >
      {label}
    </Link>
  );
};
