import { Upload, Brain, BarChart3, ArrowRight, Zap, Target, Layers } from "lucide-react";
import type { Page } from "./Sidebar";

interface HomePageProps {
  onNavigate: (page: Page) => void;
  modelLoaded: boolean;
  totalUploads: number;
}

export function HomePage({ onNavigate, modelLoaded, totalUploads }: HomePageProps) {
  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <div
        className="relative overflow-hidden rounded-xl px-10 py-16"
        style={{
          background: "linear-gradient(135deg, #1DB954 0%, #169c46 30%, #121212 100%)",
        }}
      >
        <div className="relative z-10 max-w-2xl">
          {/* Status pill */}
          {modelLoaded && (
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6"
              style={{ backgroundColor: "rgba(0,0,0,0.3)", color: "#ffffff" }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: "#1DB954" }}
              />
              Model Online &middot; 14 Categories
            </div>
          )}

          <h1
            className="text-white mb-4"
            style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em" }}
          >
            FCR Feedback
            <br />
            Intelligence
          </h1>

          <p className="mb-8 max-w-lg" style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, lineHeight: 1.6 }}>
            Turning thousands of crew feedback comments into actionable operational insights — automatically.
            Powered by a fine-tuned BERT model that classifies each comment into precise subcategories.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate("classify")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-transform hover:scale-105"
              style={{ backgroundColor: "#ffffff", color: "#000000" }}
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate("upload")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-transform hover:scale-105"
              style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              Upload File
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #1DB954, transparent 70%)", transform: "translate(30%, -30%)" }}
        />
      </div>

      {/* How It Works */}
      <div>
        <h2 className="text-white text-xl font-bold mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Upload,
              step: "01",
              title: "Upload",
              desc: "Upload your CSV or Excel file containing crew feedback comments. The system auto-detects the text column.",
              action: () => onNavigate("upload"),
            },
            {
              icon: Brain,
              step: "02",
              title: "Classify",
              desc: "Our augmented BERT model reads each comment and predicts the operational subcategory with a confidence score.",
              action: () => onNavigate("classify"),
            },
            {
              icon: BarChart3,
              step: "03",
              title: "Analyze",
              desc: "Explore results with interactive charts, filters, confidence thresholds, and export to CSV or Excel.",
              action: () => onNavigate("insights"),
            },
          ].map(({ icon: Icon, step, title, desc, action }) => (
            <button
              key={step}
              onClick={action}
              className="text-left p-6 rounded-lg transition-all hover:scale-[1.02]"
              style={{ backgroundColor: "#181818" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#282828"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#181818"; }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(29,185,84,0.15)" }}
                >
                  <Icon className="w-5 h-5" style={{ color: "#1DB954" }} />
                </div>
                <span className="text-xs font-bold" style={{ color: "#1DB954" }}>{step}</span>
              </div>
              <h3 className="text-white font-bold mb-2">{title}</h3>
              <p style={{ color: "#b3b3b3", fontSize: 13, lineHeight: 1.5 }}>{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* The Problem */}
      <div
        className="rounded-lg p-8"
        style={{ backgroundColor: "#181818" }}
      >
        <h2 className="text-white text-xl font-bold mb-4">The Problem This Solves</h2>
        <p style={{ color: "#b3b3b3", fontSize: 14, lineHeight: 1.7, maxWidth: 700 }}>
          Thousands of comments from crew members about on-board meal issues were previously reviewed
          and categorized manually — a labor-intensive process that limited the speed of analysis and response.
          This tool automates that entire workflow, reducing hours of manual work to seconds of AI-powered classification.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {[
            { icon: Zap, label: "Processing Speed", value: "Seconds, not hours" },
            { icon: Target, label: "Classification", value: "14 subcategories" },
            { icon: Layers, label: "Architecture", value: "Augmented BERT" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon className="w-5 h-5" style={{ color: "#1DB954" }} />
              <div>
                <p className="text-white text-sm font-semibold">{value}</p>
                <p className="text-xs" style={{ color: "#b3b3b3" }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      {totalUploads > 0 && (
        <div>
          <h2 className="text-white text-xl font-bold mb-4">Recent Activity</h2>
          <div
            className="rounded-lg p-6 flex items-center justify-between"
            style={{ backgroundColor: "#181818" }}
          >
            <div>
              <p className="text-white font-semibold">{totalUploads} file{totalUploads !== 1 ? "s" : ""} processed</p>
              <p className="text-xs" style={{ color: "#b3b3b3" }}>Your upload history is available in the Upload tab</p>
            </div>
            <button
              onClick={() => onNavigate("upload")}
              className="px-4 py-2 rounded-full text-xs font-bold transition-transform hover:scale-105"
              style={{ backgroundColor: "#1DB954", color: "#000000" }}
            >
              View Uploads
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
