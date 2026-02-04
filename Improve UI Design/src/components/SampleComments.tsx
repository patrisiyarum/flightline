interface SampleCommentsProps {
  onSelectSample: (text: string) => void;
}

const samples: { category: string; text: string }[] = [
  { category: "Catering Error", text: "Required meals not catered. Flight departed with zero crew meals loaded." },
  { category: "Try Something Funny", text: "The chicken was so rubbery it bounced off the tray and hit a passenger in 12B. He thought it was turbulence." },
  { category: "Food Quality/Portion", text: "The soup lacked flavor and the chicken was overcooked. Portion sizes were too small for a transcon." },
  { category: "Food Safety", text: "The meal smelled funny and looked discolored. Several crew members refused to eat it." },
];

export function SampleComments({ onSelectSample }: SampleCommentsProps) {
  return (
    <div style={{ padding: "24px 0" }}>
      <h3
        style={{
          fontSize: 10,
          fontWeight: 400,
          color: "#6b6b6b",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontFamily: "'Space Grotesk', sans-serif",
          marginBottom: 16,
        }}
      >
        PILOT QUESTIONS & ANSWERS
      </h3>

      <div className="grid sm:grid-cols-2 gap-4">
        {samples.map(({ category, text }) => (
          <div
            key={category}
            className="transition-colors"
            style={{
              padding: "20px 24px",
              backgroundColor: "#161616",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1a1a1a"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#161616"; }}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 400,
                  color: "#ffffff",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {category}
              </span>
              <button
                onClick={() => onSelectSample(text)}
                className="shrink-0 px-3 py-1 text-xs transition-colors"
                style={{
                  backgroundColor: "transparent",
                  color: "#6b6b6b",
                  border: "none",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 400,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 10,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#6b6b6b"; }}
              >
                TRY IT
              </button>
            </div>
            <p
              style={{
                color: "#6b6b6b",
                fontSize: 12,
                lineHeight: 1.7,
                fontWeight: 300,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
