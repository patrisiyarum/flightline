import type { CSSProperties } from "react";

interface Prediction {
  label: string;
  probability: number;
}

interface PredictionCardProps {
  subPredictions: Prediction[];
}

function confColor(val: number): string {
  if (val >= 90) return "#4ade80";
  if (val >= 70) return "#fbbf24";
  return "#94a3b8";
}

export function PredictionCard({ subPredictions }: PredictionCardProps) {
  return (
    <div className="mt-8">
      <div style={{ backgroundColor: "#141414", border: "1px solid #222222" }}>
        <div style={{ padding: "24px 28px" }}>
          <h3 
            style={{ 
              fontSize: 11, 
              fontWeight: 500, 
              color: "#666666", 
              letterSpacing: "0.12em", 
              textTransform: "uppercase",
              fontFamily: "'Space Grotesk', sans-serif",
              marginBottom: 20,
            }}
          >
            Prediction Results
          </h3>

          <div>
            {subPredictions.slice(0, 5).map((pred, idx) => {
              const isTop = idx === 0;
              const barWidth = `${Math.min(pred.probability, 100)}%`;

              const rowStyle: CSSProperties = {
                backgroundColor: isTop ? "rgba(255,255,255,0.03)" : "transparent",
                padding: "12px 16px",
                marginLeft: -16,
                marginRight: -16,
                borderBottom: idx < 4 ? "1px solid #1a1a1a" : "none",
              };

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-6"
                  style={rowStyle}
                >
                  <span
                    style={{
                      color: isTop ? "#ffffff" : "#888888",
                      fontWeight: isTop ? 400 : 300,
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 14,
                      flex: 1,
                    }}
                  >
                    {pred.label}
                  </span>

                  <div className="flex items-center gap-4">
                    <div
                      style={{ 
                        width: 80, 
                        height: 3, 
                        backgroundColor: "#1a1a1a",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{ 
                          width: barWidth, 
                          height: "100%", 
                          backgroundColor: isTop ? "#7C9CBF" : "#333333",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>

                    <span
                      style={{
                        color: isTop ? confColor(pred.probability) : "#666666",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 13,
                        fontWeight: 400,
                        minWidth: 52,
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
