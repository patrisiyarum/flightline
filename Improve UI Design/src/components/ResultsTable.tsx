import { useState, useMemo, CSSProperties } from "react";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

interface ResultsTableProps {
  results: any[];
}

const PAGE_SIZE = 15;

function parseConf(raw: string | number): number {
  const val = typeof raw === "string" ? parseFloat(raw.replace("%", "")) : raw;
  return isNaN(val) ? 0 : val;
}

function confBarColor(val: number): string {
  if (val >= 90) return "#2d8a4e";
  if (val >= 70) return "#b8860b";
  return "#8B6B6B";
}

function confTextStyle(val: number): CSSProperties {
  if (val >= 90) return { color: "#2d8a4e" };
  if (val >= 70) return { color: "#b8860b" };
  return { color: "#8B6B6B" };
}

function lowConfRowStyle(conf: number): CSSProperties | undefined {
  if (conf > 0 && conf < 70) return { backgroundColor: "rgba(139, 107, 107, 0.06)" };
  return undefined;
}

// Monochrome category style — all categories use same bordered tag style
const MONO_PILL_STYLE: CSSProperties = {
  color: "#6b6b6b",
  borderColor: "#2a2a2a",
  backgroundColor: "transparent",
  border: "1px solid #2a2a2a",
  fontSize: 10,
  fontWeight: 400,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  fontFamily: "'Space Grotesk', sans-serif",
};

export function ResultsTable({ results }: ResultsTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<string>("Subcategory_Confidence");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const textCol = useMemo(() => {
    if (!results.length) return null;
    const keys = Object.keys(results[0]);
    const KEYWORDS = ["text", "comment", "comments", "feedback", "review", "pilot", "questions"];
    return keys.find(k => KEYWORDS.some(kw => k.toLowerCase().includes(kw))) || null;
  }, [results]);

  const displayCols = useMemo(() => {
    const cols: string[] = [];
    if (textCol) cols.push(textCol);
    if (results.length > 0) {
      if ("Predicted_Subcategory" in results[0]) cols.push("Predicted_Subcategory");
      if ("Subcategory_Confidence" in results[0]) cols.push("Subcategory_Confidence");
    }
    return cols;
  }, [results, textCol]);

  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    results.forEach(row => {
      const cat = row["Predicted_Subcategory"] || "Unknown";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, pct: ((count / results.length) * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count);
  }, [results]);

  const filtered = useMemo(() => {
    let data = results;
    if (categoryFilter) data = data.filter(row => row["Predicted_Subcategory"] === categoryFilter);
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(row =>
      displayCols.some(col => String(row[col] || "").toLowerCase().includes(q))
    );
  }, [results, search, displayCols, categoryFilter]);

  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    return [...filtered].sort((a, b) => {
      let aVal: any = a[sortField] ?? "";
      let bVal: any = b[sortField] ?? "";
      if (sortField === "Subcategory_Confidence") {
        aVal = parseConf(aVal); bVal = parseConf(bVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") return sortAsc ? aVal - bVal : bVal - aVal;
      return sortAsc ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });
  }, [filtered, sortField, sortAsc]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageData = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSort = (field: string) => {
    if (sortField === field) { setSortAsc(!sortAsc); }
    else { setSortField(field); setSortAsc(false); }
    setPage(0);
  };

  if (!results.length) return null;

  const colLabel = (col: string) => {
    if (col === "Predicted_Subcategory") return "PREDICTED CATEGORY";
    if (col === "Subcategory_Confidence") return "CONFIDENCE";
    return col.toUpperCase();
  };

  return (
    <div className="overflow-hidden" style={{ backgroundColor: "#161616" }}>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 400, color: "#ffffff", letterSpacing: "0.08em", textTransform: "uppercase" }}>CLASSIFICATION RESULTS</h3>
            <p style={{ fontSize: 11, color: "#6b6b6b", marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
              {filtered.length} of {results.length} rows
              {categoryFilter && <> &middot; Filtered by: <strong style={{ color: "#ffffff" }}>{categoryFilter}</strong></>}
            </p>
          </div>
        </div>

        {/* Category distribution strip */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {categoryFilter && (
            <button
              onClick={() => { setCategoryFilter(null); setPage(0); }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs transition-colors"
              style={{
                color: "#6b6b6b",
                border: "1px dashed #2a2a2a",
                backgroundColor: "transparent",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontSize: 10,
                fontWeight: 400,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1e1e1e"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              CLEAR FILTER
            </button>
          )}
          {categoryStats.map(({ name, count }) => {
            const isActive = categoryFilter === name;
            return (
              <button
                key={name}
                onClick={() => { setCategoryFilter(categoryFilter === name ? null : name); setPage(0); }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 transition-colors"
                style={{
                  ...MONO_PILL_STYLE,
                  outline: isActive ? "1px solid #ffffff" : "none",
                  outlineOffset: "1px",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6b6b6b"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; }}
              >
                <span>{name}</span>
                <span style={{ opacity: 0.5, fontFamily: "'JetBrains Mono', monospace" }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#6b6b6b" }} strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search text, category, or confidence..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-9 pr-4 py-2.5 text-sm"
            style={{
              backgroundColor: "#1a1a1a",
              color: "#ffffff",
              border: "1px solid #2a2a2a",
              borderRadius: 0,
              outline: "none",
              fontWeight: 300,
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#6b6b6b"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="px-6 pb-6">
        <div className="overflow-x-auto" style={{ border: "1px solid #2a2a2a" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#1a1a1a" }}>
                <th
                  className="px-4 py-3 text-left w-10"
                  style={{ color: "#6b6b6b", fontSize: 10, fontWeight: 400, letterSpacing: "0.08em" }}
                >
                  #
                </th>
                {displayCols.map((col) => (
                  <th key={col} className="px-4 py-3 text-left" style={{ color: "#6b6b6b", fontSize: 10, fontWeight: 400, letterSpacing: "0.08em" }}>
                    <button
                      className="flex items-center gap-1 transition-colors"
                      style={{ color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 10, fontWeight: 400 }}
                      onClick={() => handleSort(col)}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "#6b6b6b"; }}
                    >
                      {colLabel(col)}
                      <ArrowUpDown className="w-3 h-3" strokeWidth={1.5} />
                      {sortField === col && (
                        <span style={{ color: "#ffffff" }}>{sortAsc ? "\u2191" : "\u2193"}</span>
                      )}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.map((row, idx) => {
                const conf = parseConf(row["Subcategory_Confidence"] ?? 0);
                return (
                  <tr
                    key={idx}
                    className="transition-colors"
                    style={{
                      borderTop: "1px solid #2a2a2a",
                      ...lowConfRowStyle(conf),
                    }}
                    onMouseEnter={(e) => {
                      if (!lowConfRowStyle(conf)) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)";
                    }}
                    onMouseLeave={(e) => {
                      if (!lowConfRowStyle(conf)) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <td className="px-4 py-2.5" style={{ color: "#6b6b6b", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                      {page * PAGE_SIZE + idx + 1}
                    </td>
                    {displayCols.map((col) => {
                      const val = row[col] ?? "";

                      if (col === "Subcategory_Confidence") {
                        if (!val) {
                          return (
                            <td key={col} className="px-4 py-2.5">
                              <span style={{ color: "#6b6b6b", fontSize: 11 }}>--</span>
                            </td>
                          );
                        }
                        const numVal = parseConf(val);
                        return (
                          <td key={col} className="px-4 py-2.5">
                            <div className="flex items-center gap-2" style={{ minWidth: 140 }}>
                              <div className="flex-1 overflow-hidden" style={{ height: 3, backgroundColor: "rgba(255,255,255,0.06)" }}>
                                <div
                                  className="transition-all"
                                  style={{ width: `${Math.min(numVal, 100)}%`, height: "100%", backgroundColor: confBarColor(numVal) }}
                                />
                              </div>
                              <span
                                style={{
                                  ...confTextStyle(numVal),
                                  fontFamily: "'JetBrains Mono', monospace",
                                  fontSize: 12,
                                  fontWeight: 400,
                                  minWidth: 48,
                                  textAlign: "right",
                                }}
                              >
                                {typeof val === "string" ? val : `${numVal.toFixed(1)}%`}
                              </span>
                            </div>
                          </td>
                        );
                      }

                      if (col === "Predicted_Subcategory") {
                        if (!val) {
                          return (
                            <td key={col} className="px-4 py-2.5">
                              <span style={{ color: "#6b6b6b", fontSize: 11 }}>--</span>
                            </td>
                          );
                        }
                        return (
                          <td key={col} className="px-4 py-2.5">
                            <span
                              className="inline-flex items-center px-2.5 py-0.5"
                              style={MONO_PILL_STYLE}
                            >
                              {val}
                            </span>
                          </td>
                        );
                      }

                      const text = String(val);
                      return (
                        <td key={col} className="px-4 py-2.5 max-w-lg">
                          <span style={{ fontSize: 13, lineHeight: 1.5, color: "#ffffff", fontWeight: 300 }} title={text}>
                            {text.length > 150 ? text.substring(0, 150) + "..." : text}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <span style={{ fontSize: 11, color: "#6b6b6b", fontFamily: "'JetBrains Mono', monospace" }}>
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-30"
                style={{ backgroundColor: "#2a2a2a", color: "#ffffff" }}
                onMouseEnter={(e) => { if (page > 0) e.currentTarget.style.backgroundColor = "#383838"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#2a2a2a"; }}
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                const p = start + i;
                if (p >= totalPages) return null;
                const isActive = p === page;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="w-8 h-8 flex items-center justify-center text-xs transition-colors"
                    style={{
                      backgroundColor: isActive ? "#ffffff" : "#2a2a2a",
                      color: isActive ? "#0D0D0D" : "#ffffff",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 400,
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "#383838"; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = isActive ? "#ffffff" : "#2a2a2a"; }}
                  >
                    {p + 1}
                  </button>
                );
              })}
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-30"
                style={{ backgroundColor: "#2a2a2a", color: "#ffffff" }}
                onMouseEnter={(e) => { if (page < totalPages - 1) e.currentTarget.style.backgroundColor = "#383838"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#2a2a2a"; }}
              >
                <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
