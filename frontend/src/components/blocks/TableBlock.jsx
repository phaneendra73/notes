import React from "react";

/**
 * TableBlock — renders a structured data table.
 *
 * Block schema:
 *   { type: "table", caption, headers: string[], rows: string[][], striped, bordered }
 */
export default function TableBlock({ block }) {
  if (!block) return null;
  const headers  = Array.isArray(block.headers) ? block.headers : [];
  const rows     = Array.isArray(block.rows)    ? block.rows    : [];
  const caption  = block.caption  || "";
  const striped  = block.striped  !== false;
  const bordered = block.bordered !== false;

  if (headers.length === 0 && rows.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 rounded-xl border-2 border-dashed border-border text-muted-foreground text-sm">
        Empty table — add headers and rows.
      </div>
    );
  }

  const cellBorder = bordered ? "border border-border" : "";

  return (
    <div className="my-5 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm leading-normal text-foreground bg-card">
          {headers.length > 0 && (
            <thead className="bg-muted">
              <tr>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    className={`px-4 py-2.5 text-left font-heading font-semibold text-[0.8rem] uppercase tracking-wide whitespace-nowrap ${cellBorder}`}
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
                className={`transition-colors hover:bg-accent/60 ${striped && ri % 2 === 0 ? "bg-card" : striped ? "bg-muted/50" : "bg-card"}`}
              >
                {(Array.isArray(row) ? row : []).map((cell, ci) => (
                  <td key={ci} className={`px-4 py-2 align-top ${cellBorder}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && (
        <p className="mt-2 text-[0.8rem] text-muted-foreground text-center italic">{caption}</p>
      )}
    </div>
  );
}
