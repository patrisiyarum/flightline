import { FileText } from "lucide-react";

export interface UploadSummary {
  id: number;
  file_name: string;
  created_at: string;
  row_count: number;
}

interface UploadHistoryProps {
  uploads: UploadSummary[];
  currentUploadId: number | null;
  onSelectUpload: (uploadId: number) => void;
  loading?: boolean;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function UploadHistory({ uploads, currentUploadId, onSelectUpload, loading }: UploadHistoryProps) {
  if (uploads.length === 0) return null;

  return (
    <div style={{ marginTop: 32 }}>
      <p style={{ fontSize: 12, color: "#6e6e6e", marginBottom: 12, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        Recent uploads
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {uploads.slice(0, 5).map((item) => {
          const isSelected = currentUploadId === item.id;
          return (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: isSelected ? "#2f2f2f" : "#212121",
                border: `1px solid ${isSelected ? "#4e4e4e" : "#3e3e3e"}`,
                borderRadius: 8,
                padding: "12px 16px",
                cursor: loading ? "wait" : "pointer",
                transition: "all 0.15s ease",
                opacity: loading ? 0.6 : 1,
              }}
              onClick={() => !loading && onSelectUpload(item.id)}
              onMouseEnter={(e) => {
                if (!isSelected && !loading) {
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
                  <div style={{ fontSize: 14, color: "#ececec" }}>{item.file_name}</div>
                  <div style={{ fontSize: 12, color: "#6e6e6e" }}>
                    {item.row_count} rows • {formatDate(item.created_at)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
