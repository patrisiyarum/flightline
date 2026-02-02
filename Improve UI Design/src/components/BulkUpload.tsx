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
      const worksheet = XLSX.utils.json_to_sheet(results, { header: columns });
      XLSX.utils.book_append_sheet(workbook, worksheet, "Categorized Feedback");
      XLSX.writeFile(workbook, "categorized_feedback.xlsx");
    } catch (err) {
      alert("Failed to generate Excel file.");
    }
  };

  return (
    <div className="rounded-lg p-6" style={{ backgroundColor: "#161616" }}>
      <h3 className="mb-5 font-semibold text-white">Bulk Upload Prediction</h3>

      {/* Drop zone */}
      <div
        className="rounded-lg p-10 text-center transition-colors"
        style={{
          border: "2px dashed #383838",
          backgroundColor: "#0D0D0D",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C8102E"; e.currentTarget.style.backgroundColor = "rgba(200,16,46,0.03)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#383838"; e.currentTarget.style.backgroundColor = "#0D0D0D"; }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "rgba(200,16,46,0.1)" }}
        >
          <Upload className="w-6 h-6" style={{ color: "#C8102E" }} />
        </div>
        <p className="font-medium text-white mb-1">Drag and drop your file here</p>
        <p className="text-sm mb-5" style={{ color: "#A0A0A0" }}>
          CSV or Excel with a Pilot's Questions/Answers column
        </p>
        <input
          type="file"
          accept=".csv, .xlsx, .xls"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <span
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold cursor-pointer transition-all hover:scale-105"
            style={{ backgroundColor: "#C8102E", color: "#ffffff" }}
          >
            <FileUp className="w-4 h-4" />
            Browse Files
          </span>
        </label>
        <p className="mt-2 text-xs" style={{ color: "#525252" }}>
          Supports .csv, .xlsx, .xls
        </p>
        {file && (
          <div
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
            style={{ backgroundColor: "#252525", color: "#ffffff" }}
          >
            <FileUp className="w-3.5 h-3.5" style={{ color: "#C8102E" }} />
            {file.name}
          </div>
        )}
      </div>

      {/* Preview */}
      {previewData && (
        <div className="mt-6">
          <div
            className="flex items-center gap-2 p-3 rounded-lg mb-4"
            style={{ backgroundColor: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
          >
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: "#22C55E" }} />
            <span className="text-sm" style={{ color: "#22C55E" }}>
              File ready! Preview of first 5 rows shown below.
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg" style={{ border: "1px solid #252525" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#252525" }}>
                  {Object.keys(previewData[0]).map((header, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-2.5 text-left whitespace-nowrap font-medium"
                      style={{ color: "#A0A0A0" }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, idx) => (
                  <tr key={idx} style={{ borderTop: "1px solid #252525" }}>
                    {Object.values(row).map((value: any, cellIdx) => (
                      <td
                        key={cellIdx}
                        className="px-4 py-2 whitespace-nowrap text-white"
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

          <button
            onClick={handleProcess}
            disabled={processing}
            className="mt-5 w-full py-3 rounded-full text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#C8102E", color: "#ffffff" }}
          >
            {processing ? "Processing..." : "Start Prediction"}
          </button>
        </div>
      )}

      {/* Progress bar */}
      {processing && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: "#A0A0A0" }}>Processing...</span>
            <span className="text-sm font-medium text-white">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#383838" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: "#C8102E" }}
            />
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="mt-6">
          <div
            className="flex items-center gap-2 p-3 rounded-lg mb-4"
            style={{ backgroundColor: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
          >
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: "#22C55E" }} />
            <span className="text-sm" style={{ color: "#22C55E" }}>
              Success! {results.length} rows categorized
              {elapsedTime !== null && ` in ${elapsedTime}s`}.
              {stitchCount > 0 && ` (Repaired ${stitchCount} broken text rows automatically)`}
            </span>
          </div>
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-all hover:scale-[1.02]"
            style={{ backgroundColor: "#0032A0", color: "#ffffff" }}
          >
            <Download className="h-4 w-4" /> Download Updated Excel (.xlsx)
          </button>
        </div>
      )}
    </div>
  );
}
