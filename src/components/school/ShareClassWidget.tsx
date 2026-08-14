"use client";
import React, { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Printer, Share2, Check, Mail, MessageCircle } from "lucide-react";

interface ShareClassWidgetProps {
  classCode: string;
  className: string;
}

const JOIN_URL = "https://www.monpetitbaobab.com/school";

export default function ShareClassWidget({
  classCode,
  className,
}: ShareClassWidgetProps) {
  const [copied, setCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(classCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Code de classe - ${className}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
            h1 { font-size: 24px; margin-bottom: 8px; }
            .code { font-size: 48px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; color: #3B2416; }
            .url { font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <h1>${className}</h1>
          <p>Code de la classe :</p>
          <div class="code">${classCode}</div>
          <p class="url">${JOIN_URL}</p>
          <p>Demandez à vos élèves de saisir ce code sur Petit Baobab.</p>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleShare = (method: "mail" | "whatsapp") => {
    const subject = encodeURIComponent(`Code de la classe ${className}`);
    const body = encodeURIComponent(
      `Bonjour,\n\nVoici le code pour rejoindre la classe ${className} sur Petit Baobab :\n\nCode : ${classCode}\nLien : ${JOIN_URL}\n\nDemandez aux élèves de saisir ce code sur ${JOIN_URL} pour se connecter.\n\nMerci !`
    );
    if (method === "mail") {
      window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
    } else {
      window.open(`https://wa.me/?text=${body}`, "_blank");
    }
    setShowShareOptions(false);
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
      <div ref={printRef} className="flex justify-center mb-4">
        <div className="bg-white p-3 rounded-xl border-2 border-[#F0E7DA]">
          <QRCodeSVG
            value={`${JOIN_URL}?code=${classCode}`}
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
        <button
          onClick={handlePrint}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl hover:bg-[#F5F0EB] transition-colors text-left cursor-pointer"
        >
          <Printer className="w-4 h-4 text-[#7A6A5E]" />
          <span className="text-sm font-medium text-[#3B2416]">Imprimer</span>
        </button>

        {/* Partager with sub-options */}
        <div className="relative">
          <button
            onClick={() => setShowShareOptions(!showShareOptions)}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl hover:bg-[#F5F0EB] transition-colors text-left cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-[#7A6A5E]" />
            <span className="text-sm font-medium text-[#3B2416]">Partager</span>
          </button>
          {showShareOptions && (
            <div className="absolute left-0 right-0 top-0 z-10 bg-white rounded-xl border border-[#F0E7DA] shadow-lg p-1.5 space-y-0.5">
              <button
                onClick={() => handleShare("mail")}
                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg hover:bg-[#F5F0EB] transition-colors text-left cursor-pointer"
              >
                <Mail className="w-4 h-4 text-[#7A6A5E]" />
                <span className="text-sm font-medium text-[#3B2416]">Partager par e-mail</span>
              </button>
              <button
                onClick={() => handleShare("whatsapp")}
                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg hover:bg-[#F5F0EB] transition-colors text-left cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span className="text-sm font-medium text-[#3B2416]">Partager sur WhatsApp</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
