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
    <div className="mb-6 rounded-lg p-6" style={{ backgroundColor: "#181818" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4" style={{ color: "#b3b3b3" }} />
          <h3 className="font-semibold text-sm text-white">Upload History</h3>
        </div>
        {currentUploadId && (
          <a
            href={`${API_URL}/uploads/${currentUploadId}/file`}
            className="flex items-center gap-1 text-xs transition-colors"
            style={{ color: "#1DB954" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#1ed760"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#1DB954"; }}
          >
            <Download className="w-3 h-3" />
            Download Original File
          </a>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm" style={{ color: "#b3b3b3" }}>
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading saved results...
        </div>
      ) : (
        <select
          value={currentUploadId ?? ""}
          onChange={(e) => onSelectUpload(Number(e.target.value))}
          disabled={loading}
          className="w-full p-2.5 rounded-lg text-sm"
          style={{
            backgroundColor: "#282828",
            color: "#ffffff",
            border: "1px solid #404040",
            outline: "none",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "#1DB954"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "#404040"; }}
        >
          {uploads.map((u) => (
            <option key={u.id} value={u.id}>
              {u.file_name} ({u.row_count} rows) — {new Date(u.created_at).toLocaleDateString()}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
