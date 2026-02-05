import { useState } from "react";
import { Upload, Download, CheckCircle2, FileUp } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface BulkUploadProps {
  onPredict: (text: string) => Promise<{ subPredictions: any[] }>;
  onUploadComplete: (results: any[], file: File, processingTimeSec: number) => void;
}

const COLUMN_KEYWORDS = [
  "text", "comment", "comments", "feedback", "review",
  "pilot's questions/answers", "pilots questions/answers",
  "pilot's questions", "questions/answers"
];

export function BulkUpload({ onPredict, onUploadComplete }: BulkUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[] | null>(null);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [stitchCount, setStitchCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState<number | null>(null);

  const cleanValue = (val: any) => {
    if (typeof val === 'number') {
      if (!Number.isInteger(val)) return parseFloat(val.toFixed(2));
      return val;
    }
    if (typeof val === 'string') {
      let cleaned = val
        .replace(/_x005F_x000D_/gi, "\n")
        .replace(/_x000D_/gi, "\n")
        .replace(/_x000d_/gi, "\n")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .trim();
      const isPureNumber = /^-?\d+(\.\d+)?$/.test(cleaned);
      if (isPureNumber) {
        const num = parseFloat(cleaned);
        if (cleaned.includes(".")) return parseFloat(num.toFixed(2));
        return num;
      }
      return cleaned;
    }
    return val;
  };

  const parseExcel = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          let foundSheetData: any[] = [];
          let foundHeaderRow = 0;
          let sheetFound = false;
          for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
            const rowIndex = rawData.slice(0, 20).findIndex(row =>
              row && row.some(cell =>
                typeof cell === 'string' &&
                COLUMN_KEYWORDS.some(k => cell.toLowerCase().trim().includes(k))
              )
            );
            if (rowIndex !== -1) {
              foundHeaderRow = rowIndex;
              foundSheetData = XLSX.utils.sheet_to_json(sheet, {
                defval: "", range: foundHeaderRow, raw: false, dateNF: 'mm/dd/yyyy'
              });
              sheetFound = true;
              break;
            }
          }
          if (!sheetFound) {
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            foundSheetData = XLSX.utils.sheet_to_json(firstSheet, { defval: "", raw: false, dateNF: 'mm/dd/yyyy' });
          }
          resolve(foundSheetData);
        } catch (error) { reject(error); }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  };

  const parseCSV = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true, skipEmptyLines: "greedy",
        complete: (results) => resolve(results.data as any[]),
        error: (error) => reject(error),
      });
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setResults(null);
      setProgress(0);
      setStitchCount(0);
      try {
        let data: any[] = [];
        if (uploadedFile.name.endsWith(".xlsx") || uploadedFile.name.endsWith(".xls")) {
          data = await parseExcel(uploadedFile);
        } else {
          data = await parseCSV(uploadedFile);
        }
        if (!Array.isArray(data)) throw new Error("Parsed data is not an array");
        const cleanedPreview = data.slice(0, 5).map(row => {
          const newRow: any = {};
          Object.keys(row).forEach(k => newRow[k] = cleanValue(row[k]));
          return newRow;
        });
        setPreviewData(cleanedPreview);
      } catch (error) {
        alert("Failed to read file. Please ensure it is a valid CSV or Excel file.");
      }
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    setStitchCount(0);
    setElapsedTime(null);
    const startTime = performance.now();
    try {
      let rawData: any[] = [];
      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        rawData = await parseExcel(file);
      } else {
        rawData = await parseCSV(file);
      }
      if (!rawData || rawData.length === 0) {
        alert("File appears to be empty.");
        setProcessing(false);
        return;
      }
      const originalHeaders = Object.keys(rawData[0]);
      const textCol = originalHeaders.find((h) => {
        const headerLower = h.toLowerCase().trim();
        return COLUMN_KEYWORDS.some((keyword) => headerLower.includes(keyword));
      });
      if (!textCol) {
        alert("Could not find a valid text column.");
        setProcessing(false);
        return;
      }
      const cleanData: any[] = [];
      let lastValidRow: any = null;
      let stitched = 0;
      const keyCol1 = originalHeaders[0];
      for (const row of rawData) {
        const cleanedRow: any = {};
        Object.keys(row).forEach(key => { cleanedRow[key] = cleanValue(row[key]); });
        const firstVal = cleanedRow[keyCol1];
        if (firstVal !== undefined && firstVal !== "") {
          cleanData.push(cleanedRow);
          lastValidRow = cleanedRow;
        } else if (lastValidRow && !file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
          const fragment = Object.values(cleanedRow).filter(v => v).join(" ");
          if (fragment) { lastValidRow[textCol] += "\n" + fragment; stitched++; }
        } else {
          if (cleanedRow[textCol]) cleanData.push(cleanedRow);
        }
      }
      setStitchCount(stitched);
      const finalHeaders = [...originalHeaders, "Predicted_Subcategory", "Subcategory_Confidence"];
      setColumns(finalHeaders);
      const processedResults = [];
      for (let i = 0; i < cleanData.length; i++) {
        const row = cleanData[i];
        const commentText = row[textCol]?.toString().trim() || "";
        if (!commentText) {
          processedResults.push({ ...row, Predicted_Subcategory: "No Text", Subcategory_Confidence: "0%" });
          continue;
        }
        try {
          const { subPredictions } = await onPredict(commentText);
          processedResults.push({
            ...row,
            Predicted_Subcategory: subPredictions[0]?.label || "Unknown",
            Subcategory_Confidence: subPredictions[0]?.probability ? `${subPredictions[0].probability.toFixed(2)}%` : "0%",
          });
        } catch (err) {
          processedResults.push({ ...row, Predicted_Subcategory: "Error", Subcategory_Confidence: "0%" });
        }
        setProgress(((i + 1) / cleanData.length) * 100);
        if (i % 5 === 0) await new Promise((resolve) => setTimeout(resolve, 10));
      }
      const endTime = performance.now();
      const timeSec = parseFloat(((endTime - startTime) / 1000).toFixed(1));
      setElapsedTime(timeSec);
      setResults(processedResults);
      onUploadComplete(processedResults, file!, timeSec);
    } catch (err) {
      alert("An error occurred during processing.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!results || results.length === 0) return;
    try {
      const workbook = XLSX.utils.book_new();
      
      // Get original columns (excluding our added prediction columns)
      const allCols = Object.keys(results[0]);
      const originalCols = allCols.filter(c => c !== "Predicted_Subcategory" && c !== "Subcategory_Confidence");
      
      // Rename prediction columns with markers for visibility
      const renamedResults = results.map(row => {
        const newRow: any = {};
        originalCols.forEach(col => { newRow[col] = row[col]; });
        newRow["★ Predicted Subcategory"] = row["Predicted_Subcategory"];
        newRow["★ Confidence"] = row["Subcategory_Confidence"];
        return newRow;
      });
      
      const orderedCols = [...originalCols, "★ Predicted Subcategory", "★ Confidence"];
      
      // Create worksheet with proper column order
      const worksheet = XLSX.utils.json_to_sheet(renamedResults, { header: orderedCols });
      
      // Set column widths - wider for prediction columns and text columns
      const colWidths = orderedCols.map((col) => {
        if (col.startsWith("★")) return { wch: 28 };
        if (col.toLowerCase().includes("question") || col.toLowerCase().includes("comment") || col.toLowerCase().includes("text") || col.toLowerCase().includes("feedback")) return { wch: 60 };
        return { wch: 15 };
      });
      worksheet["!cols"] = colWidths;
      
      XLSX.utils.book_append_sheet(workbook, worksheet, "Categorized Feedback");
      XLSX.writeFile(workbook, "categorized_feedback.xlsx");
    } catch (err) {
      alert("Failed to generate Excel file.");
    }
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Drop zone */}
      <div
        className="text-center transition-all"
        style={{
          border: "1px dashed #333333",
          backgroundColor: "#0f0f0f",
          cursor: "pointer",
          padding: "48px 40px",
          borderRadius: 10,
        }}
        onMouseEnter={(e) => { 
          e.currentTarget.style.borderColor = "#555555"; 
          e.currentTarget.style.backgroundColor = "#141414";
        }}
        onMouseLeave={(e) => { 
          e.currentTarget.style.borderColor = "#333333"; 
          e.currentTarget.style.backgroundColor = "#0f0f0f";
        }}
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <Upload className="w-8 h-8 mx-auto mb-4" style={{ color: "#555555" }} strokeWidth={1.5} />
        <p style={{ color: "#cccccc", fontWeight: 400, fontSize: 14, marginBottom: 6 }}>
          {file ? file.name : "Click to upload or drag and drop"}
        </p>
        <p style={{ color: "#666666", fontSize: 12, fontWeight: 300 }}>
          CSV or Excel (.csv, .xlsx, .xls)
        </p>
        <input
          type="file"
          accept=".csv, .xlsx, .xls"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
      </div>

      {/* Preview */}
      {previewData && !results && (
        <div style={{ marginTop: 24 }}>
          <div
            className="flex items-center gap-3 mb-5"
            style={{ padding: "14px 18px", backgroundColor: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 8 }}
          >
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: "#4ade80" }} strokeWidth={1.5} />
            <span style={{ fontSize: 13, color: "#4ade80", fontWeight: 400 }}>
              File ready — {previewData.length} rows preview (showing first 4 columns)
            </span>
          </div>

          <div className="overflow-x-auto" style={{ border: "1px solid #222222", borderRadius: 8, overflow: "hidden" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#1a1a1a" }}>
                  {(() => {
                    const allKeys = Object.keys(previewData[0]);
                    const firstKeys = allKeys.slice(0, 4);
                    return firstKeys.map((header, idx) => (
                      <th
                        key={idx}
                        className="px-4 py-3 text-left whitespace-nowrap"
                        style={{ color: "#666666", fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}
                      >
                        {header}
                      </th>
                    ));
                  })()}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, idx) => {
                  const allKeys = Object.keys(row);
                  const firstKeys = allKeys.slice(0, 4);
                  return (
                    <tr key={idx} style={{ borderTop: "1px solid #1f1f1f" }}>
                      {firstKeys.map((key, cellIdx) => (
                        <td
                          key={cellIdx}
                          className="px-4 py-2.5"
                          style={{ color: "#cccccc", fontWeight: 300, fontSize: 13, maxWidth: 300 }}
                        >
                          {String(row[key]).length > 80
                            ? String(row[key]).substring(0, 80) + "..."
                            : row[key]}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!results && (
            <button
              onClick={handleProcess}
              disabled={processing}
              className="mt-6 w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "#ffffff",
                color: "#0a0a0a",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 600,
                fontSize: 14,
                padding: "18px 24px",
                borderRadius: 8,
              }}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#f0f0f0"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
            >
              {processing ? "Processing..." : "Start Prediction"}
            </button>
          )}
        </div>
      )}

      {/* Progress bar */}
      {processing && (
        <div style={{ marginTop: 24 }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 11, color: "#666666", letterSpacing: "0.08em", textTransform: "uppercase" }}>Processing</span>
            <span style={{ fontSize: 13, color: "#cccccc", fontFamily: "'JetBrains Mono', monospace" }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="overflow-hidden" style={{ height: 4, backgroundColor: "#1a1a1a", borderRadius: 2 }}>
            <div
              className="transition-all"
              style={{ width: `${progress}%`, height: "100%", backgroundColor: "#ffffff", borderRadius: 2 }}
            />
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div style={{ marginTop: 24 }}>
          <div
            className="flex items-center gap-3 mb-5"
            style={{ padding: "14px 18px", backgroundColor: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 8 }}
          >
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: "#4ade80" }} strokeWidth={1.5} />
            <span style={{ fontSize: 13, color: "#4ade80", fontWeight: 400 }}>
              {results.length} rows categorized
              {elapsedTime !== null && ` in ${elapsedTime}s`}
              {stitchCount > 0 && ` — repaired ${stitchCount} broken rows`}
            </span>
          </div>
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm transition-colors"
            style={{
              backgroundColor: "#ffffff",
              color: "#0a0a0a",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 500,
              fontSize: 12,
              borderRadius: 8,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#eeeeee"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
          >
            <Download className="h-4 w-4" strokeWidth={1.5} /> Download Results
          </button>
        </div>
      )}
    </div>
  );
}
