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
    <div className="rounded-lg p-6" style={{ backgroundColor: "#161616" }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-white">Sample Comments by Category</h3>
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ backgroundColor: "rgba(200,16,46,0.12)", color: "#C8102E" }}
        >
          {samples.length} examples
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {visible.map(({ category, text }) => (
          <div
            key={category}
            className="p-4 rounded-lg transition-all hover:scale-[1.01]"
            style={{ backgroundColor: "#252525" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#2D2D2D"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#252525"; }}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <span className="text-sm font-medium" style={{ color: "#C8102E" }}>{category}</span>
              <button
                onClick={() => onSelectSample(text)}
                className="shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all hover:scale-105"
                style={{ backgroundColor: "rgba(200,16,46,0.12)", color: "#C8102E", border: "1px solid rgba(200,16,46,0.25)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#C8102E";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(200,16,46,0.12)";
                  e.currentTarget.style.color = "#C8102E";
                }}
              >
                Try it
              </button>
            </div>
            <p className="text-sm" style={{ color: "#A0A0A0", lineHeight: 1.6 }}>{text}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-4 w-full flex items-center justify-center gap-1 py-2.5 rounded-full text-xs font-medium transition-colors"
        style={{ color: "#A0A0A0", backgroundColor: "transparent" }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "#A0A0A0"; }}
      >
        {expanded ? (
          <><ChevronUp className="w-4 h-4" /> Show fewer</>
        ) : (
          <><ChevronDown className="w-4 h-4" /> Show all {samples.length} examples</>
        )}
      </button>
    </div>
  );
}
