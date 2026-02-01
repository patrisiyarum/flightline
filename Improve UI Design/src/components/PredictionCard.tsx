import type { CSSProperties } from "react";

interface Prediction {
  label: string;
  probability: number;
}

interface PredictionCardProps {
  subPredictions: Prediction[];
}

function confColor(val: number): string {
  if (val >= 90) return "#1DB954";
  if (val >= 70) return "#eab308";
  return "#ef4444";
}

export function PredictionCard({ subPredictions }: PredictionCardProps) {
  const top = subPredictions[0];

  return (
    <div className="mt-6 max-w-2xl mx-auto">
      <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "#181818" }}>
        {/* Green accent bar for top prediction */}
        <div style={{ height: 3, backgroundColor: "#1DB954" }} />

        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <span
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: "#1DB954" }}
            />
            <h3 className="text-lg font-semibold text-white">Predicted Subcategory</h3>
          </div>

          <div className="space-y-2">
            {subPredictions.slice(0, 5).map((pred, idx) => {
              const isTop = idx === 0;
              const barWidth = `${Math.min(pred.probability, 100)}%`;
              const color = isTop ? "#1DB954" : "#404040";

              const rowStyle: CSSProperties = {
                backgroundColor: isTop ? "rgba(29,185,84,0.1)" : "transparent",
                borderRadius: 8,
                padding: "10px 12px",
                transition: "background-color 0.15s",
              };

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-4"
                  style={rowStyle}
                  onMouseEnter={(e) => {
                    if (!isTop) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isTop ? "rgba(29,185,84,0.1)" : "transparent";
                  }}
                >
                  <span
                    className="text-sm flex-shrink-0"
                    style={{
                      color: isTop ? "#ffffff" : "#b3b3b3",
                      fontWeight: isTop ? 600 : 400,
                    }}
                  >
                    {pred.label}
                  </span>

                  <div className="flex items-center gap-3 flex-1 justify-end">
                    {/* Mini bar */}
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ width: 80, backgroundColor: "rgba(255,255,255,0.08)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: barWidth, backgroundColor: color }}
                      />
                    </div>

                    <span
                      className="text-xs font-semibold"
                      style={{
                        color: isTop ? confColor(pred.probability) : "#b3b3b3",
                        fontVariantNumeric: "tabular-nums",
                        minWidth: 48,
                        textAlign: "right",
                      }}
                    >
                      {pred.probability.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
