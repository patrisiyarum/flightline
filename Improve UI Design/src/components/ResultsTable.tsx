import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

interface ResultsTableProps {
  results: any[];
}

const PAGE_SIZE = 15;

function confidenceColor(raw: string | number): string {
  const val = typeof raw === "string" ? parseFloat(raw.replace("%", "")) : raw;
  if (isNaN(val)) return "text-muted-foreground";
  if (val >= 90) return "text-green-500";
  if (val >= 70) return "text-yellow-500";
  return "text-red-500";
}

function confidenceBadge(raw: string | number) {
  const val = typeof raw === "string" ? parseFloat(raw.replace("%", "")) : raw;
  if (isNaN(val)) return "secondary";
  if (val >= 90) return "default" as const;
  if (val >= 70) return "secondary" as const;
  return "destructive" as const;
}

export function ResultsTable({ results }: ResultsTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<string>("Subcategory_Confidence");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(0);

  // Identify the text column
  const textCol = useMemo(() => {
    if (!results.length) return null;
    const keys = Object.keys(results[0]);
    const KEYWORDS = ["text", "comment", "comments", "feedback", "review", "pilot", "questions"];
    return keys.find(k => KEYWORDS.some(kw => k.toLowerCase().includes(kw))) || null;
  }, [results]);

  // Columns to show: text col, predicted subcategory, confidence
  const displayCols = useMemo(() => {
    const cols: string[] = [];
    if (textCol) cols.push(textCol);
    if (results.length > 0) {
      if ("Predicted_Subcategory" in results[0]) cols.push("Predicted_Subcategory");
      if ("Subcategory_Confidence" in results[0]) cols.push("Subcategory_Confidence");
    }
    return cols;
  }, [results, textCol]);

  // Filter
  const filtered = useMemo(() => {
    if (!search.trim()) return results;
    const q = search.toLowerCase();
    return results.filter(row =>
      displayCols.some(col => String(row[col] || "").toLowerCase().includes(q))
    );
  }, [results, search, displayCols]);

  // Sort
  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    return [...filtered].sort((a, b) => {
      let aVal = a[sortField] ?? "";
      let bVal = b[sortField] ?? "";
      // Parse confidence as number for sorting
      if (sortField === "Subcategory_Confidence") {
        aVal = parseFloat(String(aVal).replace("%", "")) || 0;
        bVal = parseFloat(String(bVal).replace("%", "")) || 0;
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
            <CardDescription>{filtered.length} of {results.length} rows shown</CardDescription>
          </div>
        </div>
        {/* Search */}
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search results..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-9 pr-4 py-2 rounded-md border border-border bg-background text-foreground text-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground w-10">#</th>
                {displayCols.map((col) => (
                  <th key={col} className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
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
              {pageData.map((row, idx) => (
                <tr key={idx} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2 text-muted-foreground text-xs">
                    {page * PAGE_SIZE + idx + 1}
                  </td>
                  {displayCols.map((col) => {
                    const val = row[col] ?? "";
                    if (col === "Subcategory_Confidence") {
                      return (
                        <td key={col} className="px-4 py-2">
                          {val ? (
                            <Badge variant={confidenceBadge(val)} className={confidenceColor(val)}>
                              {val}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">--</span>
                          )}
                        </td>
                      );
                    }
                    if (col === "Predicted_Subcategory") {
                      return (
                        <td key={col} className="px-4 py-2 font-medium whitespace-nowrap">
                          {val || <span className="text-muted-foreground text-xs">--</span>}
                        </td>
                      );
                    }
                    // Text column — truncate
                    const text = String(val);
                    return (
                      <td key={col} className="px-4 py-2 max-w-md">
                        <span title={text}>
                          {text.length > 120 ? text.substring(0, 120) + "..." : text}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
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
