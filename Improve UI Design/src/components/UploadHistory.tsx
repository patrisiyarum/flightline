import { Card, CardContent } from "./ui/card";
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
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Upload History</h3>
          </div>
          {currentUploadId && (
            <a
              href={`${API_URL}/uploads/${currentUploadId}/file`}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Download className="w-3 h-3" />
              Download Original File
            </a>
          )}
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading saved results...
          </div>
        ) : (
          <select
            value={currentUploadId ?? ""}
            onChange={(e) => onSelectUpload(Number(e.target.value))}
            disabled={loading}
            className="w-full p-2 rounded-md border border-border bg-background text-foreground text-sm"
          >
            {uploads.map((u) => (
              <option key={u.id} value={u.id}>
                {u.file_name} ({u.row_count} rows) — {new Date(u.created_at).toLocaleDateString()}
              </option>
            ))}
          </select>
        )}
      </CardContent>
    </Card>
  );
}
