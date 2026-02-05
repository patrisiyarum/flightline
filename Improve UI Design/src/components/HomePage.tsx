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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {pipelineStages.map((stage, i) => (
          <div key={stage.label} style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={() => setActiveStage(activeStage === i ? null : i)}
              style={{
                backgroundColor: activeStage === i ? "#2f2f2f" : "#212121",
                border: activeStage === i ? "1px solid #4e4e4e" : "1px solid #3e3e3e",
                padding: "12px 20px",
                textAlign: "center",
                minWidth: 100,
                cursor: "pointer",
                transition: "all 0.15s ease",
                borderRadius: 12,
              }}
              onMouseEnter={(e) => {
                if (activeStage !== i) {
                  e.currentTarget.style.backgroundColor = "#2f2f2f";
                }
              }}
              onMouseLeave={(e) => {
                if (activeStage !== i) {
                  e.currentTarget.style.backgroundColor = "#212121";
                }
              }}
            >
              <div style={{ fontSize: 10, color: "#6e6e6e", marginBottom: 4 }}>
                {stage.num}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#ececec", marginBottom: 2 }}>
                {stage.label}
              </div>
              <div style={{ fontSize: 11, color: "#8e8e8e" }}>
                {stage.sub}
              </div>
            </button>

            {i < pipelineStages.length - 1 && (
              <div style={{ width: 24, display: "flex", justifyContent: "center" }}>
                <ArrowRight className="w-4 h-4" style={{ color: "#4e4e4e" }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 20,
          textAlign: "center",
          minHeight: 40,
        }}
      >
        {activeStage !== null ? (
          <p style={{ fontSize: 14, color: "#9b9b9b", lineHeight: 1.6, maxWidth: 500, margin: "0 auto" }}>
            {pipelineStages[activeStage].explanation}
          </p>
        ) : (
          <p style={{ fontSize: 13, color: "#6e6e6e" }}>
            Click any step to learn more
          </p>
        )}
      </div>
    </div>
  );
}

export function HomePage({ onNavigate, modelLoaded, totalUploads }: HomePageProps) {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: "#ececec",
            marginBottom: 16,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Flightline
        </h1>
        <p style={{ fontSize: 16, color: "#8e8e8e", lineHeight: 1.6, maxWidth: 480, margin: "0 auto" }}>
          Upload crew feedback to classify it, explore insights, or test single comments in the demo.
        </p>
      </div>

      {/* Action cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 48 }}>
        {[
          {
            icon: Upload,
            title: "Upload",
            desc: "Classify a file",
            action: () => onNavigate("upload"),
          },
          {
            icon: BarChart3,
            title: "Insights",
            desc: "View analytics",
            action: () => onNavigate("insights"),
          },
          {
            icon: Brain,
            title: "Demo",
            desc: "Try it out",
            action: () => onNavigate("classify"),
          },
        ].map(({ icon: Icon, title, desc, action }) => (
          <button
            key={title}
            onClick={action}
            style={{
              backgroundColor: "transparent",
              border: "none",
              padding: "16px 8px",
              cursor: "pointer",
              textAlign: "center",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.7";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            <Icon className="w-6 h-6 mb-3 mx-auto" style={{ color: "#8e8e8e" }} strokeWidth={1.5} />
            <div style={{ fontSize: 15, fontWeight: 500, color: "#ececec", marginBottom: 4 }}>{title}</div>
            <div style={{ fontSize: 13, color: "#6e6e6e" }}>{desc}</div>
          </button>
        ))}
      </div>

      {/* Get started button */}
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <button
          onClick={() => onNavigate("classify")}
          style={{
            backgroundColor: "#ececec",
            color: "#171717",
            border: "none",
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 500,
            borderRadius: 20,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#d4d4d4"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ececec"; }}
        >
          Get started
        </button>
      </div>

      {/* About Section */}
      <div style={{ borderTop: "1px solid #2f2f2f", paddingTop: 48 }}>
        <p style={{ fontSize: 12, color: "#6e6e6e", textAlign: "center", marginBottom: 24, fontFamily: "system-ui, -apple-system, sans-serif" }}>
          How it works
        </p>
        
        <PipelineVisualization />

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <p style={{ 
            fontSize: 15, 
            color: "#8e8e8e", 
            lineHeight: 1.7, 
            maxWidth: 520, 
            margin: "0 auto",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}>
            Powered by a fine-tuned{" "}
            <a 
              href="https://www.nvidia.com/en-us/glossary/bert/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: "#10a37f", textDecoration: "none" }}
              onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
              onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}
            >BERT</a> model that transforms hours of manual categorization into seconds of automated processing.
          </p>
          
          <div style={{ marginTop: 24 }}>
            <span style={{ fontSize: 28, color: "#ececec", fontWeight: 600, fontFamily: "system-ui, -apple-system, sans-serif" }}>1000+</span>
            <span style={{ fontSize: 13, color: "#6e6e6e", marginLeft: 8 }}>comments/min</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      {totalUploads > 0 && (
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <span style={{ fontSize: 13, color: "#6e6e6e" }}>
            {totalUploads} file{totalUploads !== 1 ? "s" : ""} processed
          </span>
        </div>
      )}
    </div>
  );
}
