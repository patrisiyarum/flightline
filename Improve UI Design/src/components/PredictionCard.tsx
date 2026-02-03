import type { CSSProperties } from "react";

interface Prediction {
  label: string;
  probability: number;
}

interface PredictionCardProps {
  subPredictions: Prediction[];
}

function confColor(val: number): string {
  if (val >= 90) return "#2d8a4e";
  if (val >= 70) return "#b8860b";
  return "#c0392b";
}

export function PredictionCard({ subPredictions }: PredictionCardProps) {
  return (
    <div className="mt-6 max-w-2xl mx-auto">
      <div className="overflow-hidden" style={{ backgroundColor: "#161616" }}>
        {/* Thin 1px line instead of gradient bar */}
        <div style={{ height: 1, backgroundColor: "#2a2a2a" }} />

        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <span
              style={{
                width: 6,
                height: 6,
                backgroundColor: "#7C9CBF",
                display: "inline-block",
              }}
            />
            <h3 style={{ fontSize: 12, fontWeight: 400, color: "#ffffff", letterSpacing: "0.08em", textTransform: "uppercase" }}>PREDICTED SUBCATEGORY</h3>
          </div>

          <div className="space-y-0">
            {subPredictions.slice(0, 5).map((pred, idx) => {
              const isTop = idx === 0;
              const barWidth = `${Math.min(pred.probability, 100)}%`;
              const barColor = isTop ? "#7C9CBF" : "#2a2a2a";

              const rowStyle: CSSProperties = {
                backgroundColor: isTop ? "rgba(124,156,191,0.06)" : "transparent",
                padding: "10px 12px",
                transition: "background-color 0.15s",
                borderBottom: "1px solid #2a2a2a",
              };

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-4"
                  style={rowStyle}
                  onMouseEnter={(e) => {
                    if (!isTop) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isTop ? "rgba(124,156,191,0.06)" : "transparent";
                  }}
                >
                  <span
                    className="text-sm flex-shrink-0"
                    style={{
                      color: isTop ? "#ffffff" : "#6b6b6b",
                      fontWeight: isTop ? 400 : 300,
                    }}
                  >
                    {pred.label}
                  </span>

                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <div
                      className="overflow-hidden"
                      style={{ width: 80, height: 3, backgroundColor: "rgba(255,255,255,0.06)" }}
                    >
                      <div
                        style={{ width: barWidth, height: "100%", backgroundColor: barColor }}
                      />
                    </div>

                    <span
                      style={{
                        color: isTop ? confColor(pred.probability) : "#6b6b6b",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 12,
                        fontWeight: 400,
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
