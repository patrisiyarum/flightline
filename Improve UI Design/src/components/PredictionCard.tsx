import type { CSSProperties } from "react";

interface Prediction {
  label: string;
  probability: number;
}

interface PredictionCardProps {
  subPredictions: Prediction[];
}

function confColor(val: number): string {
  if (val >= 90) return "#22c55e";
  if (val >= 70) return "#eab308";
  return "#64748b";
}

export function PredictionCard({ subPredictions }: PredictionCardProps) {
  const topPrediction = subPredictions[0];
  
  return (
    <div style={{ marginTop: 24 }}>
      {/* Top prediction highlight */}
      <div 
        style={{ 
          backgroundColor: "#111111", 
          border: "1px solid #1a1a1a",
          padding: "24px 28px",
          marginBottom: 12,
          borderRadius: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span 
              style={{ 
                fontSize: 10, 
                color: "#555555", 
                letterSpacing: "0.1em", 
                textTransform: "uppercase",
                display: "block",
                marginBottom: 8,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Top Prediction
            </span>
            <span 
              style={{ 
                fontSize: 18, 
                color: "#ffffff", 
                fontWeight: 400,
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: "-0.01em",
              }}
            >
              {topPrediction.label}
            </span>
          </div>
          <div style={{ textAlign: "right" }}>
            <span 
              style={{ 
                fontSize: 28, 
                color: confColor(topPrediction.probability), 
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 400,
              }}
            >
              {topPrediction.probability.toFixed(1)}%
            </span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div 
          style={{ 
            marginTop: 20, 
            height: 4, 
            backgroundColor: "#1a1a1a",
            overflow: "hidden",
            borderRadius: 2,
          }}
        >
          <div
            style={{ 
              width: `${Math.min(topPrediction.probability, 100)}%`, 
              height: "100%", 
              backgroundColor: "#ffffff",
              transition: "width 0.5s ease",
              borderRadius: 2,
            }}
          />
        </div>
      </div>

      {/* Other predictions */}
      {subPredictions.length > 1 && (
        <div 
          style={{ 
            backgroundColor: "#0a0a0a", 
            border: "1px solid #1a1a1a",
            padding: "16px 24px",
            borderRadius: 10,
          }}
        >
          <span 
            style={{ 
              fontSize: 10, 
              color: "#444444", 
              letterSpacing: "0.08em", 
              textTransform: "uppercase",
              display: "block",
              marginBottom: 16,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Other possibilities
          </span>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {subPredictions.slice(1, 5).map((pred, idx) => {
              const barWidth = `${Math.min(pred.probability, 100)}%`;

              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <span
                    style={{
                      color: "#777777",
                      fontWeight: 300,
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 13,
                      flex: 1,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {pred.label}
                  </span>

                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                    <div
                      style={{ 
                        width: 60, 
                        height: 2, 
                        backgroundColor: "#1a1a1a",
                        overflow: "hidden",
                        borderRadius: 1,
                      }}
                    >
                      <div
                        style={{ 
                          width: barWidth, 
                          height: "100%", 
                          backgroundColor: "#333333",
                          transition: "width 0.3s ease",
                          borderRadius: 1,
                        }}
                      />
                    </div>

                    <span
                      style={{
                        color: "#555555",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 12,
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
      )}
    </div>
  );
}
