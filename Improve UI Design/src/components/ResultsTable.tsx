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
  if (val >= 90) return "#22c55e";
  if (val >= 70) return "#eab308";
  return "#ef4444";
}

function confTextStyle(val: number): CSSProperties {
  if (val >= 90) return { color: "#4ade80" };
  if (val >= 70) return { color: "#facc15" };
  return { color: "#f87171" };
}

function lowConfRowStyle(conf: number): CSSProperties | undefined {
  if (conf > 0 && conf < 70) return { backgroundColor: "rgba(239, 68, 68, 0.05)" };
  return undefined;
}

interface CatStyle { bg: CSSProperties; pill: CSSProperties }

const CATEGORY_STYLES: Record<string, CatStyle> = {
  "Food Quality/Portion":                    { bg: { backgroundColor: "rgba(249,115,22,0.12)" }, pill: { color: "#fb923c", borderColor: "rgba(249,115,22,0.3)", backgroundColor: "rgba(249,115,22,0.12)" } },
  "Food Safety":                             { bg: { backgroundColor: "rgba(239,68,68,0.12)" },  pill: { color: "#f87171", borderColor: "rgba(239,68,68,0.3)",  backgroundColor: "rgba(239,68,68,0.12)" } },
  "Catering Error - Missing/Incorrect Meals":{ bg: { backgroundColor: "rgba(168,85,247,0.12)" }, pill: { color: "#c084fc", borderColor: "rgba(168,85,247,0.3)", backgroundColor: "rgba(168,85,247,0.12)" } },
  "Missing Meals - Crew Error":              { bg: { backgroundColor: "rgba(59,130,246,0.12)" },  pill: { color: "#60a5fa", borderColor: "rgba(59,130,246,0.3)",  backgroundColor: "rgba(59,130,246,0.12)" } },
  "Missing Meals - Pwa":                     { bg: { backgroundColor: "rgba(6,182,212,0.12)" },   pill: { color: "#22d3ee", borderColor: "rgba(6,182,212,0.3)",   backgroundColor: "rgba(6,182,212,0.12)" } },
  "Missing Meals - Ifx Error":               { bg: { backgroundColor: "rgba(20,184,166,0.12)" },  pill: { color: "#2dd4bf", borderColor: "rgba(20,184,166,0.3)",  backgroundColor: "rgba(20,184,166,0.12)" } },
  "Missing Meals - Ferry/Deadhead/Swaps":    { bg: { backgroundColor: "rgba(99,102,241,0.12)" },  pill: { color: "#818cf8", borderColor: "rgba(99,102,241,0.3)",  backgroundColor: "rgba(99,102,241,0.12)" } },
  "Missing Meals - Redeye No Touch":         { bg: { backgroundColor: "rgba(139,92,246,0.12)" },  pill: { color: "#a78bfa", borderColor: "rgba(139,92,246,0.3)",  backgroundColor: "rgba(139,92,246,0.12)" } },
  "Missing Provisioning - T2":               { bg: { backgroundColor: "rgba(236,72,153,0.12)" },  pill: { color: "#f472b6", borderColor: "rgba(236,72,153,0.3)",  backgroundColor: "rgba(236,72,153,0.12)" } },
  "Meal Choice Unavailable":                 { bg: { backgroundColor: "rgba(245,158,11,0.12)" },  pill: { color: "#fbbf24", borderColor: "rgba(245,158,11,0.3)",  backgroundColor: "rgba(245,158,11,0.12)" } },
  "Ground Catering Issue":                   { bg: { backgroundColor: "rgba(132,204,22,0.12)" },  pill: { color: "#a3e635", borderColor: "rgba(132,204,22,0.3)",  backgroundColor: "rgba(132,204,22,0.12)" } },
  "Equipment":                               { bg: { backgroundColor: "rgba(148,163,184,0.12)" }, pill: { color: "#94a3b8", borderColor: "rgba(148,163,184,0.3)", backgroundColor: "rgba(148,163,184,0.12)" } },
  "Provisioning":                            { bg: { backgroundColor: "rgba(52,211,153,0.12)" },  pill: { color: "#34d399", borderColor: "rgba(52,211,153,0.3)",  backgroundColor: "rgba(52,211,153,0.12)" } },
  "Other":                                   { bg: { backgroundColor: "rgba(161,161,170,0.12)" }, pill: { color: "#a1a1aa", borderColor: "rgba(161,161,170,0.3)", backgroundColor: "rgba(161,161,170,0.12)" } },
};
const DEFAULT_CAT_STYLE: CatStyle = {
  bg:   { backgroundColor: "rgba(161,161,170,0.12)" },
  pill: { color: "#a1a1aa", borderColor: "rgba(161,161,170,0.3)", backgroundColor: "rgba(161,161,170,0.12)" },
};

function getCatStyle(name: string): CatStyle {
  return CATEGORY_STYLES[name] || DEFAULT_CAT_STYLE;
}

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
    if (col === "Predicted_Subcategory") return "Predicted Category";
    if (col === "Subcategory_Confidence") return "Confidence";
    return col;
  };

  return (
    <div className="mt-6 rounded-lg overflow-hidden" style={{ backgroundColor: "#181818" }}>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Classification Results</h3>
            <p className="text-sm mt-0.5" style={{ color: "#b3b3b3" }}>
              {filtered.length} of {results.length} rows
              {categoryFilter && <> &middot; Filtered by: <strong style={{ color: "#ffffff" }}>{categoryFilter}</strong></>}
            </p>
          </div>
        </div>

        {/* Category distribution strip */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {categoryFilter && (
            <button
              onClick={() => { setCategoryFilter(null); setPage(0); }}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors"
              style={{
                color: "#b3b3b3",
                border: "1px dashed #404040",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#282828"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              Clear filter
            </button>
          )}
          {categoryStats.map(({ name, count }) => {
            const cs = getCatStyle(name);
            const isActive = categoryFilter === name;
            return (
              <button
                key={name}
                onClick={() => { setCategoryFilter(categoryFilter === name ? null : name); setPage(0); }}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border transition-colors"
                style={{
                  ...cs.pill,
                  outline: isActive ? "2px solid #1DB954" : "none",
                  outlineOffset: "1px",
                }}
              >
                <span>{name}</span>
                <span style={{ opacity: 0.7 }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#b3b3b3" }} />
          <input
            type="text"
            placeholder="Search text, category, or confidence..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm"
            style={{
              backgroundColor: "#282828",
              color: "#ffffff",
              border: "1px solid #404040",
              outline: "none",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#1DB954"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#404040"; }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="px-6 pb-6">
        <div className="overflow-x-auto rounded-lg" style={{ border: "1px solid #282828" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#282828" }}>
                <th className="px-4 py-3 text-left text-xs font-medium w-10" style={{ color: "#b3b3b3" }}>#</th>
                {displayCols.map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-medium" style={{ color: "#b3b3b3" }}>
                    <button
                      className="flex items-center gap-1 transition-colors"
                      style={{ color: "#b3b3b3" }}
                      onClick={() => handleSort(col)}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "#b3b3b3"; }}
                    >
                      {colLabel(col)}
                      <ArrowUpDown className="w-3 h-3" />
                      {sortField === col && (
                        <span style={{ color: "#1DB954" }}>{sortAsc ? "\u2191" : "\u2193"}</span>
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
                      borderTop: "1px solid #282828",
                      ...lowConfRowStyle(conf),
                    }}
                    onMouseEnter={(e) => {
                      if (!lowConfRowStyle(conf)) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)";
                    }}
                    onMouseLeave={(e) => {
                      if (!lowConfRowStyle(conf)) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <td className="px-4 py-2.5 text-xs" style={{ color: "#b3b3b3" }}>
                      {page * PAGE_SIZE + idx + 1}
                    </td>
                    {displayCols.map((col) => {
                      const val = row[col] ?? "";

                      if (col === "Subcategory_Confidence") {
                        if (!val) {
                          return (
                            <td key={col} className="px-4 py-2.5">
                              <span className="text-xs" style={{ color: "#b3b3b3" }}>--</span>
                            </td>
                          );
                        }
                        const numVal = parseConf(val);
                        return (
                          <td key={col} className="px-4 py-2.5">
                            <div className="flex items-center gap-2" style={{ minWidth: 140 }}>
                              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${Math.min(numVal, 100)}%`, backgroundColor: confBarColor(numVal) }}
                                />
                              </div>
                              <span
                                className="text-xs font-semibold"
                                style={{ ...confTextStyle(numVal), fontVariantNumeric: "tabular-nums" }}
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
                              <span className="text-xs" style={{ color: "#b3b3b3" }}>--</span>
                            </td>
                          );
                        }
                        const cs = getCatStyle(val);
                        return (
                          <td key={col} className="px-4 py-2.5">
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border"
                              style={cs.pill}
                            >
                              {val}
                            </span>
                          </td>
                        );
                      }

                      const text = String(val);
                      return (
                        <td key={col} className="px-4 py-2.5 max-w-lg">
                          <span className="text-sm leading-relaxed text-white" title={text}>
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
            <span className="text-xs" style={{ color: "#b3b3b3" }}>
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-md transition-colors disabled:opacity-30"
                style={{ backgroundColor: "#282828", color: "#ffffff" }}
                onMouseEnter={(e) => { if (page > 0) e.currentTarget.style.backgroundColor = "#404040"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#282828"; }}
              >
                <ChevronLeft className="w-4 h-4" />
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
                    className="w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: isActive ? "#1DB954" : "#282828",
                      color: isActive ? "#000000" : "#ffffff",
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "#404040"; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = isActive ? "#1DB954" : "#282828"; }}
                  >
                    {p + 1}
                  </button>
                );
              })}
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-md transition-colors disabled:opacity-30"
                style={{ backgroundColor: "#282828", color: "#ffffff" }}
                onMouseEnter={(e) => { if (page < totalPages - 1) e.currentTarget.style.backgroundColor = "#404040"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#282828"; }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
