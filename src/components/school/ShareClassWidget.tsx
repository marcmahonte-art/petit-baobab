"use client";
import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Printer, Share2, Check } from "lucide-react";

interface ShareClassWidgetProps {
  classCode: string;
  className: string;
}

export default function ShareClassWidget({
  classCode,
  className,
}: ShareClassWidgetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(classCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = classCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#F0E7DA]">
      <h3 className="text-sm font-extrabold text-[#3B2416] mb-1">
        Partager une classe
      </h3>
      <p className="text-[11px] text-[#7A6A5E] font-medium mb-4">
        Partagez ce code avec vos élèves
      </p>

      {/* QR Code */}
      <div className="flex justify-center mb-4">
        <div className="bg-white p-3 rounded-xl border-2 border-[#F0E7DA]">
          <QRCodeSVG
            value={`https://petitbaobab.com/join/${classCode}`}
            size={120}
            bgColor="#FFFFFF"
            fgColor="#3B2416"
            level="M"
          />
        </div>
      </div>

      {/* Code display */}
      <div className="bg-[#F5F0EB] rounded-xl px-4 py-3 text-center mb-4">
        <p className="text-xl font-black text-[#3B2416] tracking-wider font-mono">
          {classCode}
        </p>
      </div>

      <p className="text-[11px] text-[#7A6A5E] text-center mb-4 font-medium">
        Scannez ce QR Code ou copiez le code ci-dessous.
      </p>

      {/* Action buttons */}
      <div className="space-y-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl hover:bg-[#F5F0EB] transition-colors text-left cursor-pointer"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-[#7A6A5E]" />
          )}
          <span className="text-sm font-medium text-[#3B2416]">
            {copied ? "Copié !" : "Copier le code"}
          </span>
        </button>
        <button className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl hover:bg-[#F5F0EB] transition-colors text-left cursor-pointer">
          <Printer className="w-4 h-4 text-[#7A6A5E]" />
          <span className="text-sm font-medium text-[#3B2416]">Imprimer</span>
        </button>
        <button className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl hover:bg-[#F5F0EB] transition-colors text-left cursor-pointer">
          <Share2 className="w-4 h-4 text-[#7A6A5E]" />
          <span className="text-sm font-medium text-[#3B2416]">Partager</span>
        </button>
      </div>
    </div>
  );
}
