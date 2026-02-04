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
  return "#8B6B6B";
}

export function PredictionCard({ subPredictions }: PredictionCardProps) {
  return (
    <div className="mt-6">
      <div className="overflow-hidden" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <span
              style={{
                width: 8,
                height: 8,
                backgroundColor: "#7C9CBF",
                display: "inline-block",
              }}
            />
            <h3 style={{ fontSize: 14, fontWeight: 500, color: "#ffffff", letterSpacing: "0.08em", textTransform: "uppercase" }}>PREDICTED SUBCATEGORY</h3>
          </div>

          <div className="space-y-0">
            {subPredictions.slice(0, 5).map((pred, idx) => {
              const isTop = idx === 0;
              const barWidth = `${Math.min(pred.probability, 100)}%`;
              const barColor = isTop ? "#7C9CBF" : "#3a3a3a";

              const rowStyle: CSSProperties = {
                backgroundColor: isTop ? "rgba(124,156,191,0.08)" : "transparent",
                padding: "14px 16px",
                transition: "background-color 0.15s",
                borderBottom: "1px solid #2a2a2a",
              };

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-4"
                  style={rowStyle}
                  onMouseEnter={(e) => {
                    if (!isTop) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isTop ? "rgba(124,156,191,0.08)" : "transparent";
                  }}
                >
                  <span
                    style={{
                      color: isTop ? "#ffffff" : "#999999",
                      fontWeight: isTop ? 500 : 300,
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 15,
                      width: 240,
                      flexShrink: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={pred.label}
                  >
                    {pred.label}
                  </span>

                  <div className="flex items-center gap-4 flex-1 justify-end">
                    <div
                      className="overflow-hidden"
                      style={{ width: 100, height: 4, backgroundColor: "rgba(255,255,255,0.08)" }}
                    >
                      <div
                        style={{ width: barWidth, height: "100%", backgroundColor: barColor }}
                      />
                    </div>

                    <span
                      style={{
                        color: isTop ? confColor(pred.probability) : "#999999",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 14,
                        fontWeight: 400,
                        minWidth: 56,
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
