import { useState, useRef } from "react";
import { UploadCloud, FileText } from "lucide-react";
import Papa from "papaparse";

interface BulkUploadProps {
  onPredict: (text: string) => Promise<any>;
  onUploadComplete: (results: any[], file: File, processingTime: number) => void;
}

export function BulkUpload({ onPredict, onUploadComplete }: BulkUploadProps) {
  const [parsedPreview, setParsedPreview] = useState<Record<string, string>[] | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCurrentFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as Record<string, string>[];
          const cols = Object.keys(data[0] || {});
          setParsedPreview(data);
          setHeaders(cols);
          setCurrentFileName(file.name);
        },
      });
    };
    reader.readAsText(file);
  };

  const handleStartPrediction = async () => {
    if (!parsedPreview || !currentFile) return;
    
    setIsProcessing(true);
    const startTime = performance.now();
    
    try {
      // Find the comment column
      const commentKey = headers.find(h => 
        h.toLowerCase().includes("comment") || 
        h.toLowerCase().includes("question") || 
        h.toLowerCase().includes("answer") ||
        h.toLowerCase().includes("feedback")
      ) || headers[0];

      const results = [];
      for (const row of parsedPreview) {
        const text = row[commentKey] || "";
        if (text.trim()) {
          const prediction = await onPredict(text);
          results.push({
            ...row,
            Predicted_Subcategory: prediction.subPredictions?.[0]?.label || "Unknown",
            Subcategory_Confidence: `${((prediction.subPredictions?.[0]?.confidence || 0) * 100).toFixed(1)}%`,
          });
        } else {
          results.push({
            ...row,
            Predicted_Subcategory: "No text",
            Subcategory_Confidence: "0%",
          });
        }
      }
      
      const endTime = performance.now();
      const processingTime = (endTime - startTime) / 1000;
      
      onUploadComplete(results, currentFile, processingTime);
    } catch (err) {
      console.error("Prediction failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const displayHeaders = headers.slice(0, 4);

  return (
    <div style={{ width: "100%" }}>
      {/* Upload area */}
      <div
        style={{
          backgroundColor: "#212121",
          border: "1px solid #3e3e3e",
          borderRadius: 12,
          padding: "40px",
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
        
        <UploadCloud className="mx-auto mb-4" style={{ width: 40, height: 40, color: "#6e6e6e" }} strokeWidth={1.5} />
        
        <p style={{ fontSize: 15, color: "#ececec", marginBottom: 8 }}>
          Drop your CSV file here
        </p>
        <p style={{ fontSize: 13, color: "#6e6e6e", marginBottom: 20 }}>
          or click to browse
        </p>

        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            backgroundColor: "#ececec",
            color: "#171717",
            border: "none",
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: 500,
            borderRadius: 20,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#d4d4d4"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ececec"; }}
        >
          Choose file
        </button>
      </div>

      {/* Preview */}
      {parsedPreview && parsedPreview.length > 0 && (
        <div
          style={{
            backgroundColor: "#212121",
            border: "1px solid #3e3e3e",
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: "1px solid #3e3e3e",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <FileText className="w-4 h-4" style={{ color: "#8e8e8e" }} />
              <span style={{ fontSize: 14, color: "#ececec" }}>{currentFileName}</span>
              <span style={{ fontSize: 13, color: "#6e6e6e" }}>
                {parsedPreview.length} rows
              </span>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: "#1a1a1a" }}>
                  {displayHeaders.map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: 500,
                        color: "#9b9b9b",
                        borderBottom: "1px solid #3e3e3e",
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedPreview.slice(0, 5).map((row, idx) => (
                  <tr key={idx}>
                    {displayHeaders.map((col) => (
                      <td
                        key={col}
                        style={{
                          padding: "12px 16px",
                          color: "#ececec",
                          borderBottom: "1px solid #2f2f2f",
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {headers.length > 4 && (
            <div style={{ padding: "12px 16px", fontSize: 12, color: "#6e6e6e", borderTop: "1px solid #2f2f2f" }}>
              Showing first 4 columns • {parsedPreview.length > 5 ? `5 of ${parsedPreview.length} rows` : "All rows shown"}
            </div>
          )}

          {/* Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "16px 20px",
              borderTop: "1px solid #3e3e3e",
              backgroundColor: "#1a1a1a",
            }}
          >
            <button
              onClick={handleStartPrediction}
              disabled={isProcessing}
              style={{
                backgroundColor: isProcessing ? "#2f2f2f" : "#10a37f",
                color: isProcessing ? "#6e6e6e" : "#ffffff",
                border: "none",
                padding: "10px 20px",
                fontSize: 14,
                fontWeight: 500,
                borderRadius: 20,
                cursor: isProcessing ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {isProcessing ? "Processing..." : "Start prediction"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
