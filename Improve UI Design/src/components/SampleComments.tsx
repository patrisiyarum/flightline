interface SampleCommentsProps {
  onSelectSample: (text: string) => void;
}

const samples: { category: string; text: string }[] = [
  { category: "Catering Error", text: "Required meals not catered. Flight departed with zero crew meals loaded." },
  { category: "Food Quality/Portion", text: "The soup lacked flavor and the chicken was overcooked. Portion sizes were too small for a transcon." },
  { category: "Food Safety", text: "The meal smelled funny and looked discolored. Several crew members refused to eat it." },
  { category: "Try Something Funny", text: "The chicken was so rubbery it bounced off the tray and hit a passenger in 12B. He thought it was turbulence." },
];

export function SampleComments({ onSelectSample }: SampleCommentsProps) {
  return (
    <div style={{ padding: "24px 0" }}>
      <h3
        style={{
          fontSize: 12,
          fontWeight: 400,
          color: "#999999",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontFamily: "'Space Grotesk', sans-serif",
          marginBottom: 20,
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
              padding: "24px 28px",
              backgroundColor: "#1a1a1a",
              border: "1px solid #2a2a2a",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1e1e1e"; e.currentTarget.style.borderColor = "#3a3a3a"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#1a1a1a"; e.currentTarget.style.borderColor = "#2a2a2a"; }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#ffffff",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {category}
              </span>
              <button
                onClick={() => onSelectSample(text)}
                className="shrink-0 px-4 py-2 text-xs transition-colors"
                style={{
                  backgroundColor: "#2a2a2a",
                  color: "#ffffff",
                  border: "none",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 400,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 11,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#3a3a3a"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#2a2a2a"; }}
              >
                TRY IT
              </button>
            </div>
            <p
              style={{
                color: "#999999",
                fontSize: 14,
                lineHeight: 1.8,
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
