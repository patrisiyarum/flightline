import { Download, History, Loader2 } from "lucide-react";

const API_URL = "https://feedback-webapp-5zc2.onrender.com";

export interface UploadSummary {
  id: number;
  created_at: string;
  file_name: string;
  row_count: number;
}

interface UploadHistoryProps {
  uploads: UploadSummary[];
  currentUploadId: number | null;
  onSelectUpload: (uploadId: number) => void;
  loading: boolean;
}

export function UploadHistory({ uploads, currentUploadId, onSelectUpload, loading }: UploadHistoryProps) {
  if (uploads.length === 0 && !loading) return null;

  return (
    <div className="p-5" style={{ borderTop: "1px solid #1e1e1e" }}>
      <div className="flex items-center gap-2 mb-3">
        <History className="w-3.5 h-3.5" style={{ color: "#444" }} strokeWidth={1.5} />
        <h3 style={{ fontSize: 10, fontWeight: 300, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase" }}>RECENT UPLOADS</h3>
      </div>

      {loading ? (
        <div className="flex items-center gap-2" style={{ color: "#6b6b6b", fontSize: 13 }}>
          <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
          <span style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>LOADING SAVED RESULTS...</span>
        </div>
      ) : (
        <>
          <select
            value={currentUploadId ?? ""}
            onChange={(e) => onSelectUpload(Number(e.target.value))}
            disabled={loading}
            className="w-full p-2.5 text-sm"
            style={{
              backgroundColor: "#1a1a1a",
              color: "#ffffff",
              border: "1px solid #2a2a2a",
              borderRadius: 0,
              outline: "none",
              fontWeight: 300,
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#6b6b6b"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; }}
          >
            {uploads.map((u) => (
              <option key={u.id} value={u.id}>
                {u.file_name} ({u.row_count} rows) — {new Date(u.created_at).toLocaleDateString()}
              </option>
            ))}
          </select>
          
          {currentUploadId && (
            <a
              href={`${API_URL}/uploads/${currentUploadId}/file`}
              className="flex items-center gap-2 mt-4 transition-colors"
              style={{ color: "#ffffff", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 400 }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              <Download className="w-4 h-4" strokeWidth={1.5} />
              DOWNLOAD ORIGINAL
            </a>
          )}
        </>
      )}
    </div>
  );
}
