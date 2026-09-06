"use client";

import React from "react";
import { TextElementData } from "../../types/memory-book.types";

interface TextSlotProps {
  textData?: TextElementData;
  title?: string;
  elementId: string;
  onUpdate: (value: string) => void;
  isReadOnly?: boolean;
}

export const TextSlot: React.FC<TextSlotProps> = ({
  textData,
  title,
  elementId,
  onUpdate,
  isReadOnly = false,
}) => {
  const value = textData?.value || "";
  const placeholder = textData?.placeholder || "Écris ici...";
  const maxLength = textData?.maxLength || 150;
  const multiline = textData?.multiline || false;
  const minRows = textData?.minRows || 2;
  const align = textData?.align || "left";
  const isHandwriting = textData?.fontStyle === "handwriting";

  const fontClasses = isHandwriting
    ? "font-serif italic tracking-wide text-purple-950"
    : "font-sans text-gray-900";

  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[align];

  return (
    <div className="w-full flex flex-col gap-1.5 my-1">
      {title && (
        <label
          htmlFor={elementId}
          className="font-bold text-gray-800 text-sm md:text-base flex items-center justify-between"
        >
          <span>{title}</span>
          {!isReadOnly && maxLength && (
            <span className="text-[11px] font-medium text-gray-400">
              {value.length}/{maxLength}
            </span>
          )}
        </label>
      )}

      {multiline ? (
        <textarea
          id={elementId}
          disabled={isReadOnly}
          rows={minRows}
          maxLength={maxLength}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onUpdate(e.target.value)}
          className={`w-full p-3 md:p-3.5 rounded-xl border-2 border-purple-200/80 bg-white/90 focus:bg-white focus:border-purple-500 focus:ring-3 focus:ring-purple-200/50 outline-none transition-all shadow-xs resize-none text-sm md:text-base leading-relaxed ${fontClasses} ${alignClasses} disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-700`}
        />
      ) : (
        <input
          id={elementId}
          type="text"
          disabled={isReadOnly}
          maxLength={maxLength}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onUpdate(e.target.value)}
          className={`w-full px-3.5 py-2.5 md:py-3 rounded-xl border-2 border-purple-200/80 bg-white/90 focus:bg-white focus:border-purple-500 focus:ring-3 focus:ring-purple-200/50 outline-none transition-all shadow-xs text-sm md:text-base font-semibold ${fontClasses} ${alignClasses} disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-700`}
        />
      )}
    </div>
  );
};
