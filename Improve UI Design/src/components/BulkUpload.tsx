import { useState, useEffect, useRef } from "react";
import { UploadCloud, ChevronRight, ChevronDown, FileText, Clock } from "lucide-react";
import { UploadHistory } from "./UploadHistory";
import Papa from "papaparse";

interface BulkUploadProps {
  onUpload: (data: Record<string, string>[], fileName: string) => void;
  isProcessing: boolean;
  processedData: Record<string, string>[] | null;
  onNavigateToResults: () => void;
  hasData: boolean;
  selectedFile: string;
  processingTime?: number | null;
  onSelectHistoryItem: (fileName: string) => void;
}

function getRecentUploads(): { name: string; date: number; rowCount: number }[] {
  try {
    const data = localStorage.getItem("recentUploads");
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function BulkUpload({
  onUpload,
  isProcessing,
  processedData,
  onNavigateToResults,
  hasData,
  selectedFile,
  processingTime,
  onSelectHistoryItem,
}: BulkUploadProps) {
  const [parsedPreview, setParsedPreview] = useState<Record<string, string>[] | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [recentUploads] = useState<{ name: string; date: number; rowCount: number }[]>(getRecentUploads());
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (selectedFile && selectedFile !== currentFileName) {
      const data = localStorage.getItem(`upload_${selectedFile}_original`);
      if (data) {
        const parsed = JSON.parse(data);
        setParsedPreview(parsed);
        setHeaders(Object.keys(parsed[0] || {}));
        setCurrentFileName(selectedFile);
      }
    }
  }, [selectedFile, currentFileName]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
          localStorage.setItem(`upload_${file.name}_original`, JSON.stringify(data));
        },
      });
    };
    reader.readAsText(file);
  };

  const handleStartPrediction = () => {
    if (parsedPreview && currentFileName) {
      onUpload(parsedPreview, currentFileName);
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

            {processingTime && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Clock className="w-3 h-3" style={{ color: "#8e8e8e" }} />
                <span style={{ fontSize: 12, color: "#8e8e8e", letterSpacing: "0.02em" }}>
                  {processingTime.toFixed(1)}s
                </span>
              </div>
            )}
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
            {!hasData && (
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
            )}

            {hasData && (
              <button
                onClick={onNavigateToResults}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: "transparent",
                  color: "#10a37f",
                  border: "none",
                  padding: 0,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                View results
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Recent uploads */}
      {recentUploads.length > 0 && (
        <div>
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: "#8e8e8e",
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            {isHistoryOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            Recent uploads
          </button>

          {isHistoryOpen && (
            <UploadHistory onSelectHistory={onSelectHistoryItem} selectedFile={selectedFile} />
          )}
        </div>
      )}
    </div>
  );
}
