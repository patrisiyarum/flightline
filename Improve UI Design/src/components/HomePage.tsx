import { Upload, Brain, BarChart3, Zap, Target, Layers } from "lucide-react";
import type { Page } from "./Sidebar";

interface HomePageProps {
  onNavigate: (page: Page) => void;
  modelLoaded: boolean;
  totalUploads: number;
}

function PipelineVisualization() {
  const stages = [
    { label: "INPUT", sub: "raw text" },
    { label: "TOKENIZE", sub: "bert tokens" },
    { label: "CLASSIFY", sub: "inference" },
    { label: "OUTPUT", sub: "categories" },
  ];

  return (
    <div
      className="pipeline-stages"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        padding: "32px 0",
      }}
    >
      {stages.map((stage, i) => (
        <div key={stage.label} style={{ display: "flex", alignItems: "center" }}>
          {/* Stage box */}
          <div
            style={{
              backgroundColor: "#0D0D0D",
              border: "1px solid #2a2a2a",
              padding: "12px 20px",
              textAlign: "center",
              minWidth: 100,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 400,
                color: "#ffffff",
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
                letterSpacing: "0.08em",
                fontFamily: "'JetBrains Mono', monospace",
                textTransform: "uppercase",
              }}
            >
              {stage.sub}
            </div>
          </div>

          {/* Connector line with animated dot */}
          {i < stages.length - 1 && (
            <div
              className="pipeline-connector"
              style={{
                position: "relative",
                width: 48,
                height: 1,
                backgroundColor: "#2a2a2a",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -2,
                  left: 0,
                  width: 5,
                  height: 5,
                  backgroundColor: "#7C9CBF",
                  animation: `pipeline-dot 1.5s linear infinite, pipeline-pulse 1.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.4}s`,
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function HomePage({ onNavigate, modelLoaded, totalUploads }: HomePageProps) {
  return (
    <div className="space-y-8 pb-8">
      {/* Hero Section — two-column grid */}
      <div
        style={{
          backgroundColor: "#161616",
          borderBottom: "1px solid #2a2a2a",
          padding: "40px 32px",
        }}
      >
        <div className="grid gap-12 md:grid-cols-2">
          {/* Left column: headline + CTA */}
          <div>
            {/* Status pill — bare inline indicator */}
            {modelLoaded && (
              <div
                className="inline-flex items-center gap-2 text-xs mb-6"
                style={{
                  color: "#6b6b6b",
                  fontWeight: 400,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontSize: 10,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    backgroundColor: "#2d8a4e",
                    display: "inline-block",
                  }}
                />
                MODEL ONLINE &middot; 14 CATEGORIES
              </div>
            )}

            <h1
              style={{
                fontSize: 40,
                fontWeight: 300,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "#ffffff",
                marginBottom: 8,
              }}
            >
              Sortline
            </h1>

            <p
              style={{
                fontSize: 11,
                fontWeight: 400,
                color: "#6b6b6b",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: 16,
              }}
            >
              NLP CLASSIFICATION ENGINE
            </p>

            <p style={{ color: "#6b6b6b", fontSize: 14, lineHeight: 1.7, fontWeight: 300, marginBottom: 32 }}>
              Turning unstructured text into actionable categories — automatically, powered by fine-tuned BERT.
            </p>

            <div className="flex items-center gap-6">
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
                desc: "Upload CSV or Excel with crew feedback. Auto-detects text column.",
                action: () => onNavigate("upload"),
              },
              {
                icon: Brain,
                step: "02",
                title: "CLASSIFY",
                desc: "BERT model predicts subcategory with confidence score.",
                action: () => onNavigate("classify"),
              },
              {
                icon: BarChart3,
                step: "03",
                title: "ANALYZE",
                desc: "Interactive charts, filters, and CSV export.",
                action: () => onNavigate("insights"),
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

      {/* Pipeline Visualization */}
      <PipelineVisualization />

      {/* The Problem This Solves — compact flex row */}
      <div
        style={{
          backgroundColor: "#161616",
          borderTop: "1px solid #2a2a2a",
          padding: 24,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 32,
        }}
      >
        <div style={{ flex: "1 1 320px" }}>
          <h2 style={{ color: "#ffffff", fontSize: 16, fontWeight: 300, letterSpacing: "-0.02em", marginBottom: 8 }}>The Problem This Solves</h2>
          <p style={{ color: "#6b6b6b", fontSize: 13, lineHeight: 1.7, fontWeight: 300 }}>
            Thousands of crew comments were categorized manually. This tool automates that workflow, reducing hours to seconds.
          </p>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            { icon: Zap, value: "Seconds" },
            { icon: Target, value: "14 categories" },
            { icon: Layers, value: "BERT" },
          ].map(({ icon: Icon, value }) => (
            <div
              key={value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                backgroundColor: "#0D0D0D",
                border: "1px solid #2a2a2a",
              }}
            >
              <Icon className="w-4 h-4" style={{ color: "#6b6b6b" }} strokeWidth={1.5} />
              <span style={{ fontSize: 12, fontWeight: 400, color: "#ffffff", fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
            </div>
          ))}
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
