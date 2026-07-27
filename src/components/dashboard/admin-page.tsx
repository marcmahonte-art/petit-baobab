import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function AdminPage({
  title,
  description,
  note,
  children,
}: {
  title: string;
  description?: string;
  note?: string;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold">{title}</h1>
        {description && (
          <p className="text-sm text-[#3B2416]/70 mt-1">{description}</p>
        )}
      </div>
      {children}
      {note && (
        <div className="bg-white/60 border border-dashed border-[#F1ECE5] rounded-[20px] p-6 text-sm text-[#3B2416]/60">
          {note}
        </div>
      )}
    </div>
  );
}

export interface AdminRow {
  cells: ReactNode[];
}

// Tableau modulaire réutilisable pour tous les modules admin.
// rows = [{ cells: [<td>...] }]
export function AdminTable({
  columns,
  rows,
  empty = "Aucune donnée.",
}: {
  columns: string[];
  rows: AdminRow[];
  empty?: string;
}) {
  return (
    <div className="bg-white rounded-[20px] border border-[#F1ECE5] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#FFF9F2] text-left text-xs uppercase font-bold text-[#3B2416]/60">
              {columns.map((c) => (
                <th key={c} className="px-4 py-3 whitespace-nowrap">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-[#3B2416]/50">
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i} className="border-t border-[#F1ECE5] hover:bg-[#FFF9F2]/50">
                  {row.cells.map((cell, j) => (
                    <td key={j} className="px-4 py-3 whitespace-nowrap">{cell}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
