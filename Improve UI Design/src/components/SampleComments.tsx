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
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 13, color: "#8e8e8e", marginBottom: 12 }}>
        Try a sample
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {samples.map(({ category, text }) => (
          <button
            key={category}
            onClick={() => onSelectSample(text)}
            style={{
              backgroundColor: "#2f2f2f",
              border: "1px solid #3e3e3e",
              padding: "8px 14px",
              borderRadius: 16,
              cursor: "pointer",
              transition: "all 0.15s ease",
              fontSize: 13,
              color: "#ececec",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#3e3e3e";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#2f2f2f";
            }}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
