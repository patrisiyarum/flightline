import { useState } from "react";
import { Upload, Brain, BarChart3 } from "lucide-react";
import type { Page } from "./Sidebar";

interface HomePageProps {
  onNavigate: (page: Page) => void;
  modelLoaded: boolean;
  totalUploads: number;
}

const pipelineStages = [
  { 
    label: "INPUT", 
    sub: "crew feedback", 
    num: "01", 
    isBert: false,
    explanation: "Raw text comments from crew members are fed into the system. This can be a single comment or thousands of rows from a spreadsheet."
  },
  { 
    label: "TOKENIZE", 
    sub: "text processing", 
    num: "02", 
    isBert: true,
    explanation: "The text is broken into tokens (words and subwords) that the BERT model understands. Special tokens mark the start and end of each sentence."
  },
  { 
    label: "CLASSIFY", 
    sub: "model prediction", 
    num: "03", 
    isBert: true,
    explanation: "The BERT model analyzes the tokens to understand context and meaning, then predicts which category the feedback belongs to."
  },
  { 
    label: "OUTPUT", 
    sub: "category + confidence", 
    num: "04", 
    isBert: false,
    explanation: "The model returns the predicted category along with a confidence score showing how certain it is about the classification."
  },
];

export function PipelineVisualization() {
  const [activeStage, setActiveStage] = useState<number | null>(null);

  return (
    <div style={{ padding: "24px 0 8px" }}>
      {/* Pipeline stages */}
      <div
        className="pipeline-stages"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        {pipelineStages.map((stage, i) => (
          <div key={stage.label} style={{ display: "flex", alignItems: "center" }}>
            {/* Stage box */}
            <div
              onClick={() => setActiveStage(activeStage === i ? null : i)}
              style={{
                backgroundColor: activeStage === i ? "#1f1f1f" : (stage.isBert ? "#1a1a1a" : "#0D0D0D"),
                border: activeStage === i ? "1px solid #7C9CBF" : (stage.isBert ? "1px solid #7C9CBF" : "1px solid #2a2a2a"),
                padding: "14px 22px",
                textAlign: "center",
                minWidth: 110,
                position: "relative",
                cursor: "pointer",
                transition: "all 0.2s ease",
                transform: activeStage === i ? "scale(1.02)" : "scale(1)",
              }}
              onMouseEnter={(e) => {
                if (activeStage !== i) {
                  e.currentTarget.style.backgroundColor = "#1f1f1f";
                }
              }}
              onMouseLeave={(e) => {
                if (activeStage !== i) {
                  e.currentTarget.style.backgroundColor = stage.isBert ? "#1a1a1a" : "#0D0D0D";
                }
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 6,
                  left: 10,
                  fontSize: 8,
                  color: stage.isBert ? "#7C9CBF" : "#444",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {stage.num}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 400,
                  color: activeStage === i ? "#ffffff" : (stage.isBert ? "#7C9CBF" : "#ffffff"),
                  letterSpacing: "0.1em",
                  fontFamily: "'JetBrains Mono', monospace",
                  marginBottom: 4,
                }}
              >
                {stage.label}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "#6b6b6b",
                  letterSpacing: "0.06em",
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: "uppercase",
                }}
              >
                {stage.sub}
              </div>
              {stage.isBert && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 4,
                    right: 6,
                    fontSize: 7,
                    color: "#7C9CBF",
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  BERT
                </div>
              )}
            </div>

            {/* Connector arrow with animated dot */}
            {i < pipelineStages.length - 1 && (
              <div
                className="pipeline-connector"
                style={{
                  position: "relative",
                  width: 48,
                  height: 1,
                  backgroundColor: "#2a2a2a",
                  overflow: "visible",
                }}
              >
                {/* Arrow head */}
                <div
                  style={{
                    position: "absolute",
                    right: -3,
                    top: -3,
                    width: 0,
                    height: 0,
                    borderTop: "3px solid transparent",
                    borderBottom: "3px solid transparent",
                    borderLeft: "5px solid #2a2a2a",
                  }}
                />
                {/* Animated dot */}
                <div
                  style={{
                    position: "absolute",
                    top: -2,
                    left: 0,
                    width: 5,
                    height: 5,
                    backgroundColor: "#7C9CBF",
                    animation: `pipeline-dot 2s ease-in-out infinite, pipeline-pulse 2s ease-in-out infinite`,
                    animationDelay: `${i * 0.5}s`,
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Explanation text */}
      <div
        style={{
          marginTop: 20,
          textAlign: "center",
          transition: "all 0.3s ease",
          maxHeight: activeStage !== null ? 100 : 0,
          opacity: activeStage !== null ? 1 : 0,
          overflow: "hidden",
        }}
      >
        {activeStage !== null && (
          <p 
            style={{ 
              fontSize: 13, 
              color: "#777777", 
              lineHeight: 1.7, 
              fontWeight: 300,
              fontFamily: "'Space Grotesk', sans-serif",
              maxWidth: 500,
              margin: "0 auto",
            }}
          >
            {pipelineStages[activeStage].explanation}
          </p>
        )}
      </div>

      {/* Hint text */}
      {activeStage === null && (
        <p 
          style={{ 
            fontSize: 11, 
            color: "#555555", 
            textAlign: "center", 
            marginTop: 16,
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Click any step to learn more
        </p>
      )}
    </div>
  );
}

export function HomePage({ onNavigate, modelLoaded, totalUploads }: HomePageProps) {
  return (
    <div className="pb-8" style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      {/* Hero Section — two-column grid */}
      <div
        style={{
          backgroundColor: "#161616",
          borderBottom: "1px solid #2a2a2a",
          padding: "40px 32px",
        }}
      >
        <div className="grid gap-24 md:grid-cols-2">
          {/* Left column: headline + CTA */}
          <div style={{ paddingRight: 40 }}>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 300,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "#ffffff",
                marginBottom: 16,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Flightline
            </h1>

            <p style={{ color: "#6b6b6b", fontSize: 14, lineHeight: 1.7, fontWeight: 300, marginBottom: 48 }}>
              Upload crew feedback to classify it, then explore insights or test single comments in the demo.
            </p>

            <div className="flex items-center gap-6" style={{ marginTop: 16 }}>
              <button
                onClick={() => onNavigate("classify")}
                className="inline-flex items-center gap-2 text-sm transition-colors"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "#ffffff",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 400,
                  cursor: "pointer",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = "underline";
                  (e.currentTarget.style as any).textUnderlineOffset = "4px";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = "none";
                }}
              >
                GET STARTED
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>&rarr;</span>
              </button>
              <button
                onClick={() => onNavigate("upload")}
                className="inline-flex items-center gap-2 text-sm transition-colors"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "#6b6b6b",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 400,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#6b6b6b"; }}
              >
                UPLOAD FILE
              </button>
            </div>
          </div>

          {/* Right column: How It Works cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              {
                icon: Upload,
                step: "01",
                title: "UPLOAD",
                desc: "Drop a CSV or Excel file to classify all rows at once.",
                action: () => onNavigate("upload"),
              },
              {
                icon: BarChart3,
                step: "02",
                title: "INSIGHTS",
                desc: "See charts and breakdowns of your classified data.",
                action: () => onNavigate("insights"),
              },
              {
                icon: Brain,
                step: "03",
                title: "FEEDBACK DEMO",
                desc: "Test how the model classifies any text you type.",
                action: () => onNavigate("classify"),
              },
            ].map(({ icon: Icon, step, title, desc, action }) => (
              <button
                key={step}
                onClick={action}
                className="text-left p-4 transition-colors"
                style={{
                  backgroundColor: "transparent",
                  borderLeft: "2px solid #2a2a2a",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1e1e1e"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-4 h-4" style={{ color: "#6b6b6b" }} strokeWidth={1.5} />
                  <span style={{ fontSize: 11, fontWeight: 400, color: "#6b6b6b", fontFamily: "'JetBrains Mono', monospace" }}>{step}</span>
                  <span style={{ color: "#ffffff", fontWeight: 400, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>{title}</span>
                </div>
                <p style={{ color: "#6b6b6b", fontSize: 12, lineHeight: 1.6, fontWeight: 300 }}>{desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity — compact inline row */}
      {totalUploads > 0 && (
        <div
          style={{
            borderTop: "1px solid #2a2a2a",
            paddingTop: 16,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {/* Decorative dot cluster */}
          <div style={{ display: "flex", gap: 3 }}>
            <span style={{ width: 4, height: 4, backgroundColor: "#7C9CBF", opacity: 1, display: "inline-block" }} />
            <span style={{ width: 4, height: 4, backgroundColor: "#8BAF8B", opacity: 0.7, display: "inline-block" }} />
            <span style={{ width: 4, height: 4, backgroundColor: "#B8A9C9", opacity: 0.4, display: "inline-block" }} />
          </div>

          {/* Stat text */}
          <span style={{ fontSize: 12, color: "#6b6b6b", fontWeight: 300 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#ffffff" }}>{totalUploads}</span> file{totalUploads !== 1 ? "s" : ""} processed
          </span>

          <span style={{ color: "#2a2a2a" }}>&middot;</span>

          {/* View history link */}
          <button
            onClick={() => onNavigate("upload")}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              color: "#6b6b6b",
              fontSize: 10,
              fontWeight: 400,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#6b6b6b"; }}
          >
            VIEW HISTORY
          </button>
        </div>
      )}
    </div>
  );
}
