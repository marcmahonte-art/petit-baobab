"use client";
import React from "react";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-[#F5F0EB] flex items-center justify-center mb-6">
        <Construction className="w-8 h-8 text-[#7A6A5E]" />
      </div>
      <h1 className="text-2xl font-bold text-[#3B2416] mb-2">{title}</h1>
      <p className="text-[#7A6A5E] max-w-md">{description}</p>
    </div>
  );
}
