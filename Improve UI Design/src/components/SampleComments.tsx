import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
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
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Sample Comments by Category</h3>
          <Badge variant="secondary" className="text-xs">{samples.length} examples</Badge>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {visible.map(({ category, text }) => (
            <div
              key={category}
              className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="text-muted-foreground text-sm">{category}</h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSelectSample(text)}
                  className="shrink-0"
                >
                  Try it
                </Button>
              </div>
              <p className="text-muted-foreground text-sm">{text}</p>
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full text-muted-foreground"
        >
          {expanded ? (
            <><ChevronUp className="w-4 h-4 mr-1" /> Show fewer</>
          ) : (
            <><ChevronDown className="w-4 h-4 mr-1" /> Show all {samples.length} examples</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
