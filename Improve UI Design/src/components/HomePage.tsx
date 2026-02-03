import { Upload, Brain, BarChart3, ArrowRight, Zap, Target, Layers } from "lucide-react";
import type { Page } from "./Sidebar";

interface HomePageProps {
  onNavigate: (page: Page) => void;
  modelLoaded: boolean;
  totalUploads: number;
}

export function HomePage({ onNavigate, modelLoaded, totalUploads }: HomePageProps) {
  return (
    <div className="space-y-10 pb-10">
      {/* Hero Section — flat dark, no gradient */}
      <div
        className="px-10 py-16"
        style={{
          backgroundColor: "#161616",
          borderBottom: "1px solid #2a2a2a",
        }}
      >
        <div className="max-w-xl mx-auto lg:mx-0">
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
              fontSize: 48,
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

          <p style={{ color: "#6b6b6b", fontSize: 14, lineHeight: 1.7, fontWeight: 300, maxWidth: 520, marginBottom: 32 }}>
            Turning thousands of crew feedback comments into actionable operational insights — automatically.
            Powered by a fine-tuned BERT model that classifies each comment into precise subcategories.
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
      </div>

      {/* How It Works */}
      <div>
        <h2 style={{ color: "#ffffff", fontSize: 20, fontWeight: 300, letterSpacing: "-0.02em", marginBottom: 20 }}>How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Upload,
              step: "01",
              title: "UPLOAD",
              desc: "Upload your CSV or Excel file containing crew feedback comments. The system auto-detects the text column.",
              action: () => onNavigate("upload"),
            },
            {
              icon: Brain,
              step: "02",
              title: "CLASSIFY",
              desc: "Our augmented BERT model reads each comment and predicts the operational subcategory with a confidence score.",
              action: () => onNavigate("classify"),
            },
            {
              icon: BarChart3,
              step: "03",
              title: "ANALYZE",
              desc: "Explore results with interactive charts, filters, confidence thresholds, and export to CSV or Excel.",
              action: () => onNavigate("insights"),
            },
          ].map(({ icon: Icon, step, title, desc, action }) => (
            <button
              key={step}
              onClick={action}
              className="text-left p-6 transition-colors"
              style={{
                backgroundColor: "#161616",
                borderTop: "1px solid #2a2a2a",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1e1e1e"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#161616"; }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Icon className="w-5 h-5" style={{ color: "#6b6b6b" }} strokeWidth={1.5} />
                <span style={{ fontSize: 12, fontWeight: 400, color: "#6b6b6b", fontFamily: "'JetBrains Mono', monospace" }}>{step}</span>
              </div>
              <h3 style={{ color: "#ffffff", fontWeight: 400, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{title}</h3>
              <p style={{ color: "#6b6b6b", fontSize: 13, lineHeight: 1.6, fontWeight: 300 }}>{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* The Problem */}
      <div
        className="p-6"
        style={{
          backgroundColor: "#161616",
          borderTop: "1px solid #2a2a2a",
        }}
      >
        <h2 style={{ color: "#ffffff", fontSize: 20, fontWeight: 300, letterSpacing: "-0.02em", marginBottom: 16 }}>The Problem This Solves</h2>
        <p style={{ color: "#6b6b6b", fontSize: 14, lineHeight: 1.7, maxWidth: 700, fontWeight: 300 }}>
          Thousands of comments from crew members about on-board meal issues were previously reviewed
          and categorized manually — a labor-intensive process that limited the speed of analysis and response.
          This tool automates that entire workflow, reducing hours of manual work to seconds of AI-powered classification.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6" style={{ borderTop: "1px solid #2a2a2a", paddingTop: 20 }}>
          {[
            { icon: Zap, label: "PROCESSING SPEED", value: "Seconds, not hours" },
            { icon: Target, label: "CLASSIFICATION", value: "14 subcategories" },
            { icon: Layers, label: "ARCHITECTURE", value: "Augmented BERT" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon className="w-5 h-5" style={{ color: "#6b6b6b" }} strokeWidth={1.5} />
              <div>
                <p style={{ color: "#ffffff", fontSize: 14, fontWeight: 400, fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
                <p style={{ fontSize: 10, color: "#6b6b6b", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 400 }}>{label}</p>
              </div>
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
