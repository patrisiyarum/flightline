import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Textarea } from "./components/ui/textarea";
import { Badge } from "./components/ui/badge";
import { Alert, AlertDescription } from "./components/ui/alert";
import {
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Tag,
  Download,
  Timer,
  TrendingUp,
  Target,
} from "lucide-react";
import { PredictionCard } from "./components/PredictionCard";
import { SampleComments } from "./components/SampleComments";
import { BulkUpload } from "./components/BulkUpload";
import { UploadHistory, UploadSummary } from "./components/UploadHistory";
import { ResultsTable } from "./components/ResultsTable";
import { Sidebar, Page } from "./components/Sidebar";
import { HomePage } from "./components/HomePage";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import Papa from "papaparse";

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

// --- Chart Colors (inline to survive Tailwind purge) ---
const CHART_COLORS = ["#1DB954", "#1ed760", "#169c46", "#b3b3b3", "#535353", "#ffffff"];
const TOOLTIP_STYLE = {
  backgroundColor: "#282828",
  color: "#ffffff",
  border: "1px solid #404040",
  borderRadius: "8px",
};
const LABEL_COLOR = "#b3b3b3";

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

  const handleExportCSV = () => {
    if (!filteredResults.length) return;
    const csv = Papa.unparse(filteredResults);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "classified_results.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

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
        <BarChart3 className="w-16 h-16 mb-4 opacity-30" style={{ color: "#b3b3b3" }} />
        <p className="text-white font-semibold mb-1">No data yet</p>
        <p className="text-sm" style={{ color: "#b3b3b3" }}>Upload a file in the Upload tab to see analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: BarChart3, label: "Total Rows", value: kpis.totalRows.toLocaleString(), color: "#1DB954" },
            { icon: Target, label: "Avg Confidence", value: `${kpis.avgConfidence}%`, color: "#1ed760" },
            { icon: TrendingUp, label: "High Confidence", value: kpis.highConfCount.toLocaleString(), color: "#1DB954" },
            { icon: Tag, label: "Top Category", value: kpis.topCategory, color: "#b3b3b3", sub: `${kpis.topCategoryPct}% of rows` },
          ].map(({ icon: Icon, label, value, color, sub }) => (
            <div key={label} className="rounded-lg p-5" style={{ backgroundColor: "#181818" }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color }} />
                <span className="text-xs" style={{ color: "#b3b3b3" }}>{label}</span>
              </div>
              <p className="text-xl font-bold text-white">{value}</p>
              {sub && <span className="text-xs" style={{ color: "#b3b3b3" }}>{sub}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ backgroundColor: "#181818" }}>
        <div className="flex items-center gap-6">
          {processingTime !== null && (
            <div className="flex items-center gap-2 text-sm" style={{ color: "#b3b3b3" }}>
              <Timer className="w-4 h-4" />
              <span>Processed in <strong className="text-white">{processingTime}s</strong></span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <label className="text-sm whitespace-nowrap" style={{ color: "#b3b3b3" }}>
              Min. Confidence: <strong className="text-white">{confidenceThreshold}%</strong>
            </label>
            <input
              type="range" min={0} max={95} step={5}
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-32"
              style={{ accentColor: "#1DB954" }}
            />
          </div>
          {confidenceThreshold > 0 && (
            <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: "#282828", color: "#b3b3b3" }}>
              {filteredResults.length} / {results.length}
            </span>
          )}
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-transform hover:scale-105"
          style={{ backgroundColor: "#1DB954", color: "#000000" }}
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg p-5" style={{ backgroundColor: "#181818" }}>
          <h3 className="text-white font-bold mb-1">AI Confidence</h3>
          <p className="text-xs mb-4" style={{ color: "#b3b3b3" }}>Model certainty across {filteredResults.length} records</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={confidenceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#282828" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: LABEL_COLOR, fontSize: 11 }} />
              <YAxis tick={{ fill: LABEL_COLOR }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "transparent" }} />
              <Bar dataKey="count" fill="#1DB954" radius={[4, 4, 0, 0]} name="Records" barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg p-5" style={{ backgroundColor: "#181818" }}>
          <h3 className="text-white font-bold mb-1">Top Airports</h3>
          <p className="text-xs mb-4" style={{ color: "#b3b3b3" }}>Reports by departure station</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={airportData} layout="vertical" margin={{ left: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={40} tick={{ fill: LABEL_COLOR, fontSize: 10 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "transparent" }} />
              <Bar dataKey="count" fill="#1ed760" radius={[0, 4, 4, 0]} name="Reports" barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg p-5" style={{ backgroundColor: "#181818" }}>
        <h3 className="text-white font-bold mb-1">Volume Over Time</h3>
        <p className="text-xs mb-4" style={{ color: "#b3b3b3" }}>Daily trend based on flight date</p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
            <XAxis dataKey="date" tick={{ fill: LABEL_COLOR }} fontSize={11} />
            <YAxis tick={{ fill: LABEL_COLOR }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Line type="monotone" dataKey="count" stroke="#1DB954" strokeWidth={3} dot={{ r: 4, fill: "#1DB954" }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg p-5" style={{ backgroundColor: "#181818" }}>
          <h3 className="text-white font-bold mb-1">Fleet Breakdown</h3>
          <p className="text-xs mb-4" style={{ color: "#b3b3b3" }}>Issues by aircraft type</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={fleetData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={3} dataKey="value">
                {fleetData.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg p-5" style={{ backgroundColor: "#181818" }}>
          <h3 className="text-white font-bold mb-1">Report Source</h3>
          <p className="text-xs mb-4" style={{ color: "#b3b3b3" }}>Crew vs. passenger meals</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={sourceData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label>
                {sourceData.map((_, i) => (<Cell key={i} fill={i === 0 ? "#1DB954" : "#535353"} />))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
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
      if (uploadList.length > 0) await loadUploadResults(uploadList[0].id);
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
        style={{ backgroundColor: "#121212", borderTopLeftRadius: 8 }}
      >
        <div className="max-w-5xl mx-auto px-8 py-8">

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
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Classify Feedback</h1>
                <p className="text-sm" style={{ color: "#b3b3b3" }}>
                  Enter a single comment to see its predicted subcategory.
                </p>
              </div>

              <SampleComments onSelectSample={handleSelectSample} />

              <div className="rounded-lg p-6" style={{ backgroundColor: "#181818" }}>
                <Textarea
                  placeholder="Paste a crew feedback comment here..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-[120px] mb-4 border-0"
                  style={{ backgroundColor: "#282828", color: "#ffffff" }}
                />
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !modelLoaded}
                  className="w-full py-3 rounded-full text-sm font-bold transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#1DB954", color: "#000000" }}
                >
                  {isAnalyzing ? "Analyzing..." : modelLoaded ? "Classify Feedback" : "Model Unavailable"}
                </button>

                {predictions && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-4 text-sm" style={{ color: "#1DB954" }}>
                      <CheckCircle2 className="w-4 h-4" />
                      Prediction complete
                    </div>
                    <PredictionCard subPredictions={predictions.subPredictions} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* UPLOAD */}
          {activePage === "upload" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Bulk Upload</h1>
                <p className="text-sm" style={{ color: "#b3b3b3" }}>
                  Upload a CSV or Excel file to classify all rows at once.
                </p>
              </div>

              <UploadHistory
                uploads={uploads}
                currentUploadId={currentUploadId}
                onSelectUpload={loadUploadResults}
                loading={loadingUpload}
              />

              <BulkUpload
                onPredict={async (text: string) => await predictText(text)}
                onUploadComplete={handleBulkUploadComplete}
              />

              <ResultsTable results={bulkResults} />
            </div>
          )}

          {/* INSIGHTS */}
          {activePage === "insights" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Insights</h1>
                <p className="text-sm" style={{ color: "#b3b3b3" }}>
                  Analytics dashboard for your classified feedback data.
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
