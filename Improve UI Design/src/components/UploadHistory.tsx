import { FileText, Download } from "lucide-react";
import * as XLSX from "xlsx";

interface UploadHistoryProps {
  onSelectHistory: (fileName: string) => void;
  selectedFile: string;
}

interface RecentUpload {
  name: string;
  date: number;
  rowCount: number;
}

function getRecentUploads(): RecentUpload[] {
  try {
    const data = localStorage.getItem("recentUploads");
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function downloadOriginal(fileName: string) {
  const data = localStorage.getItem(`upload_${fileName}_original`);
  if (!data) return;
  
  const parsed = JSON.parse(data);
  const ws = XLSX.utils.json_to_sheet(parsed);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Original Data");
  
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  XLSX.writeFile(wb, `${baseName}_original.xlsx`);
}

export function UploadHistory({ onSelectHistory, selectedFile }: UploadHistoryProps) {
  const recentUploads = getRecentUploads();

  if (recentUploads.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {recentUploads.slice(0, 5).map((item) => {
        const isSelected = selectedFile === item.name;
        return (
          <div
            key={item.name}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: isSelected ? "#2f2f2f" : "#212121",
              border: `1px solid ${isSelected ? "#4e4e4e" : "#3e3e3e"}`,
              borderRadius: 8,
              padding: "12px 16px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onClick={() => onSelectHistory(item.name)}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = "#2f2f2f";
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = "#212121";
              }
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <FileText className="w-4 h-4" style={{ color: "#8e8e8e" }} />
              <div>
                <div style={{ fontSize: 14, color: "#ececec" }}>{item.name}</div>
                <div style={{ fontSize: 12, color: "#6e6e6e" }}>
                  {item.rowCount} rows • {formatDate(item.date)}
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadOriginal(item.name);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "none",
                border: "none",
                padding: "4px 8px",
                cursor: "pointer",
                color: "#8e8e8e",
                fontSize: 12,
                borderRadius: 4,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#ececec"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#8e8e8e"; }}
            >
              <Download className="w-3 h-3" />
              Original
            </button>
          </div>
        );
      })}
    </div>
  );
}
