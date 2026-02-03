import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SampleCommentsProps {
  onSelectSample: (text: string) => void;
}

const samples: { category: string; text: string }[] = [
  { category: "Catering Error", text: "Required meals not catered. Flight departed with zero crew meals loaded." },
  { category: "Equipment", text: "Oven in galley 4 is inoperable — unable to heat any entrees for business class." },
  { category: "Food Quality/Portion", text: "The soup lacked flavor and the chicken was overcooked. Portion sizes were too small for a transcon." },
  { category: "Food Safety", text: "The meal smelled funny and looked discolored. Several crew members refused to eat it." },
  { category: "Ground Catering Issue", text: "Catering truck arrived 5 minutes before door close. Half the carts were missing." },
  { category: "Meal Choice Unavailable", text: "Only had pasta option available. No chicken or vegetarian choices for economy." },
  { category: "Crew Error", text: "Crew miscounted meals during boarding and shorted 12 passengers in rows 30-42." },
  { category: "Ferry/Deadhead", text: "No meals loaded for deadheading crew on repositioning flight ATL-MSP." },
  { category: "IFX Error", text: "System showed 180 meals required but only 140 were loaded per IFX manifest." },
  { category: "PWA Issue", text: "PWA order was placed correctly but warehouse pulled wrong meal codes." },
  { category: "Redeye No Touch", text: "Redeye flight — meals left from previous leg were expired and had to be discarded." },
  { category: "Missing Provisioning", text: "No napkins, no utensils, and insufficient cups loaded for T2 service." },
  { category: "Provisioning", text: "Beverage cart was missing wine and all juice options for first class." },
  { category: "Other", text: "Passenger brought outside food that caused an allergic reaction in the adjacent seat." },
];

export function SampleComments({ onSelectSample }: SampleCommentsProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? samples : samples.slice(0, 4);

  return (
    <div className="p-6" style={{ backgroundColor: "#161616", borderTop: "1px solid #2a2a2a" }}>
      <div className="flex items-center justify-between mb-5">
        <h3 style={{ fontSize: 11, fontWeight: 400, color: "#6b6b6b", letterSpacing: "0.1em", textTransform: "uppercase" }}>SAMPLE COMMENTS BY CATEGORY</h3>
        <span
          style={{
            fontSize: 11,
            fontWeight: 400,
            color: "#6b6b6b",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {samples.length}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {visible.map(({ category, text }) => (
          <div
            key={category}
            className="p-4 transition-colors"
            style={{
              backgroundColor: "#0D0D0D",
              borderBottom: "1px solid #2a2a2a",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#161616"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#0D0D0D"; }}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <span style={{ fontSize: 11, fontWeight: 400, color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.08em" }}>{category}</span>
              <button
                onClick={() => onSelectSample(text)}
                className="shrink-0 px-3 py-1 text-xs transition-colors"
                style={{
                  backgroundColor: "transparent",
                  color: "#6b6b6b",
                  border: "1px solid #2a2a2a",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 400,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffffff";
                  e.currentTarget.style.color = "#0D0D0D";
                  e.currentTarget.style.borderColor = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#6b6b6b";
                  e.currentTarget.style.borderColor = "#2a2a2a";
                }}
              >
                TRY IT
              </button>
            </div>
            <p style={{ color: "#6b6b6b", fontSize: 13, lineHeight: 1.6, fontWeight: 300 }}>{text}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-4 w-full flex items-center justify-center gap-1 py-2.5 text-xs transition-colors"
        style={{
          color: "#6b6b6b",
          backgroundColor: "transparent",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 400,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "#6b6b6b"; }}
      >
        {expanded ? (
          <><ChevronUp className="w-4 h-4" strokeWidth={1.5} /> SHOW FEWER</>
        ) : (
          <><ChevronDown className="w-4 h-4" strokeWidth={1.5} /> SHOW ALL {samples.length} EXAMPLES</>
        )}
      </button>
    </div>
  );
}
