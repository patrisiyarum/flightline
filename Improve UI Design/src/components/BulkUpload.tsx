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
    <div style={{ backgroundColor: "#161616", borderTop: "1px solid #2a2a2a", width: "100%" }}>
      {/* Drop zone */}
      <div
        className="text-center transition-colors"
        style={{
          border: "2px dashed #2a2a2a",
          backgroundColor: "#0D0D0D",
          cursor: "pointer",
          padding: "60px 40px",
        }}
        onMouseEnter={(e) => { 
          e.currentTarget.style.borderColor = "#7C9CBF"; 
          e.currentTarget.style.backgroundColor = "#111111";
        }}
        onMouseLeave={(e) => { 
          e.currentTarget.style.borderColor = "#2a2a2a"; 
          e.currentTarget.style.backgroundColor = "#0D0D0D";
        }}
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <Upload className="w-10 h-10 mx-auto mb-5" style={{ color: "#6b6b6b" }} strokeWidth={1} />
        <p style={{ color: "#ffffff", fontWeight: 400, fontSize: 16, marginBottom: 8 }}>
          {file ? file.name : "Click to upload or drag and drop"}
        </p>
        <p style={{ color: "#6b6b6b", fontSize: 13, fontWeight: 300 }}>
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
        <div style={{ marginTop: 32, padding: "0 24px 24px" }}>
          <div
            className="flex items-center gap-3 mb-6"
            style={{ padding: "16px 20px", backgroundColor: "rgba(45,138,78,0.08)", border: "1px solid rgba(45,138,78,0.2)" }}
          >
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" style={{ color: "#2d8a4e" }} strokeWidth={1.5} />
            <span style={{ fontSize: 14, color: "#2d8a4e" }}>
              File ready! Preview of first 5 rows shown below.
            </span>
          </div>

          <div className="overflow-x-auto" style={{ border: "1px solid #2a2a2a" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#1a1a1a" }}>
                  {Object.keys(previewData[0]).map((header, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-2.5 text-left whitespace-nowrap"
                      style={{ color: "#6b6b6b", fontSize: 10, fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase" }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, idx) => (
                  <tr key={idx} style={{ borderTop: "1px solid #2a2a2a" }}>
                    {Object.values(row).map((value: any, cellIdx) => (
                      <td
                        key={cellIdx}
                        className="px-4 py-2 whitespace-nowrap"
                        style={{ color: "#ffffff", fontWeight: 300 }}
                      >
                        {String(value).length > 50
                          ? String(value).substring(0, 50) + "..."
                          : value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!results && (
            <button
              onClick={handleProcess}
              disabled={processing}
              className="mt-8 w-full py-4 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "#ffffff",
                color: "#0D0D0D",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 400,
                fontSize: 13,
              }}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#e5e5e5"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
            >
              {processing ? "PROCESSING..." : "START PREDICTION"}
            </button>
          )}
        </div>
      )}

      {/* Progress bar */}
      {processing && (
        <div style={{ marginTop: 32, padding: "0 24px 24px" }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 11, color: "#6b6b6b", letterSpacing: "0.08em", textTransform: "uppercase" }}>PROCESSING...</span>
            <span style={{ fontSize: 14, color: "#ffffff", fontFamily: "'JetBrains Mono', monospace" }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="overflow-hidden" style={{ height: 4, backgroundColor: "#2a2a2a" }}>
            <div
              className="transition-all"
              style={{ width: `${progress}%`, height: "100%", backgroundColor: "#7C9CBF" }}
            />
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div style={{ marginTop: 32, padding: "0 24px 24px" }}>
          <div
            className="flex items-center gap-3 mb-6"
            style={{ padding: "16px 20px", backgroundColor: "rgba(45,138,78,0.08)", border: "1px solid rgba(45,138,78,0.2)" }}
          >
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" style={{ color: "#2d8a4e" }} strokeWidth={1.5} />
            <span style={{ fontSize: 14, color: "#2d8a4e" }}>
              Success! {results.length} rows categorized
              {elapsedTime !== null && ` in ${elapsedTime}s`}.
              {stitchCount > 0 && ` (Repaired ${stitchCount} broken text rows automatically)`}
            </span>
          </div>
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-3 py-4 text-sm transition-colors"
            style={{
              backgroundColor: "#ffffff",
              color: "#0D0D0D",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 400,
              fontSize: 13,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#e5e5e5"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
          >
            <Download className="h-5 w-5" strokeWidth={1.5} /> DOWNLOAD RESULTS
          </button>
        </div>
      )}
    </div>
  );
}
