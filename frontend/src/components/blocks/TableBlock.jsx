import React from "react";

export default function TableBlock({ block }) {
  if (!block) return null;
  const headers  = Array.isArray(block.headers) ? block.headers : [];
  const rows     = Array.isArray(block.rows)    ? block.rows    : [];
  const caption  = block.caption  || "";
  const striped  = block.striped  !== false;
  const bordered = block.bordered !== false;

  if (headers.length === 0 && rows.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 rounded-[var(--radius-md)] border border-dashed border-[var(--line)] text-[var(--muted)] text-xs font-medium">
        Empty comparison table.
      </div>
    );
  }

  const cellBorder = bordered ? "border border-[var(--line)]" : "";

  return (
    <div className="my-5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] overflow-hidden shadow-[var(--shadow-sm)]">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs sm:text-sm leading-normal text-[var(--ink)]">
          {headers.length > 0 && (
            <thead className="bg-[var(--surface-2)]">
              <tr>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    className={`px-4 py-2.5 text-left font-serif font-bold text-xs uppercase tracking-wider text-[var(--ink)] whitespace-nowrap ${cellBorder}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className={`transition-colors hover:bg-[var(--surface-2)] ${striped && ri % 2 === 0 ? "bg-[var(--surface)]" : striped ? "bg-[var(--surface-2)]/50" : "bg-[var(--surface)]"}`}
              >
                {(Array.isArray(row) ? row : []).map((cell, ci) => (
                  <td key={ci} className={`px-4 py-2.5 align-top ${cellBorder} text-[var(--ink-2)] font-sans`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && (
        <p className="p-2 text-xs text-[var(--muted)] text-center italic border-t border-[var(--line)]">{caption}</p>
      )}
    </div>
  );
}
