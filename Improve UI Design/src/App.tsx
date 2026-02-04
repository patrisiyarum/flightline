import { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  CheckCircle2,
  Timer,
  Download,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import * as XLSX from "xlsx";
import { PredictionCard } from "./components/PredictionCard";
import { SampleComments } from "./components/SampleComments";
import { BulkUpload } from "./components/BulkUpload";
import { UploadHistory, UploadSummary } from "./components/UploadHistory";

import { Sidebar, Page } from "./components/Sidebar";
import { HomePage, PipelineVisualization } from "./components/HomePage";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const API_URL = "https://feedback-webapp-5zc2.onrender.com";

// Hashed password for accessing real data (SHA-256)
const DATA_PASSWORD_HASH = "6a1cf639aef5ec43c46e152839e76859319a8847b86fc00e5e592b973b3829e0";

// Hash function using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- Demo Data ---
const DEMO_RESULTS: any[] = [
  { "Flt Date": "01/15/2026", "Flt#": "DL1234", "Dpt A/P": "ATL", "A/C": "B737", "Meal Type": "Lunch", "Pilot's Questions/Answers": "The pasta was cold when served. Sauce had separated and looked unappetizing.", "Predicted_Subcategory": "Food Quality/Portion", "Subcategory_Confidence": "94.2%" },
  { "Flt Date": "01/15/2026", "Flt#": "DL2456", "Dpt A/P": "JFK", "A/C": "A320", "Meal Type": "Dinner", "Pilot's Questions/Answers": "Missing crew meals entirely. Had to share with cabin crew.", "Predicted_Subcategory": "Catering Error", "Subcategory_Confidence": "97.8%" },
  { "Flt Date": "01/16/2026", "Flt#": "DL3789", "Dpt A/P": "LAX", "A/C": "B757", "Meal Type": "Breakfast", "Pilot's Questions/Answers": "Eggs were rubbery and bacon was burnt. Orange juice container was leaking.", "Predicted_Subcategory": "Food Quality/Portion", "Subcategory_Confidence": "91.5%" },
  { "Flt Date": "01/16/2026", "Flt#": "DL4521", "Dpt A/P": "ORD", "A/C": "A321", "Meal Type": "Lunch", "Pilot's Questions/Answers": "Chicken smelled off. Did not feel safe to eat. Discarded the meal.", "Predicted_Subcategory": "Food Safety", "Subcategory_Confidence": "96.3%" },
  { "Flt Date": "01/17/2026", "Flt#": "DL5678", "Dpt A/P": "ATL", "A/C": "B737", "Meal Type": "Dinner", "Pilot's Questions/Answers": "Portion size too small for a 6-hour flight. Still hungry after eating.", "Predicted_Subcategory": "Food Quality/Portion", "Subcategory_Confidence": "88.7%" },
  { "Flt Date": "01/17/2026", "Flt#": "DL6234", "Dpt A/P": "DFW", "A/C": "B777", "Meal Type": "Lunch", "Pilot's Questions/Answers": "Wrong meal loaded. Ordered vegetarian but received beef.", "Predicted_Subcategory": "Catering Error", "Subcategory_Confidence": "95.1%" },
  { "Flt Date": "01/18/2026", "Flt#": "DL7891", "Dpt A/P": "SFO", "A/C": "A350", "Meal Type": "Breakfast", "Pilot's Questions/Answers": "Coffee was lukewarm. Pastry was stale and hard.", "Predicted_Subcategory": "Food Quality/Portion", "Subcategory_Confidence": "89.4%" },
  { "Flt Date": "01/18/2026", "Flt#": "DL8123", "Dpt A/P": "SEA", "A/C": "B737", "Meal Type": "Dinner", "Pilot's Questions/Answers": "Salad had brown lettuce and wilted vegetables. Not fresh at all.", "Predicted_Subcategory": "Food Quality/Portion", "Subcategory_Confidence": "92.8%" },
  { "Flt Date": "01/19/2026", "Flt#": "DL9456", "Dpt A/P": "BOS", "A/C": "A220", "Meal Type": "Lunch", "Pilot's Questions/Answers": "Packaging was damaged. Food spilled inside the bag.", "Predicted_Subcategory": "Packaging/Presentation", "Subcategory_Confidence": "93.6%" },
  { "Flt Date": "01/19/2026", "Flt#": "DL1098", "Dpt A/P": "MIA", "A/C": "B767", "Meal Type": "Dinner", "Pilot's Questions/Answers": "Great meal today! Steak was cooked perfectly and vegetables were fresh.", "Predicted_Subcategory": "Positive Feedback", "Subcategory_Confidence": "98.2%" },
  { "Flt Date": "01/20/2026", "Flt#": "DL2345", "Dpt A/P": "ATL", "A/C": "B737", "Meal Type": "Breakfast", "Pilot's Questions/Answers": "Yogurt was expired by 2 days. Did not eat it.", "Predicted_Subcategory": "Food Safety", "Subcategory_Confidence": "97.1%" },
  { "Flt Date": "01/20/2026", "Flt#": "DL3456", "Dpt A/P": "JFK", "A/C": "A321", "Meal Type": "Lunch", "Pilot's Questions/Answers": "Utensils were missing from the meal kit.", "Predicted_Subcategory": "Catering Error", "Subcategory_Confidence": "91.9%" },
  { "Flt Date": "01/21/2026", "Flt#": "DL4567", "Dpt A/P": "LAX", "A/C": "B787", "Meal Type": "Dinner", "Pilot's Questions/Answers": "Fish was overcooked and dry. Rice was clumpy.", "Predicted_Subcategory": "Food Quality/Portion", "Subcategory_Confidence": "90.3%" },
  { "Flt Date": "01/21/2026", "Flt#": "DL5678", "Dpt A/P": "ORD", "A/C": "A319", "Meal Type": "Lunch", "Pilot's Questions/Answers": "Soup was excellent. Best meal I've had this month.", "Predicted_Subcategory": "Positive Feedback", "Subcategory_Confidence": "96.7%" },
  { "Flt Date": "01/22/2026", "Flt#": "DL6789", "Dpt A/P": "DEN", "A/C": "B737", "Meal Type": "Breakfast", "Pilot's Questions/Answers": "Only received 1 meal for 2 pilots. Had to split it.", "Predicted_Subcategory": "Catering Error", "Subcategory_Confidence": "98.4%" },
];

const DEMO_UPLOADS: UploadSummary[] = [
  { id: 1, file_name: "january_feedback_week3.xlsx", created_at: "2026-01-22T14:30:00Z", row_count: 15 },
  { id: 2, file_name: "pilot_reports_jan2026.csv", created_at: "2026-01-20T09:15:00Z", row_count: 42 },
  { id: 3, file_name: "crew_feedback_batch.xlsx", created_at: "2026-01-18T16:45:00Z", row_count: 28 },
];

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
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);
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

  const categoryData = useMemo(() => {
    if (!filteredResults.length) return [];
    const counts: Record<string, number> = {};
    filteredResults.forEach(row => {
      const category = row["Predicted_Subcategory"] || "Unknown";
      counts[category] = (counts[category] || 0) + 1;
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
    const buckets = {
      "V.Low\n(<50%)": 0,
      "Low\n(50-70%)": 0,
      "Med\n(70-80%)": 0,
      "High\n(80-90%)": 0,
      "V.High\n(>90%)": 0
    };
    filteredResults.forEach(row => {
      const confStr = row["Subcategory_Confidence"];
      if (confStr && typeof confStr === "string") {
        const val = parseFloat(confStr.replace("%", ""));
        if (val < 50) buckets["V.Low\n(<50%)"]++;
        else if (val < 70) buckets["Low\n(50-70%)"]++;
        else if (val < 80) buckets["Med\n(70-80%)"]++;
        else if (val < 90) buckets["High\n(80-90%)"]++;
        else buckets["V.High\n(>90%)"]++;
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

  const highConfPct = kpis ? ((kpis.highConfCount / kpis.totalRows) * 100).toFixed(0) : "0";

  return (
    <div>
      {/* Toolbar — processing time + confidence filter */}
      <div className="flex items-center gap-4" style={{ marginBottom: 8 }}>
        {processingTime !== null && (
          <div className="flex items-center gap-2" style={{ color: "#555", fontSize: 11, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.05em" }}>
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

      {/* Two-column dashboard */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

          {/* Summary Card — 2×2 metric grid */}
          {kpis && (
            <div style={{ backgroundColor: "#161616", padding: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "TOTAL ROWS", value: kpis.totalRows.toLocaleString() },
                  { label: "AVG CONFIDENCE", value: `${kpis.avgConfidence}%` },
                  { label: "HIGH CONF", value: `${highConfPct}%`, sub: `${kpis.highConfCount} of ${kpis.totalRows}` },
                  { label: "TOP CATEGORY", value: kpis.topCategory, sub: `${kpis.topCategoryPct}% of rows` },
                ].map(({ label, value, sub }) => (
                  <div key={label}>
                    <span style={{ fontSize: 10, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 400, display: "block", marginBottom: 4, fontFamily: "'Space Grotesk', sans-serif" }}>{label}</span>
                    <p style={{ fontSize: 20, fontWeight: 300, color: "#ffffff", fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</p>
                    {sub && <span style={{ fontSize: 10, color: "#555", fontFamily: "'Space Grotesk', sans-serif", marginTop: 2, display: "block" }}>{sub}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top 5 Airports */}
          <div style={{ backgroundColor: "#161616", padding: 16, flex: 1 }}>
            <h3 style={{ color: "#ffffff", fontWeight: 300, fontSize: 14, letterSpacing: "-0.02em", fontFamily: "'Space Grotesk', sans-serif" }}>Top Airports</h3>
            <p style={{ fontSize: 10, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8, marginTop: 2, fontFamily: "'Space Grotesk', sans-serif" }}>REPORTS BY DEPARTURE STATION</p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={airportData} layout="vertical" margin={{ left: 0, right: 16 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={48} tick={{ fill: "#555", fontSize: 10, fontFamily: "'Space Grotesk', sans-serif" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} wrapperStyle={TOOLTIP_WRAPPER_STYLE} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="count" fill="#8BAF8B" radius={[0, 0, 0, 0]} name="Reports" barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* AI Confidence Breakdown */}
          <div style={{ backgroundColor: "#161616", padding: 16 }}>
            <h3 style={{ color: "#ffffff", fontWeight: 300, fontSize: 14, letterSpacing: "-0.02em", fontFamily: "'Space Grotesk', sans-serif" }}>Confidence Breakdown</h3>
            <p style={{ fontSize: 10, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8, marginTop: 2, fontFamily: "'Space Grotesk', sans-serif" }}>MODEL CERTAINTY ACROSS {filteredResults.length} RECORDS</p>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={confidenceData} margin={{ left: 0, right: 8, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#555", fontSize: 9, fontFamily: "'Space Grotesk', sans-serif" }} />
                <YAxis tick={{ fill: "#555", fontSize: 9, fontFamily: "'Space Grotesk', sans-serif" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} wrapperStyle={TOOLTIP_WRAPPER_STYLE} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="count" fill="#7C9CBF" radius={[0, 0, 0, 0]} name="Records" barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

          {/* Volume Over Time — primary trend */}
          <div style={{ backgroundColor: "#161616", padding: 16, flex: 1 }}>
            <h3 style={{ color: "#ffffff", fontWeight: 300, fontSize: 14, letterSpacing: "-0.02em", fontFamily: "'Space Grotesk', sans-serif" }}>Volume Over Time</h3>
            <p style={{ fontSize: 10, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8, marginTop: 2, fontFamily: "'Space Grotesk', sans-serif" }}>DAILY TREND</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                <XAxis dataKey="date" tick={{ fill: "#555", fontSize: 9, fontFamily: "'Space Grotesk', sans-serif" }} />
                <YAxis tick={{ fill: "#555", fontSize: 10, fontFamily: "'Space Grotesk', sans-serif" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} wrapperStyle={TOOLTIP_WRAPPER_STYLE} cursor={{ stroke: "#2a2a2a" }} />
                <Line type="monotone" dataKey="count" stroke="#7C9CBF" strokeWidth={1.5} dot={{ r: 1.5, fill: "#7C9CBF" }} activeDot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Categories + Source — secondary, side-by-side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ backgroundColor: "#161616", padding: 12 }}>
              <h3 style={{ color: "#999", fontWeight: 300, fontSize: 13, letterSpacing: "-0.02em", fontFamily: "'Space Grotesk', sans-serif" }}>Categories</h3>
              <p style={{ fontSize: 9, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8, marginTop: 1, fontFamily: "'Space Grotesk', sans-serif" }}>BY PREDICTED CATEGORY</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categoryData} cx="30%" cy="50%" innerRadius={20} outerRadius={35} paddingAngle={0} dataKey="value">
                    {categoryData.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div style={{ ...TOOLTIP_STYLE, padding: "4px 8px", fontSize: 11 }}>
                          {payload[0].name}: {payload[0].value}
                        </div>
                      );
                    }}
                  />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    wrapperStyle={{ fontSize: 10, color: "#555", fontFamily: "'Space Grotesk', sans-serif", paddingLeft: 10 }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ backgroundColor: "#161616", padding: 16 }}>
              <h3 style={{ color: "#999", fontWeight: 300, fontSize: 13, letterSpacing: "-0.02em", fontFamily: "'Space Grotesk', sans-serif" }}>Source</h3>
              <p style={{ fontSize: 9, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16, marginTop: 1, fontFamily: "'Space Grotesk', sans-serif" }}>CREW VS. PASSENGER</p>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie 
                    data={sourceData} 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={32} 
                    dataKey="value"
                  >
                    {sourceData.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (!active || !payload?.length) return null;
                      const total = sourceData.reduce((sum, item) => sum + item.value, 0);
                      const percent = ((payload[0].value / total) * 100).toFixed(0);
                      return (
                        <div style={{ ...TOOLTIP_STYLE, padding: "4px 8px", fontSize: 11 }}>
                          {payload[0].name}: {payload[0].value} ({percent}%)
                        </div>
                      );
                    }}
                  />
                  <Legend verticalAlign="bottom" height={28} wrapperStyle={{ fontSize: 10, color: "#555", fontFamily: "'Space Grotesk', sans-serif" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
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
  
  // Demo mode state
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    checkApiHealth();
    if (isDemoMode) {
      // Load demo data
      setUploads(DEMO_UPLOADS);
      setBulkResults(DEMO_RESULTS);
      setProcessingTime(12.4);
    } else {
      loadUploadHistory();
    }
  }, [isDemoMode]);

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
    if (isDemoMode) return;
    try {
      const uploadList = await listUploads();
      setUploads(uploadList);
    } catch (err) {
      console.error("Failed to load upload history:", err);
    }
  };

  const handlePasswordSubmit = async () => {
    const inputHash = await hashPassword(passwordInput);
    if (inputHash === DATA_PASSWORD_HASH) {
      setIsDemoMode(false);
      setShowPasswordModal(false);
      setPasswordInput("");
      setPasswordError(false);
      setBulkResults([]);
      setUploads([]);
      loadUploadHistory();
    } else {
      setPasswordError(true);
    }
  };

  const handleSwitchToDemo = () => {
    setIsDemoMode(true);
    setBulkResults(DEMO_RESULTS);
    setUploads(DEMO_UPLOADS);
    setProcessingTime(12.4);
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

  // Password Modal Component
  const PasswordModal = () => (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={() => setShowPasswordModal(false)}
    >
      <div
        style={{
          backgroundColor: "#161616",
          border: "1px solid #2a2a2a",
          padding: 32,
          maxWidth: 400,
          width: "90%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-5 h-5" style={{ color: "#7C9CBF" }} strokeWidth={1.5} />
          <h2 style={{ fontSize: 16, color: "#ffffff", fontWeight: 400 }}>Access Real Data</h2>
        </div>
        <p style={{ fontSize: 12, color: "#6b6b6b", marginBottom: 20, lineHeight: 1.6 }}>
          Enter the password to access classified flight crew feedback data.
        </p>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <input
            type={showPassword ? "text" : "password"}
            value={passwordInput}
            onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") handlePasswordSubmit(); }}
            placeholder="Enter password"
            autoFocus
            autoComplete="off"
            style={{
              width: "100%",
              padding: "12px 40px 12px 12px",
              backgroundColor: "#1a1a1a",
              border: passwordError ? "1px solid #c0392b" : "1px solid #2a2a2a",
              color: "#ffffff",
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" style={{ color: "#6b6b6b" }} strokeWidth={1.5} />
            ) : (
              <Eye className="w-4 h-4" style={{ color: "#6b6b6b" }} strokeWidth={1.5} />
            )}
          </button>
        </div>
        {passwordError && (
          <p style={{ fontSize: 11, color: "#c0392b", marginBottom: 12 }}>Incorrect password. Please try again.</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => setShowPasswordModal(false)}
            style={{
              flex: 1,
              padding: "10px 16px",
              backgroundColor: "transparent",
              border: "1px solid #2a2a2a",
              color: "#6b6b6b",
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            CANCEL
          </button>
          <button
            onClick={handlePasswordSubmit}
            style={{
              flex: 1,
              padding: "10px 16px",
              backgroundColor: "#ffffff",
              border: "none",
              color: "#0D0D0D",
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            UNLOCK
          </button>
        </div>
      </div>
    </div>
  );

  // Demo Mode Banner
  const DemoModeBanner = () => (
    <div
      style={{
        backgroundColor: "#1a1a1a",
        borderBottom: "1px solid #2a2a2a",
        padding: "8px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div className="flex items-center gap-2">
        <span
          style={{
            fontSize: 9,
            color: "#7C9CBF",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 500,
            padding: "2px 8px",
            backgroundColor: "rgba(124, 156, 191, 0.15)",
          }}
        >
          DEMO MODE
        </span>
        <span style={{ fontSize: 11, color: "#6b6b6b" }}>
          Viewing sample data
        </span>
      </div>
      <button
        onClick={() => setShowPasswordModal(true)}
        className="flex items-center gap-2"
        style={{
          background: "none",
          border: "none",
          color: "#6b6b6b",
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          cursor: "pointer",
          padding: "4px 8px",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "#6b6b6b"; }}
      >
        <Lock className="w-3 h-3" strokeWidth={1.5} />
        ACCESS REAL DATA
      </button>
    </div>
  );

  // Real Data Banner
  const RealDataBanner = () => (
    <div
      style={{
        backgroundColor: "rgba(45, 138, 78, 0.1)",
        borderBottom: "1px solid rgba(45, 138, 78, 0.3)",
        padding: "8px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div className="flex items-center gap-2">
        <span
          style={{
            fontSize: 9,
            color: "#2d8a4e",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 500,
            padding: "2px 8px",
            backgroundColor: "rgba(45, 138, 78, 0.15)",
          }}
        >
          AUTHENTICATED
        </span>
        <span style={{ fontSize: 11, color: "#6b6b6b" }}>
          Viewing classified data
        </span>
      </div>
      <button
        onClick={handleSwitchToDemo}
        style={{
          background: "none",
          border: "none",
          color: "#6b6b6b",
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          cursor: "pointer",
          padding: "4px 8px",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "#6b6b6b"; }}
      >
        SWITCH TO DEMO
      </button>
    </div>
  );

  return (
    <>
      {showPasswordModal && <PasswordModal />}
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
        className="flex-1 overflow-y-auto flex flex-col"
        style={{ backgroundColor: "#0D0D0D" }}
      >
        {/* Mode Banner */}
        {isDemoMode ? <DemoModeBanner /> : <RealDataBanner />}

        <div
          className="flex-1"
          style={{
            maxWidth: activePage === "home" ? "var(--content-max-width, 1400px)" : "none",
            marginLeft: activePage === "home" ? "auto" : 0,
            marginRight: activePage === "home" ? "auto" : 0,
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
            <div className="space-y-8" style={{ width: "100%" }}>
              <BackButton />
              <div style={{ marginBottom: 16 }}>
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && commentText.trim() && modelLoaded && !isAnalyzing) {
                      e.preventDefault();
                      handleAnalyze();
                    }
                  }}
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
                    <PredictionCard subPredictions={predictions.subPredictions} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* UPLOAD */}
          {activePage === "upload" && (
            <div className="space-y-8" style={{ width: "100%" }}>
              <BackButton />
              <div style={{ marginBottom: 16 }}>
                <h1 style={{ fontSize: 24, fontWeight: 300, color: "#ffffff", letterSpacing: "-0.03em", fontFamily: "'Space Grotesk', sans-serif" }}>Bulk Upload</h1>
                <p style={{ fontSize: 10, color: "#6b6b6b", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 6, fontFamily: "'Space Grotesk', sans-serif" }}>
                  UPLOAD A FILE WITH COMMENTS TO CLASSIFY THEM IN BULK
                </p>
              </div>

              <BulkUpload
                onPredict={async (text: string) => await predictText(text)}
                onUploadComplete={handleBulkUploadComplete}
              />

              {bulkResults.length > 0 && (
                <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setActivePage("insights")}
                    className="flex items-center gap-2 transition-colors"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "'Space Grotesk', sans-serif",
                      color: "#ffffff",
                      padding: 0,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                  >
                    <span style={{ fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" }}>View Results</span>
                    <span style={{ fontSize: 18 }}>→</span>
                  </button>
                </div>
              )}

              <UploadHistory
                uploads={uploads}
                currentUploadId={currentUploadId}
                onSelectUpload={loadUploadResults}
                loading={loadingUpload}
              />
            </div>
          )}

          {/* INSIGHTS */}
          {activePage === "insights" && (
            <div className="space-y-8" style={{ width: "100%" }}>
              <BackButton />
              <div style={{ marginBottom: 16 }}>
                <h1 style={{ fontSize: 24, fontWeight: 300, color: "#ffffff", letterSpacing: "-0.03em", fontFamily: "'Space Grotesk', sans-serif" }}>Insights</h1>
                <p style={{ fontSize: 10, color: "#6b6b6b", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 6, fontFamily: "'Space Grotesk', sans-serif" }}>
                  ANALYTICS DASHBOARD FOR YOUR CLASSIFIED FEEDBACK DATA
                </p>
              </div>

              <AnalyticsDashboard results={bulkResults} processingTime={processingTime} />

              {bulkResults.length > 0 && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
                  <button
                    onClick={() => {
                      try {
                        const workbook = XLSX.utils.book_new();
                        
                        // Get all columns, separate prediction columns to put them last
                        const allCols = Object.keys(bulkResults[0] || {});
                        const originalCols = allCols.filter(c => c !== "Predicted_Subcategory" && c !== "Subcategory_Confidence");
                        
                        // Rename and reorder columns
                        const reorderedResults = bulkResults.map(row => {
                          const newRow: any = {};
                          originalCols.forEach(col => { newRow[col] = row[col]; });
                          newRow["★ Predicted Subcategory"] = row["Predicted_Subcategory"];
                          newRow["★ Confidence"] = row["Subcategory_Confidence"];
                          return newRow;
                        });
                        
                        const orderedCols = [...originalCols, "★ Predicted Subcategory", "★ Confidence"];
                        const worksheet = XLSX.utils.json_to_sheet(reorderedResults, { header: orderedCols });
                        
                        // Set column widths
                        const colWidths = orderedCols.map(col => {
                          if (col.includes("Subcategory") || col.includes("Questions") || col.includes("Answers")) return { wch: 30 };
                          if (col.includes("Confidence")) return { wch: 15 };
                          return { wch: 12 };
                        });
                        worksheet["!cols"] = colWidths;
                        
                        XLSX.utils.book_append_sheet(workbook, worksheet, "Classified Results");
                        XLSX.writeFile(workbook, "classified_results.xlsx");
                      } catch (err) {
                        alert("Failed to generate Excel file.");
                      }
                    }}
                    className="flex items-center gap-2 transition-colors"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "'Space Grotesk', sans-serif",
                      color: "#ffffff",
                      padding: 0,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                  >
                    <Download className="w-4 h-4" strokeWidth={1.5} />
                    <span style={{ fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" }}>Download Results</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ABOUT */}
          {activePage === "about" && (
            <div className="space-y-8" style={{ width: "100%" }}>
              <BackButton />
              <div style={{ marginBottom: 16 }}>
                <h1 style={{ fontSize: 24, fontWeight: 300, color: "#ffffff", letterSpacing: "-0.03em", fontFamily: "'Space Grotesk', sans-serif" }}>About</h1>
                <p style={{ fontSize: 10, color: "#6b6b6b", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 6, fontFamily: "'Space Grotesk', sans-serif" }}>
                  HOW THE CLASSIFICATION MODEL WORKS
                </p>
              </div>

              {/* Pipeline Visualization */}
              <div style={{ backgroundColor: "#161616", padding: "32px 24px", borderTop: "1px solid #2a2a2a" }}>
                <h3 style={{ fontSize: 10, fontWeight: 400, color: "#6b6b6b", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: 24, textAlign: "center" }}>
                  PROCESSING PIPELINE
                </h3>
                <PipelineVisualization />
              </div>

              {/* About Content */}
              <div style={{ backgroundColor: "#161616", padding: "32px 24px", borderTop: "1px solid #2a2a2a" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 48 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, color: "#999", lineHeight: 1.9, fontWeight: 300 }}>
                      Powered by a fine-tuned{" "}
                      <a 
                        href="https://www.nvidia.com/en-us/glossary/bert/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: "#7C9CBF", textDecoration: "none" }}
                        onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}
                      >BERT</a> model. Transforms hours of manual categorization into seconds of automated processing. What took 83+ hours now takes under 60 seconds.
                    </p>
                  </div>
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 32, color: "#ffffff", fontFamily: "'JetBrains Mono', monospace", fontWeight: 300 }}>1000+</span>
                    <span style={{ fontSize: 10, color: "#6b6b6b", display: "block", letterSpacing: "0.08em", marginTop: 6 }}>COMMENTS/MIN</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
    </>
  );
}
