interface SampleCommentsProps {
  onSelectSample: (text: string) => void;
}

const samples: { category: string; text: string }[] = [
  { category: "Catering Error", text: "Required meals not catered. Flight departed with zero crew meals loaded." },
  { category: "Food Quality", text: "The soup lacked flavor and the chicken was overcooked. Portion sizes were too small for a transcon." },
  { category: "Food Safety", text: "The meal smelled funny and looked discolored. Several crew members refused to eat it." },
  { category: "Try Something Funny", text: "The chicken was so rubbery it bounced off the tray and hit a passenger in 12B. He thought it was turbulence." },
];

export function SampleComments({ onSelectSample }: SampleCommentsProps) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ width: 20, height: 1, backgroundColor: "#2a2a2a" }} />
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: "#555555",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Try a sample
        </span>
        <div style={{ flex: 1, height: 1, backgroundColor: "#2a2a2a" }} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {samples.map(({ category, text }, index) => (
          <button
            key={category}
            onClick={() => onSelectSample(text)}
            className="text-left transition-all group"
            style={{
              padding: "20px 24px",
              backgroundColor: "#0f0f0f",
              border: "1px solid #1a1a1a",
              position: "relative",
              overflow: "hidden",
              borderRadius: 10,
            }}
            onMouseEnter={(e) => { 
              e.currentTarget.style.backgroundColor = "#141414"; 
              e.currentTarget.style.borderColor = "#2a2a2a"; 
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.backgroundColor = "#0f0f0f"; 
              e.currentTarget.style.borderColor = "#1a1a1a"; 
            }}
          >
            {/* Number indicator */}
            <span
              style={{
                position: "absolute",
                top: 12,
                right: 16,
                fontSize: 10,
                color: "#333333",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>

            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#7C9CBF",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontFamily: "'Space Grotesk', sans-serif",
                display: "block",
                marginBottom: 12,
              }}
            >
              {category}
            </span>
            <p
              style={{
                color: "#999999",
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
