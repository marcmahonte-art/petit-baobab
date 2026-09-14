"use client";

import React from "react";
import { MemoryBookRecord } from "../../types/memory-book.types";
import { getTemplateComponent } from "./templates/template-registry";

interface BookPrintProps {
  book: MemoryBookRecord;
}

export const BookPrint: React.FC<BookPrintProps> = ({ book }) => {
  const pages = book.pages_data || [];

  return (
    <div className="w-full bg-[#FFFDF8] print:bg-[#FFFDF8]">
      {pages.map((page, idx) => {
        const TemplateComponent = getTemplateComponent(page.templateId);
        return (
          <div
            key={page.id || idx}
            className="print-page relative w-[210mm] h-[297mm] overflow-hidden bg-[#FFFDF8] p-0 m-0 box-border"
            style={{
              pageBreakAfter: idx === pages.length - 1 ? "auto" : "always",
              breakAfter: idx === pages.length - 1 ? "auto" : "page",
            }}
          >
            <div className="w-full h-full relative">
              <TemplateComponent page={page} isReadOnly={true} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
