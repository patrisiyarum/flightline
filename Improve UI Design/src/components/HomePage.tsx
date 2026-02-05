import { useState } from "react";
import { Upload, Brain, BarChart3, ArrowRight } from "lucide-react";
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
    <div style={{ padding: "16px 0" }}>
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
                backgroundColor: activeStage === i ? "#1a1a1a" : "#111111",
                border: activeStage === i ? "1px solid #7C9CBF" : (stage.isBert ? "1px solid #333333" : "1px solid #222222"),
                padding: "16px 24px",
                textAlign: "center",
                minWidth: 120,
                position: "relative",
                cursor: "pointer",
                transition: "all 0.2s ease",
                borderRadius: 8,
              }}
              onMouseEnter={(e) => {
                if (activeStage !== i) {
                  e.currentTarget.style.borderColor = "#444444";
                }
              }}
              onMouseLeave={(e) => {
                if (activeStage !== i) {
                  e.currentTarget.style.borderColor = stage.isBert ? "#333333" : "#222222";
                }
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  left: 12,
                  fontSize: 9,
                  color: activeStage === i ? "#7C9CBF" : "#444444",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {stage.num}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: activeStage === i ? "#ffffff" : (stage.isBert ? "#999999" : "#888888"),
                  letterSpacing: "0.08em",
                  fontFamily: "'Space Grotesk', sans-serif",
                  marginBottom: 4,
                }}
              >
                {stage.label}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#555555",
                  letterSpacing: "0.04em",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {stage.sub}
              </div>
              {stage.isBert && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 6,
                    right: 8,
                    fontSize: 8,
                    color: activeStage === i ? "#7C9CBF" : "#444444",
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "0.06em",
                  }}
                >
                  BERT
                </div>
              )}
            </div>

            {/* Connector */}
            {i < pipelineStages.length - 1 && (
              <div
                style={{
                  position: "relative",
                  width: 40,
                  height: 1,
                  backgroundColor: "#2a2a2a",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: -2,
                    top: -3,
                    width: 0,
                    height: 0,
                    borderTop: "3px solid transparent",
                    borderBottom: "3px solid transparent",
                    borderLeft: "4px solid #2a2a2a",
                  }}
                />
                <div
                  className="pipeline-dot"
                  style={{
                    position: "absolute",
                    top: -2,
                    left: 0,
                    width: 5,
                    height: 5,
                    backgroundColor: "#7C9CBF",
                    borderRadius: "50%",
                    animation: `pipeline-dot 2s ease-in-out infinite`,
                    animationDelay: `${i * 0.5}s`,
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Explanation */}
      <div
        style={{
          marginTop: 24,
          textAlign: "center",
          transition: "all 0.3s ease",
          minHeight: 40,
        }}
      >
        {activeStage !== null ? (
          <p 
            style={{ 
              fontSize: 13, 
              color: "#777777", 
              lineHeight: 1.7, 
              fontWeight: 300,
              fontFamily: "'Space Grotesk', sans-serif",
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            {pipelineStages[activeStage].explanation}
          </p>
        ) : (
          <p 
            style={{ 
              fontSize: 11, 
              color: "#444444", 
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Click any step to learn more
          </p>
        )}
      </div>
    </div>
  );
}

export function HomePage({ onNavigate, modelLoaded, totalUploads }: HomePageProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Hero Section */}
      <div
        style={{
          padding: "48px 40px",
          borderBottom: "1px solid #1a1a1a",
        }}
      >
        <div className="grid gap-16 md:grid-cols-2" style={{ alignItems: "start" }}>
          {/* Left column */}
          <div>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 300,
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                color: "#ffffff",
                marginBottom: 20,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Flightline
            </h1>

            <p style={{ 
              color: "#666666", 
              fontSize: 15, 
              lineHeight: 1.8, 
              fontWeight: 300, 
              marginBottom: 40,
              maxWidth: 380,
            }}>
              Upload crew feedback to classify it, then explore insights or test single comments in the demo.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <button
                onClick={() => onNavigate("classify")}
                className="inline-flex items-center gap-3 transition-all"
                style={{
                  background: "#ffffff",
                  border: "none",
                  padding: "14px 28px",
                  color: "#0a0a0a",
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                  borderRadius: 8,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f0f0f0"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
              >
                GET STARTED
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
              <button
                onClick={() => onNavigate("upload")}
                className="transition-colors"
                style={{
                  background: "none",
                  border: "1px solid #333333",
                  padding: "14px 28px",
                  color: "#888888",
                  fontSize: 12,
                  fontWeight: 400,
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                  borderRadius: 8,
                }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.borderColor = "#555555"; 
                  e.currentTarget.style.color = "#ffffff"; 
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.borderColor = "#333333"; 
                  e.currentTarget.style.color = "#888888"; 
                }}
              >
                UPLOAD FILE
              </button>
            </div>
          </div>

          {/* Right column - feature cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
                title: "DEMO",
                desc: "Test how the model classifies any text you type.",
                action: () => onNavigate("classify"),
              },
            ].map(({ icon: Icon, step, title, desc, action }) => (
              <button
                key={step}
                onClick={action}
                className="text-left transition-all"
                style={{
                  backgroundColor: "#111111",
                  border: "1px solid #1a1a1a",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                  borderRadius: 10,
                }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.backgroundColor = "#161616"; 
                  e.currentTarget.style.borderColor = "#2a2a2a";
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.backgroundColor = "#111111"; 
                  e.currentTarget.style.borderColor = "#1a1a1a";
                }}
              >
                <div 
                  style={{ 
                    width: 40, 
                    height: 40, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    backgroundColor: "#0a0a0a",
                    border: "1px solid #222222",
                    flexShrink: 0,
                    borderRadius: 8,
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: "#7C9CBF" }} strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ 
                      fontSize: 10, 
                      color: "#444444", 
                      fontFamily: "'JetBrains Mono', monospace" 
                    }}>{step}</span>
                    <span style={{ 
                      color: "#ffffff", 
                      fontWeight: 500, 
                      fontSize: 12, 
                      letterSpacing: "0.08em" 
                    }}>{title}</span>
                  </div>
                  <p style={{ 
                    color: "#666666", 
                    fontSize: 13, 
                    lineHeight: 1.5, 
                    fontWeight: 300 
                  }}>{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activity indicator */}
      {totalUploads > 0 && (
        <div
          style={{
            padding: "20px 40px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            borderBottom: "1px solid #1a1a1a",
          }}
        >
          <div style={{ display: "flex", gap: 4 }}>
            <span style={{ width: 6, height: 6, backgroundColor: "#7C9CBF", display: "inline-block", borderRadius: "50%" }} />
            <span style={{ width: 6, height: 6, backgroundColor: "#7C9CBF", opacity: 0.5, display: "inline-block", borderRadius: "50%" }} />
            <span style={{ width: 6, height: 6, backgroundColor: "#7C9CBF", opacity: 0.2, display: "inline-block", borderRadius: "50%" }} />
          </div>

          <span style={{ fontSize: 13, color: "#666666", fontWeight: 300 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#ffffff" }}>{totalUploads}</span> file{totalUploads !== 1 ? "s" : ""} processed
          </span>

          <span style={{ color: "#333333" }}>|</span>

          <button
            onClick={() => onNavigate("upload")}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              color: "#7C9CBF",
              fontSize: 11,
              fontWeight: 400,
              letterSpacing: "0.08em",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
            onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}
          >
            VIEW HISTORY
          </button>
        </div>
      )}
    </div>
  );
}
