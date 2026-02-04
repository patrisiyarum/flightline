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
    <div style={{ padding: "16px 0" }}>
      <h3
        style={{
          fontSize: 11,
          fontWeight: 400,
          color: "#666666",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontFamily: "'Space Grotesk', sans-serif",
          marginBottom: 16,
        }}
      >
        Sample Comments
      </h3>

      <div className="grid sm:grid-cols-2 gap-3">
        {samples.map(({ category, text }) => (
          <button
            key={category}
            onClick={() => onSelectSample(text)}
            className="text-left transition-all"
            style={{
              padding: "20px 24px",
              backgroundColor: "#141414",
              border: "1px solid #222222",
            }}
            onMouseEnter={(e) => { 
              e.currentTarget.style.backgroundColor = "#1a1a1a"; 
              e.currentTarget.style.borderColor = "#333333"; 
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.backgroundColor = "#141414"; 
              e.currentTarget.style.borderColor = "#222222"; 
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#888888",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontFamily: "'Space Grotesk', sans-serif",
                display: "block",
                marginBottom: 10,
              }}
            >
              {category}
            </span>
            <p
              style={{
                color: "#cccccc",
                fontSize: 13,
                lineHeight: 1.6,
                fontWeight: 300,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {text}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
