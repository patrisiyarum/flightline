import { useState, useMemo, CSSProperties } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

interface ResultsTableProps {
  results: any[];
}

const PAGE_SIZE = 15;

function parseConf(raw: string | number): number {
  const val = typeof raw === "string" ? parseFloat(raw.replace("%", "")) : raw;
  return isNaN(val) ? 0 : val;
}

// Inline styles so colors survive Tailwind purging
function confBarColor(val: number): string {
  if (val >= 90) return "#22c55e"; // green-500
  if (val >= 70) return "#eab308"; // yellow-500
  return "#ef4444"; // red-500
}

function confTextStyle(val: number): CSSProperties {
  if (val >= 90) return { color: "#4ade80" }; // green-400
  if (val >= 70) return { color: "#facc15" }; // yellow-400
  return { color: "#f87171" }; // red-400
}

function lowConfRowStyle(conf: number): CSSProperties | undefined {
  if (conf > 0 && conf < 70) return { backgroundColor: "rgba(239, 68, 68, 0.05)" };
  return undefined;
}

// Category colors as inline styles
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

  // Identify the text column
  const textCol = useMemo(() => {
    if (!results.length) return null;
    const keys = Object.keys(results[0]);
    const KEYWORDS = ["text", "comment", "comments", "feedback", "review", "pilot", "questions"];
    return keys.find(k => KEYWORDS.some(kw => k.toLowerCase().includes(kw))) || null;
  }, [results]);

  // Columns to show
  const displayCols = useMemo(() => {
    const cols: string[] = [];
    if (textCol) cols.push(textCol);
    if (results.length > 0) {
      if ("Predicted_Subcategory" in results[0]) cols.push("Predicted_Subcategory");
      if ("Subcategory_Confidence" in results[0]) cols.push("Subcategory_Confidence");
    }
    return cols;
  }, [results, textCol]);

  // Category distribution for the summary strip
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

  // Filter by search + category
  const filtered = useMemo(() => {
    let data = results;
    if (categoryFilter) {
      data = data.filter(row => row["Predicted_Subcategory"] === categoryFilter);
    }
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(row =>
      displayCols.some(col => String(row[col] || "").toLowerCase().includes(q))
    );
  }, [results, search, displayCols, categoryFilter]);

  // Sort
  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    return [...filtered].sort((a, b) => {
      let aVal: any = a[sortField] ?? "";
      let bVal: any = b[sortField] ?? "";
      if (sortField === "Subcategory_Confidence") {
        aVal = parseConf(aVal);
        bVal = parseConf(bVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
      return sortAsc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filtered, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageData = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
    setPage(0);
  };

  if (!results.length) return null;

  const colLabel = (col: string) => {
    if (col === "Predicted_Subcategory") return "Predicted Category";
    if (col === "Subcategory_Confidence") return "Confidence";
    return col;
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Classification Results</CardTitle>
            <CardDescription>
              {filtered.length} of {results.length} rows
              {categoryFilter && <> &middot; Filtered by: <strong>{categoryFilter}</strong></>}
            </CardDescription>
          </div>
        </div>

        {/* Category distribution strip */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {categoryFilter && (
            <button
              onClick={() => { setCategoryFilter(null); setPage(0); }}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border border-dashed text-muted-foreground hover:bg-muted/50 transition-colors"
              style={{ borderColor: "rgba(161,161,170,0.4)" }}
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
                  outline: isActive ? "2px solid hsl(var(--primary))" : "none",
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search text, category, or confidence..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-9 pr-4 py-2 rounded-md border border-border bg-background text-foreground text-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-10">#</th>
                {displayCols.map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    <button
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                      onClick={() => handleSort(col)}
                    >
                      {colLabel(col)}
                      <ArrowUpDown className="w-3 h-3" />
                      {sortField === col && (
                        <span className="text-primary">{sortAsc ? "\u2191" : "\u2193"}</span>
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
                    className="border-t border-border transition-colors hover:bg-muted/30"
                    style={lowConfRowStyle(conf)}
                  >
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">
                      {page * PAGE_SIZE + idx + 1}
                    </td>
                    {displayCols.map((col) => {
                      const val = row[col] ?? "";

                      // --- Confidence column: progress bar + colored number ---
                      if (col === "Subcategory_Confidence") {
                        if (!val) {
                          return (
                            <td key={col} className="px-4 py-2.5">
                              <span className="text-muted-foreground text-xs">--</span>
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
                                  style={{
                                    width: `${Math.min(numVal, 100)}%`,
                                    backgroundColor: confBarColor(numVal),
                                  }}
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

                      // --- Category column: colored pill ---
                      if (col === "Predicted_Subcategory") {
                        if (!val) {
                          return (
                            <td key={col} className="px-4 py-2.5">
                              <span className="text-muted-foreground text-xs">--</span>
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

                      // --- Text column ---
                      const text = String(val);
                      return (
                        <td key={col} className="px-4 py-2.5 max-w-lg">
                          <span className="text-sm leading-relaxed" title={text}>
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
            <span className="text-xs text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                const p = start + i;
                if (p >= totalPages) return null;
                return (
                  <Button
                    key={p}
                    size="sm"
                    variant={p === page ? "default" : "outline"}
                    onClick={() => setPage(p)}
                    className="w-8 h-8 p-0"
                  >
                    {p + 1}
                  </Button>
                );
              })}
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
