import { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  CheckCircle2,
  Timer,
} from "lucide-react";
import { PredictionCard } from "./components/PredictionCard";
import { SampleComments } from "./components/SampleComments";
import { BulkUpload } from "./components/BulkUpload";
import { UploadHistory, UploadSummary } from "./components/UploadHistory";

import { Sidebar, Page } from "./components/Sidebar";
import { HomePage } from "./components/HomePage";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const API_URL = "https://feedback-webapp-5zc2.onrender.com";

// --- API helpers ---
async function checkHealth() {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) throw new Error("Health check failed");
    return await response.json();
  } catch {
    return { status: "offline", sub_classes_count: 0 };
  }
}

async function predictText(text: string) {
  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) throw new Error("Prediction failed");
  return await response.json();
}

async function saveUpload(fileName: string, fileBase64: string, results: any[]) {
  const response = await fetch(`${API_URL}/uploads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_name: fileName, file_base64: fileBase64, results }),
  });
  if (!response.ok) throw new Error("Failed to save upload");
  return await response.json();
}

async function listUploads(): Promise<UploadSummary[]> {
  const response = await fetch(`${API_URL}/uploads`);
  if (!response.ok) throw new Error("Failed to list uploads");
  const data = await response.json();
  return data.uploads;
}

async function getUpload(uploadId: number) {
  const response = await fetch(`${API_URL}/uploads/${uploadId}`);
  if (!response.ok) throw new Error("Failed to get upload");
  return await response.json();
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// --- Types ---
interface BulkResultRow {
  Predicted_Subcategory: string;
  [key: string]: any;
}

// --- Chart Colors (monochrome + one accent) ---
const CHART_COLORS = ["#7C9CBF", "#8BAF8B", "#B8A9C9", "#C4B7A6", "#8ABCC4", "#A3A3A3"];
const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: "#0f0e12",
  color: "#e5e5e5",
  border: "1px solid #2a2a2a",
  borderRadius: 0,
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 12,
  zIndex: 10,
};
const TOOLTIP_WRAPPER_STYLE: React.CSSProperties = {
  zIndex: 10,
  outline: "none",
};
const LABEL_COLOR = "#6b6b6b";

// --- AnalyticsDashboard ---
function AnalyticsDashboard({ results, processingTime }: { results: BulkResultRow[]; processingTime: number | null }) {
  const [confidenceThreshold, setConfidenceThreshold] = useState(0);

  const filteredResults = useMemo(() => {
    if (confidenceThreshold === 0) return results;
    return results.filter(row => {
      const confStr = row["Subcategory_Confidence"];
      if (confStr && typeof confStr === "string") {
        return parseFloat(confStr.replace("%", "")) >= confidenceThreshold;
      }
      return true;
    });
  }, [results, confidenceThreshold]);

  const kpis = useMemo(() => {
    if (!results.length) return null;
    let totalConf = 0, confCount = 0, highConf = 0;
    const catCounts: Record<string, number> = {};
    results.forEach(row => {
      const confStr = row["Subcategory_Confidence"];
      if (confStr && typeof confStr === "string") {
        const val = parseFloat(confStr.replace("%", ""));
        if (!isNaN(val)) { totalConf += val; confCount++; if (val >= 90) highConf++; }
      }
      const cat = row["Predicted_Subcategory"];
      if (cat) catCounts[cat] = (catCounts[cat] || 0) + 1;
    });
    const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];
    return {
      totalRows: results.length,
      avgConfidence: confCount > 0 ? (totalConf / confCount).toFixed(1) : "N/A",
      highConfCount: highConf,
      topCategory: topCategory ? topCategory[0] : "N/A",
      topCategoryPct: topCategory ? ((topCategory[1] / results.length) * 100).toFixed(0) : "0",
    };
  }, [results]);

  const airportData = useMemo(() => {
    if (!filteredResults.length) return [];
    const counts: Record<string, number> = {};
    filteredResults.forEach(row => {
      const apKey = Object.keys(row).find(k => ["Dpt A/P", "Station", "Base", "Departure"].some(t => k.includes(t)));
      const ap = row[apKey || "Dpt A/P"] || "Unknown";
      counts[ap] = (counts[ap] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [filteredResults]);

  const trendData = useMemo(() => {
    if (!filteredResults.length) return [];
    const counts: Record<string, number> = {};
    filteredResults.forEach(row => {
      const dateKey = Object.keys(row).find(k => k.includes("Date") || k.includes("Time"));
      const dateVal = row[dateKey || "Flt Date"];
      const date = dateVal ? new Date(dateVal).toLocaleDateString() : "Unknown";
      if (date !== "Unknown" && date !== "Invalid Date") counts[date] = (counts[date] || 0) + 1;
    });
    return Object.entries(counts).map(([date, count]) => ({ date, count })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredResults]);

  const fleetData = useMemo(() => {
    if (!filteredResults.length) return [];
    const counts: Record<string, number> = {};
    filteredResults.forEach(row => {
      const acKey = Object.keys(row).find(k => k === "A/C" || k === "Aircraft" || k === "Fleet");
      counts[row[acKey || "A/C"] || "Unknown"] = (counts[row[acKey || "A/C"] || "Unknown"] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filteredResults]);

  const sourceData = useMemo(() => {
    if (!filteredResults.length) return [];
    const counts: Record<string, number> = {};
    filteredResults.forEach(row => {
      const typeKey = Object.keys(row).find(k => k.includes("Meal Type") || k.includes("Service Type"));
      counts[row[typeKey || "Meal Type"] || "Unknown"] = (counts[row[typeKey || "Meal Type"] || "Unknown"] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredResults]);

  const confidenceData = useMemo(() => {
    if (!filteredResults.length) return [];
    const buckets = { "Low (<70%)": 0, "Medium (70-90%)": 0, "High (>90%)": 0 };
    filteredResults.forEach(row => {
      const confStr = row["Subcategory_Confidence"];
      if (confStr && typeof confStr === "string") {
        const val = parseFloat(confStr.replace("%", ""));
        if (val < 70) buckets["Low (<70%)"]++;
        else if (val < 90) buckets["Medium (70-90%)"]++;
        else buckets["High (>90%)"]++;
      }
    });
    return Object.entries(buckets).map(([name, count]) => ({ name, count }));
  }, [filteredResults]);

  if (!results.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <BarChart3 className="w-16 h-16 mb-4 opacity-30" style={{ color: "#6b6b6b" }} strokeWidth={1.5} />
        <p className="text-white" style={{ fontWeight: 400 }}>No data yet</p>
        <p className="text-sm" style={{ color: "#6b6b6b" }}>Upload a file in the Upload tab to see analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* KPI Cards — compact row */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            { label: "TOTAL ROWS", value: kpis.totalRows.toLocaleString() },
            { label: "AVG CONFIDENCE", value: `${kpis.avgConfidence}%` },
            { label: "HIGH CONF (>90%)", value: kpis.highConfCount.toLocaleString() },
            { label: "TOP CATEGORY", value: kpis.topCategory, sub: `${kpis.topCategoryPct}% of rows` },
          ].map(({ label, value, sub }) => (
            <div
              key={label}
              className="p-3"
              style={{ backgroundColor: "#161616" }}
            >
              <span style={{ fontSize: 9, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 400, display: "block", marginBottom: 4, fontFamily: "'Space Grotesk', sans-serif" }}>{label}</span>
              <p style={{ fontSize: 16, fontWeight: 300, color: "#ffffff", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.2 }}>{value}</p>
              {sub && <span style={{ fontSize: 10, color: "#555", fontFamily: "'JetBrains Mono', monospace", marginTop: 2, display: "block" }}>{sub}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Processing time + confidence filter */}
      <div className="flex items-center gap-4" style={{ padding: "2px 0" }}>
        {processingTime !== null && (
          <div className="flex items-center gap-2" style={{ color: "#555", fontSize: 11, fontFamily: "'Space Grotesk', sans-serif" }}>
            <Timer className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Processed in <strong style={{ color: "#ffffff", fontFamily: "'JetBrains Mono', monospace" }}>{processingTime}s</strong></span>
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <span style={{ fontSize: 9, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 400, whiteSpace: "nowrap", fontFamily: "'Space Grotesk', sans-serif" }}>
            MIN: <strong style={{ color: "#ffffff", fontFamily: "'JetBrains Mono', monospace" }}>{confidenceThreshold}%</strong>
          </span>
          <input
            type="range" min={0} max={95} step={5}
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
            className="w-24"
            style={{ accentColor: "#7C9CBF" }}
          />
          {confidenceThreshold > 0 && (
            <span style={{ fontSize: 10, padding: "2px 6px", backgroundColor: "#1e1e1e", color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>
              {filteredResults.length} / {results.length}
            </span>
          )}
        </div>
      </div>

      {/* Card 1: AI Confidence + Top Airports */}
      <div className="p-3" style={{ backgroundColor: "#161616" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h3 style={{ color: "#ffffff", fontWeight: 300, fontSize: 12, letterSpacing: "-0.02em", fontFamily: "'Space Grotesk', sans-serif" }}>AI Confidence</h3>
            <p style={{ fontSize: 9, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, marginTop: 2, fontFamily: "'Space Grotesk', sans-serif" }}>MODEL CERTAINTY ACROSS {filteredResults.length} RECORDS</p>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={confidenceData} margin={{ left: 0, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#555", fontSize: 8 }} />
                <YAxis tick={{ fill: "#555", fontSize: 8 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} wrapperStyle={TOOLTIP_WRAPPER_STYLE} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="count" fill="#7C9CBF" radius={[0, 0, 0, 0]} name="Records" barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 style={{ color: "#ffffff", fontWeight: 300, fontSize: 12, letterSpacing: "-0.02em", fontFamily: "'Space Grotesk', sans-serif" }}>Top Airports</h3>
            <p style={{ fontSize: 9, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, marginTop: 2, fontFamily: "'Space Grotesk', sans-serif" }}>REPORTS BY DEPARTURE STATION</p>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={airportData} layout="vertical" margin={{ left: 0, right: 16 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={48} tick={{ fill: "#555", fontSize: 8 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} wrapperStyle={TOOLTIP_WRAPPER_STYLE} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="count" fill="#8BAF8B" radius={[0, 0, 0, 0]} name="Reports" barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Card 2: Fleet Breakdown + Report Source */}
      <div className="p-3" style={{ backgroundColor: "#161616" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h3 style={{ color: "#ffffff", fontWeight: 300, fontSize: 12, letterSpacing: "-0.02em", fontFamily: "'Space Grotesk', sans-serif" }}>Fleet Breakdown</h3>
            <p style={{ fontSize: 9, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, marginTop: 2, fontFamily: "'Space Grotesk', sans-serif" }}>BY AIRCRAFT TYPE</p>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={fleetData} cx="50%" cy="45%" innerRadius={28} outerRadius={45} paddingAngle={0} dataKey="value">
                  {fleetData.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
                </Pie>
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div style={{ ...TOOLTIP_STYLE, padding: "6px 10px" }}>
                        {payload[0].name}: {payload[0].value}
                      </div>
                    );
                  }}
                />
                <Legend verticalAlign="bottom" height={24} wrapperStyle={{ fontSize: 8, color: "#555" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 style={{ color: "#ffffff", fontWeight: 300, fontSize: 12, letterSpacing: "-0.02em", fontFamily: "'Space Grotesk', sans-serif" }}>Report Source</h3>
            <p style={{ fontSize: 9, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, marginTop: 2, fontFamily: "'Space Grotesk', sans-serif" }}>CREW VS. PASSENGER</p>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="45%" outerRadius={45} dataKey="value" label={({ name, percent }: any) => `${(percent * 100).toFixed(0)}%`}>
                  {sourceData.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
                </Pie>
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div style={{ ...TOOLTIP_STYLE, padding: "6px 10px" }}>
                        {payload[0].name}: {payload[0].value}
                      </div>
                    );
                  }}
                />
                <Legend verticalAlign="bottom" height={24} wrapperStyle={{ fontSize: 8, color: "#555" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Volume Over Time */}
      <div className="p-3" style={{ backgroundColor: "#161616" }}>
        <h3 style={{ color: "#ffffff", fontWeight: 300, fontSize: 12, letterSpacing: "-0.02em", fontFamily: "'Space Grotesk', sans-serif" }}>Volume Over Time</h3>
        <p style={{ fontSize: 9, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, marginTop: 2, fontFamily: "'Space Grotesk', sans-serif" }}>DAILY TREND</p>
        <ResponsiveContainer width="100%" height={100}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
            <XAxis dataKey="date" tick={{ fill: "#555", fontSize: 7 }} />
            <YAxis tick={{ fill: "#555", fontSize: 8 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} wrapperStyle={TOOLTIP_WRAPPER_STYLE} cursor={{ stroke: "#2a2a2a" }} />
            <Line type="monotone" dataKey="count" stroke="#7C9CBF" strokeWidth={1.5} dot={{ r: 1.5, fill: "#7C9CBF" }} activeDot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// --- Main App ---
export default function App() {
  const [activePage, setActivePage] = useState<Page>("home");
  const [commentText, setCommentText] = useState("");
  const [predictions, setPredictions] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [checking, setChecking] = useState(true);
  const [bulkResults, setBulkResults] = useState<BulkResultRow[]>([]);
  const [uploads, setUploads] = useState<UploadSummary[]>([]);
  const [currentUploadId, setCurrentUploadId] = useState<number | null>(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  useEffect(() => {
    checkApiHealth();
    loadUploadHistory();
  }, []);

  const checkApiHealth = async () => {
    setChecking(true);
    try {
      const health = await checkHealth();
      if (health.status === "healthy") {
        setApiOnline(true);
        setModelLoaded((health.sub_classes_count && health.sub_classes_count > 0) || true);
      } else {
        setApiOnline(false);
        setModelLoaded(false);
      }
    } catch {
      setApiOnline(false);
      setModelLoaded(false);
    } finally {
      setChecking(false);
    }
  };

  const loadUploadHistory = async () => {
    try {
      const uploadList = await listUploads();
      setUploads(uploadList);
    } catch (err) {
      console.error("Failed to load upload history:", err);
    }
  };

  const loadUploadResults = async (uploadId: number) => {
    setLoadingUpload(true);
    try {
      const detail = await getUpload(uploadId);
      setCurrentUploadId(detail.id);
      setBulkResults(detail.results as BulkResultRow[]);
    } catch (err) {
      console.error("Failed to load upload:", err);
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleAnalyze = async () => {
    if (!commentText.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await predictText(commentText);
      setPredictions(result);
    } catch {
      alert("Failed to analyze feedback.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectSample = (text: string) => {
    setCommentText(text);
    setPredictions(null);
  };

  const handleBulkUploadComplete = async (results: any[], file: File, processingTimeSec: number) => {
    setBulkResults(results as BulkResultRow[]);
    setProcessingTime(processingTimeSec);
    try {
      const base64 = await fileToBase64(file);
      const saved = await saveUpload(file.name, base64, results);
      setCurrentUploadId(saved.id);
      const uploadList = await listUploads();
      setUploads(uploadList);
    } catch (err) {
      console.error("Failed to save upload:", err);
    }
  };

  const BackButton = () => (
    <button
      onClick={() => setActivePage("home")}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        fontSize: 10,
        fontWeight: 400,
        letterSpacing: "0.1em",
        textTransform: "uppercase" as const,
        color: "#6b6b6b",
        cursor: "pointer",
        marginBottom: 24,
        display: "inline-block",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "#6b6b6b"; }}
    >
      ← HOME
    </button>
  );

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#000000" }}>
      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        apiOnline={apiOnline}
        modelLoaded={modelLoaded}
      />

      {/* Main Content */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ backgroundColor: "#0D0D0D" }}
      >
        <div
          style={{
            maxWidth: activePage === "insights" ? 1400 : "var(--content-max-width, 1152px)",
            marginLeft: "auto",
            marginRight: "auto",
            paddingLeft: "var(--content-padding-x, 40px)",
            paddingRight: "var(--content-padding-x, 40px)",
            paddingTop: "var(--content-padding-y, 40px)",
            paddingBottom: "var(--content-padding-y, 40px)",
          }}
        >

          {/* HOME */}
          {activePage === "home" && (
            <HomePage
              onNavigate={setActivePage}
              modelLoaded={modelLoaded}
              totalUploads={uploads.length}
            />
          )}

          {/* CLASSIFY */}
          {activePage === "classify" && (
            <div className="space-y-8">
              <BackButton />
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 300, color: "#ffffff", letterSpacing: "-0.03em", fontFamily: "'Space Grotesk', sans-serif" }}>Feedback Demo</h1>
                <p style={{ fontSize: 10, color: "#6b6b6b", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 6, fontFamily: "'Space Grotesk', sans-serif" }}>
                  ENTER A SINGLE COMMENT TO SEE ITS PREDICTED SUBCATEGORY
                </p>
              </div>

              <SampleComments onSelectSample={handleSelectSample} />

              <div className="p-8" style={{ backgroundColor: "#161616" }}>
                <textarea
                  placeholder="Paste a crew feedback comment here..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full min-h-[120px] mb-6 p-4 text-sm"
                  style={{
                    backgroundColor: "#1a1a1a",
                    color: "#ffffff",
                    border: "1px solid #2a2a2a",
                    borderRadius: 0,
                    resize: "vertical",
                    outline: "none",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 300,
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#6b6b6b"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; }}
                />
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !modelLoaded}
                  className="w-full py-3 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "#ffffff",
                    color: "#0D0D0D",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 400,
                  }}
                  onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#e5e5e5"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
                >
                  {isAnalyzing ? "ANALYZING..." : modelLoaded ? "CLASSIFY FEEDBACK" : "MODEL UNAVAILABLE"}
                </button>

                {predictions && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm" style={{ color: "#2d8a4e" }}>
                        <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                        <span style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif" }}>PREDICTION COMPLETE</span>
                      </div>
                      <button
                        onClick={() => {
                          if (!predictions?.subPredictions) return;
                          const header = "Category,Confidence\n";
                          const rows = predictions.subPredictions.map((p: any) =>
                            `"${p.label}","${p.probability.toFixed(2)}%"`
                          ).join("\n");
                          const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = "classification_result.csv";
                          link.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="text-xs transition-colors"
                        style={{
                          background: "none",
                          border: "none",
                          color: "#6b6b6b",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          fontWeight: 400,
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontSize: 10,
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "#6b6b6b"; }}
                      >
                        DOWNLOAD REPORT
                      </button>
                    </div>
                    <PredictionCard subPredictions={predictions.subPredictions} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* UPLOAD */}
          {activePage === "upload" && (
            <div className="space-y-8">
              <BackButton />
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 300, color: "#ffffff", letterSpacing: "-0.03em", fontFamily: "'Space Grotesk', sans-serif" }}>Bulk Upload</h1>
                <p style={{ fontSize: 10, color: "#6b6b6b", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 6, fontFamily: "'Space Grotesk', sans-serif" }}>
                  UPLOAD A CSV OR EXCEL FILE TO CLASSIFY ALL ROWS AT ONCE
                </p>
              </div>

              <BulkUpload
                onPredict={async (text: string) => await predictText(text)}
                onUploadComplete={handleBulkUploadComplete}
              />

              {bulkResults.length > 0 && (
                <button
                  onClick={() => setActivePage("insights")}
                  className="w-full py-3 text-sm transition-colors"
                  style={{
                    backgroundColor: "#ffffff",
                    color: "#0D0D0D",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 400,
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#e5e5e5"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
                >
                  VIEW RESULTS
                </button>
              )}

              <UploadHistory
                uploads={uploads}
                currentUploadId={currentUploadId}
                onSelectUpload={loadUploadResults}
                loading={loadingUpload}
              />
            </div>
          )}

          {/* INSIGHTS — wider layout for charts */}
          {activePage === "insights" && (
            <div className="space-y-4" style={{ maxWidth: 1400, marginLeft: "auto", marginRight: "auto" }}>
              <BackButton />
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 300, color: "#ffffff", letterSpacing: "-0.03em", fontFamily: "'Space Grotesk', sans-serif" }}>Insights</h1>
                <p style={{ fontSize: 10, color: "#6b6b6b", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 4, fontFamily: "'Space Grotesk', sans-serif" }}>
                  ANALYTICS DASHBOARD FOR YOUR CLASSIFIED FEEDBACK DATA
                </p>
              </div>

              <AnalyticsDashboard results={bulkResults} processingTime={processingTime} />
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
