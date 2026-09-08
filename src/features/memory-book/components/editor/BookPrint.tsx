import React from "react";
import { MemoryBookRecord } from "../../types/memory-book.types";

interface BookPrintProps {
  book: MemoryBookRecord;
}

export const BookPrint: React.FC<BookPrintProps> = ({ book }) => {
  const pages = book.pages_data || [];

  return (
    <div className="w-full bg-[#FFF9F2]">
      {pages.map((page, idx) => (
        <div key={page.id} className="print-page">
          <div className="print-page-header">
            <span>{page.categoryTag || "Souvenirs"}</span>
            <span>Page {page.pageNumber} / {pages.length}</span>
          </div>

          {page.pageNumber === 1 ? (
            <div className="print-cover">
              <div className="print-cover-circle">
                <span className="print-cover-title">
                  {book.title}
                </span>
              </div>
              {page.elements.map((el) =>
                el.type === "text" ? (
                  <div key={el.id} className="print-element-text">
                    {el.textData?.value}
                  </div>
                ) : null
              )}
            </div>
          ) : (
            <>
              <div className="print-page-title">{page.title}</div>
              {page.subtitle && (
                <div className="print-page-subtitle">{page.subtitle}</div>
              )}
              <div>
                {page.elements.map((el) => {
                  if (el.type === "photo") {
                    return el.photoData?.url ? (
                      <div key={el.id} className="print-element-photo">
                        <img
                          src={el.photoData.url}
                          alt={el.title || "Photo"}
                          style={{
                            transform: `scale(${el.photoData.zoom || 1}) rotate(${el.photoData.rotation || 0}deg)`,
                          }}
                        />
                      </div>
                    ) : (
                      <div key={el.id} className="print-element-photo">
                        Photo vide — {el.title}
                      </div>
                    );
                  }
                  if (el.type === "text") {
                    return (
                      <div key={el.id} className="print-element-text">
                        {el.textData?.value}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </>
          )}

          <div className="print-footer">
            <span>Petit Baobab — Mon Cahier de Souvenirs</span>
            <span>— {page.pageNumber} —</span>
          </div>
        </div>
      ))}
    </div>
  );
};
