interface Prediction {
  label: string;
  probability: number;
}

interface PredictionCardProps {
  subPredictions: Prediction[];
}

function confColor(val: number): string {
  if (val >= 90) return "#10a37f";
  if (val >= 70) return "#f59e0b";
  return "#8e8e8e";
}

export function PredictionCard({ subPredictions }: PredictionCardProps) {
  const topPrediction = subPredictions[0];

  return (
    <div style={{ marginTop: 24 }}>
      {/* Top result */}
      <div
        style={{
          backgroundColor: "#212121",
          border: "1px solid #3e3e3e",
          borderRadius: 12,
          padding: "20px 24px",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, color: "#8e8e8e", marginBottom: 6 }}>
              Top prediction
            </div>
            <div style={{ fontSize: 18, fontWeight: 500, color: "#ececec" }}>
              {topPrediction.label}
            </div>
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: confColor(topPrediction.probability),
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {topPrediction.probability.toFixed(1)}%
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 16, height: 4, backgroundColor: "#2f2f2f", borderRadius: 2 }}>
          <div
            style={{
              width: `${Math.min(topPrediction.probability, 100)}%`,
              height: "100%",
              backgroundColor: confColor(topPrediction.probability),
              borderRadius: 2,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      {/* Other predictions */}
      {subPredictions.length > 1 && (
        <div
          style={{
            backgroundColor: "#212121",
            border: "1px solid #3e3e3e",
            borderRadius: 12,
            padding: "16px 20px",
          }}
        >
          <div style={{ fontSize: 12, color: "#6e6e6e", marginBottom: 12 }}>
            Other possibilities
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {subPredictions.slice(1, 5).map((pred, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 14, color: "#9b9b9b" }}>
                  {pred.label}
                </span>
                <span style={{ fontSize: 13, color: "#6e6e6e", fontFamily: "system-ui" }}>
                  {pred.probability.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
