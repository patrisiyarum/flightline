import { Upload, Brain, BarChart3, ArrowRight, Zap, Target, Layers } from "lucide-react";
import type { Page } from "./Sidebar";

interface HomePageProps {
  onNavigate: (page: Page) => void;
  modelLoaded: boolean;
  totalUploads: number;
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
            {/* Status pill */}
            {modelLoaded && (
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs mb-6"
                style={{
                  backgroundColor: "#0D0D0D",
                  color: "#ffffff",
                  border: "1px solid #2a2a2a",
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
                marginBottom: 16,
              }}
            >
              FCR Feedback
              <br />
              Intelligence
            </h1>

            <p style={{ color: "#6b6b6b", fontSize: 14, lineHeight: 1.7, fontWeight: 300, marginBottom: 32 }}>
              Turning crew feedback into actionable insights — automatically, powered by fine-tuned BERT.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate("classify")}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm transition-colors"
                style={{
                  backgroundColor: "#ffffff",
                  color: "#0D0D0D",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 400,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#e5e5e5"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
              >
                GET STARTED
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => onNavigate("upload")}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm transition-colors"
                style={{
                  backgroundColor: "transparent",
                  color: "#6b6b6b",
                  border: "1px solid #2a2a2a",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 400,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6b6b6b"; e.currentTarget.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#6b6b6b"; }}
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

      {/* Quick Stats */}
      {totalUploads > 0 && (
        <div>
          <h2 style={{ color: "#ffffff", fontSize: 20, fontWeight: 300, letterSpacing: "-0.02em", marginBottom: 16 }}>Recent Activity</h2>
          <div
            className="p-6 flex items-center justify-between"
            style={{
              backgroundColor: "#161616",
              borderTop: "1px solid #2a2a2a",
            }}
          >
            <div>
              <p style={{ color: "#ffffff", fontWeight: 400 }}>{totalUploads} file{totalUploads !== 1 ? "s" : ""} processed</p>
              <p style={{ fontSize: 11, color: "#6b6b6b" }}>Your upload history is available in the Upload tab</p>
            </div>
            <button
              onClick={() => onNavigate("upload")}
              className="px-5 py-2.5 text-xs transition-colors"
              style={{
                backgroundColor: "#2a2a2a",
                color: "#ffffff",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 400,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#383838"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#2a2a2a"; }}
            >
              VIEW UPLOADS
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
