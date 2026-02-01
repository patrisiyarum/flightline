import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Filter } from "lucide-react";

interface ResultsTableProps {
  results: any[];
}

const PAGE_SIZE = 15;

function parseConf(raw: string | number): number {
  const val = typeof raw === "string" ? parseFloat(raw.replace("%", "")) : raw;
  return isNaN(val) ? 0 : val;
}

// Explicit colors that work in dark mode
function confStyle(val: number): { bg: string; text: string; bar: string } {
  if (val >= 90) return { bg: "bg-green-500/15", text: "text-green-400", bar: "bg-green-500" };
  if (val >= 70) return { bg: "bg-yellow-500/15", text: "text-yellow-400", bar: "bg-yellow-500" };
  return { bg: "bg-red-500/15", text: "text-red-400", bar: "bg-red-500" };
}

// Category color palette for pills
const CATEGORY_COLORS: Record<string, string> = {
  "Food Quality/Portion": "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "Food Safety": "bg-red-500/15 text-red-400 border-red-500/30",
  "Catering Error - Missing/Incorrect Meals": "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "Missing Meals - Crew Error": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Missing Meals - Pwa": "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  "Missing Meals - Ifx Error": "bg-teal-500/15 text-teal-400 border-teal-500/30",
  "Missing Meals - Ferry/Deadhead/Swaps": "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  "Missing Meals - Redeye No Touch": "bg-violet-500/15 text-violet-400 border-violet-500/30",
  "Missing Provisioning - T2": "bg-pink-500/15 text-pink-400 border-pink-500/30",
  "Meal Choice Unavailable": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Ground Catering Issue": "bg-lime-500/15 text-lime-400 border-lime-500/30",
  "Equipment": "bg-slate-500/15 text-slate-400 border-slate-500/30",
  "Provisioning": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Other": "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};
const DEFAULT_CAT_COLOR = "bg-zinc-500/15 text-zinc-400 border-zinc-500/30";

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
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border border-dashed border-muted-foreground/40 text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              Clear filter
            </button>
          )}
          {categoryStats.map(({ name, count, pct }) => (
            <button
              key={name}
              onClick={() => { setCategoryFilter(categoryFilter === name ? null : name); setPage(0); }}
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border transition-colors ${
                categoryFilter === name
                  ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                  : ""
              } ${CATEGORY_COLORS[name] || DEFAULT_CAT_COLOR}`}
            >
              <span className="font-medium">{name}</span>
              <span className="opacity-70">{count}</span>
            </button>
          ))}
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
                const isLowConf = conf > 0 && conf < 70;
                return (
                  <tr
                    key={idx}
                    className={`border-t border-border transition-colors ${
                      isLowConf
                        ? "bg-red-500/5 hover:bg-red-500/10"
                        : "hover:bg-muted/30"
                    }`}
                  >
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">
                      {page * PAGE_SIZE + idx + 1}
                    </td>
                    {displayCols.map((col) => {
                      const val = row[col] ?? "";

                      // --- Confidence column: colored pill with progress bar ---
                      if (col === "Subcategory_Confidence") {
                        if (!val) {
                          return (
                            <td key={col} className="px-4 py-2.5">
                              <span className="text-muted-foreground text-xs">--</span>
                            </td>
                          );
                        }
                        const numVal = parseConf(val);
                        const style = confStyle(numVal);
                        return (
                          <td key={col} className="px-4 py-2.5">
                            <div className="flex items-center gap-2 min-w-[140px]">
                              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${style.bar}`}
                                  style={{ width: `${Math.min(numVal, 100)}%` }}
                                />
                              </div>
                              <span className={`text-xs font-semibold tabular-nums ${style.text}`}>
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
                        const catColor = CATEGORY_COLORS[val] || DEFAULT_CAT_COLOR;
                        return (
                          <td key={col} className="px-4 py-2.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${catColor}`}>
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
              {/* Page number buttons */}
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
