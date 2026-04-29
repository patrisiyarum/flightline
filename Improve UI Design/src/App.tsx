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

const API_URL = "https://feedback-webapp-hn6g.onrender.com";

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

// Real classified data uploads
const REAL_UPLOADS: UploadSummary[] = [
  { id: 100, file_name: "crew_feedback_classified.xlsx", created_at: "2026-02-03T10:00:00Z", row_count: 156 },
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

// --- Chart Colors (three-color palette with green) ---
const CHART_COLORS = ["#10a37f", "#6366f1", "#f59e0b", "#10a37f", "#6366f1", "#f59e0b"];
const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: "#2f2f2f",
  color: "#ececec",
  border: "1px solid #4e4e4e",
  borderRadius: 8,
  fontFamily: "system-ui, -apple-system, sans-serif",
  fontSize: 12,
  zIndex: 10,
};
const TOOLTIP_WRAPPER_STYLE: React.CSSProperties = {
  zIndex: 10,
  outline: "none",
};
const LABEL_COLOR = "#8e8e8e";

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
        <BarChart3 className="w-16 h-16 mb-4 opacity-30" style={{ color: "#6e6e6e" }} strokeWidth={1.5} />
        <p style={{ fontWeight: 500, color: "#ececec", fontFamily: "system-ui, -apple-system, sans-serif" }}>No data yet</p>
        <p className="text-sm" style={{ color: "#8e8e8e", fontFamily: "system-ui, -apple-system, sans-serif" }}>Upload a file in the Upload tab to see analytics.</p>
      </div>
    );
  }

  const highConfPct = kpis ? ((kpis.highConfCount / kpis.totalRows) * 100).toFixed(0) : "0";

  return (
    <div>
      {/* Toolbar — processing time + confidence filter */}
      <div className="flex items-center gap-4" style={{ marginBottom: 16 }}>
        {processingTime !== null && (
          <div className="flex items-center gap-2" style={{ color: "#8e8e8e", fontSize: 13, fontFamily: "system-ui, -apple-system, sans-serif" }}>
            <Timer className="w-4 h-4" strokeWidth={1.5} />
            <span>Processed in <strong style={{ color: "#ececec" }}>{processingTime}s</strong></span>
          </div>
        )}
        <div className="flex items-center gap-3 ml-auto">
          <span style={{ fontSize: 12, color: "#8e8e8e", fontFamily: "system-ui, -apple-system, sans-serif" }}>
            Min: <strong style={{ color: "#ececec" }}>{confidenceThreshold}%</strong>
          </span>
          <input
            type="range" min={0} max={95} step={5}
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
            className="w-28"
            style={{ accentColor: "#10a37f" }}
          />
          {confidenceThreshold > 0 && (
            <span style={{ fontSize: 12, padding: "4px 10px", backgroundColor: "#2f2f2f", color: "#ececec", borderRadius: 12, fontFamily: "system-ui, -apple-system, sans-serif" }}>
              {filteredResults.length} / {results.length}
            </span>
          )}
        </div>
      </div>

      {/* Two-column dashboard */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Summary Card — 2×2 metric grid */}
          {kpis && (
            <div style={{ backgroundColor: "#212121", border: "1px solid #3e3e3e", borderRadius: 12, padding: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { label: "Total Rows", value: kpis.totalRows.toLocaleString() },
                  { label: "Avg Confidence", value: `${kpis.avgConfidence}%` },
                  { label: "High Conf", value: `${highConfPct}%`, sub: `${kpis.highConfCount} of ${kpis.totalRows}` },
                  { label: "Top Category", value: kpis.topCategory, sub: `${kpis.topCategoryPct}% of rows` },
                ].map(({ label, value, sub }) => (
                  <div key={label}>
                    <span style={{ fontSize: 12, color: "#8e8e8e", fontWeight: 400, display: "block", marginBottom: 6, fontFamily: "system-ui, -apple-system, sans-serif" }}>{label}</span>
                    <p style={{ fontSize: 22, fontWeight: 600, color: "#ececec", fontFamily: "system-ui, -apple-system, sans-serif", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</p>
                    {sub && <span style={{ fontSize: 11, color: "#6e6e6e", fontFamily: "system-ui, -apple-system, sans-serif", marginTop: 4, display: "block" }}>{sub}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top 5 Airports */}
          <div style={{ backgroundColor: "#212121", border: "1px solid #3e3e3e", borderRadius: 12, padding: 20, flex: 1 }}>
            <h3 style={{ color: "#ececec", fontWeight: 500, fontSize: 14, fontFamily: "system-ui, -apple-system, sans-serif" }}>Top Airports</h3>
            <p style={{ fontSize: 12, color: "#6e6e6e", marginBottom: 12, marginTop: 4, fontFamily: "system-ui, -apple-system, sans-serif" }}>Reports by departure station</p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={airportData} layout="vertical" margin={{ left: 0, right: 16 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={48} tick={{ fill: "#8e8e8e", fontSize: 11, fontFamily: "system-ui, -apple-system, sans-serif" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} wrapperStyle={TOOLTIP_WRAPPER_STYLE} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                <Bar dataKey="count" fill="#10a37f" radius={[4, 4, 4, 4]} name="Reports" barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* AI Confidence Breakdown */}
          <div style={{ backgroundColor: "#212121", border: "1px solid #3e3e3e", borderRadius: 12, padding: 20 }}>
            <h3 style={{ color: "#ececec", fontWeight: 500, fontSize: 14, fontFamily: "system-ui, -apple-system, sans-serif" }}>Confidence Breakdown</h3>
            <p style={{ fontSize: 12, color: "#6e6e6e", marginBottom: 12, marginTop: 4, fontFamily: "system-ui, -apple-system, sans-serif" }}>Model certainty across {filteredResults.length} records</p>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={confidenceData} margin={{ left: 0, right: 8, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3e3e3e" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#8e8e8e", fontSize: 10, fontFamily: "system-ui, -apple-system, sans-serif" }} />
                <YAxis tick={{ fill: "#8e8e8e", fontSize: 10, fontFamily: "system-ui, -apple-system, sans-serif" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} wrapperStyle={TOOLTIP_WRAPPER_STYLE} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                <Bar dataKey="count" fill="#ececec" radius={[4, 4, 4, 4]} name="Records" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Volume Over Time — primary trend */}
          <div style={{ backgroundColor: "#212121", border: "1px solid #3e3e3e", borderRadius: 12, padding: 20, flex: 1 }}>
            <h3 style={{ color: "#ececec", fontWeight: 500, fontSize: 14, fontFamily: "system-ui, -apple-system, sans-serif" }}>Volume Over Time</h3>
            <p style={{ fontSize: 12, color: "#6e6e6e", marginBottom: 12, marginTop: 4, fontFamily: "system-ui, -apple-system, sans-serif" }}>Daily trend</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3e3e3e" />
                <XAxis dataKey="date" tick={{ fill: "#8e8e8e", fontSize: 10, fontFamily: "system-ui, -apple-system, sans-serif" }} />
                <YAxis tick={{ fill: "#8e8e8e", fontSize: 11, fontFamily: "system-ui, -apple-system, sans-serif" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} wrapperStyle={TOOLTIP_WRAPPER_STYLE} cursor={{ stroke: "#4e4e4e" }} />
                <Line type="monotone" dataKey="count" stroke="#10a37f" strokeWidth={2} dot={{ r: 3, fill: "#10a37f" }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Categories + Source — secondary, side-by-side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ backgroundColor: "#212121", border: "1px solid #3e3e3e", borderRadius: 12, padding: 16 }}>
              <h3 style={{ color: "#ececec", fontWeight: 500, fontSize: 14, fontFamily: "system-ui, -apple-system, sans-serif" }}>Categories</h3>
              <p style={{ fontSize: 11, color: "#6e6e6e", marginBottom: 12, marginTop: 2, fontFamily: "system-ui, -apple-system, sans-serif" }}>By predicted category</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categoryData} cx="30%" cy="50%" innerRadius={22} outerRadius={38} paddingAngle={2} dataKey="value">
                    {categoryData.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div style={{ ...TOOLTIP_STYLE, padding: "6px 10px", fontSize: 12 }}>
                          {payload[0].name}: {payload[0].value}
                        </div>
                      );
                    }}
                  />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    wrapperStyle={{ fontSize: 11, color: "#8e8e8e", fontFamily: "system-ui, -apple-system, sans-serif", paddingLeft: 10 }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ backgroundColor: "#212121", border: "1px solid #3e3e3e", borderRadius: 12, padding: 16 }}>
              <h3 style={{ color: "#ececec", fontWeight: 500, fontSize: 14, fontFamily: "system-ui, -apple-system, sans-serif" }}>Source</h3>
              <p style={{ fontSize: 11, color: "#6e6e6e", marginBottom: 16, marginTop: 2, fontFamily: "system-ui, -apple-system, sans-serif" }}>Crew vs. passenger</p>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie 
                    data={sourceData} 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={34} 
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
                        <div style={{ ...TOOLTIP_STYLE, padding: "6px 10px", fontSize: 12 }}>
                          {payload[0].name}: {payload[0].value} ({percent}%)
                        </div>
                      );
                    }}
                  />
                  <Legend verticalAlign="bottom" height={28} wrapperStyle={{ fontSize: 11, color: "#8e8e8e", fontFamily: "system-ui, -apple-system, sans-serif" }} />
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
      // If no uploads from API, use the real data fallback
      if (uploadList.length === 0) {
        setUploads(REAL_UPLOADS);
      } else {
        setUploads(uploadList);
      }
    } catch (err) {
      console.error("Failed to load upload history:", err);
      // On error, show the real data uploads
      setUploads(REAL_UPLOADS);
    }
  };

  const handlePasswordSubmit = async () => {
    const inputHash = await hashPassword(passwordInput);
    if (inputHash === DATA_PASSWORD_HASH) {
      setIsDemoMode(false);
      setShowPasswordModal(false);
      setPasswordInput("");
      setPasswordError(false);
      setBulkResults(DEMO_RESULTS); // Keep showing results for demo
      setUploads(REAL_UPLOADS);
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
        fontSize: 13,
        fontWeight: 400,
        color: "#8e8e8e",
        cursor: "pointer",
        marginBottom: 24,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "system-ui, -apple-system, sans-serif",
        transition: "color 0.15s ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = "#ececec"; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "#8e8e8e"; }}
    >
      ← Back to home
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
        backgroundColor: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={() => setShowPasswordModal(false)}
    >
      <div
        style={{
          backgroundColor: "#212121",
          border: "1px solid #3e3e3e",
          borderRadius: 16,
          padding: 32,
          maxWidth: 400,
          width: "90%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-5 h-5" style={{ color: "#ececec" }} strokeWidth={1.5} />
          <h2 style={{ fontSize: 18, color: "#ececec", fontWeight: 600, fontFamily: "system-ui, -apple-system, sans-serif" }}>Access Real Data</h2>
        </div>
        <p style={{ fontSize: 14, color: "#8e8e8e", marginBottom: 24, lineHeight: 1.6, fontFamily: "system-ui, -apple-system, sans-serif" }}>
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
              padding: "14px 44px 14px 16px",
              backgroundColor: "#171717",
              border: passwordError ? "1px solid #ef4444" : "1px solid #3e3e3e",
              borderRadius: 8,
              color: "#ececec",
              fontSize: 15,
              outline: "none",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" style={{ color: "#6e6e6e" }} strokeWidth={1.5} />
            ) : (
              <Eye className="w-5 h-5" style={{ color: "#6e6e6e" }} strokeWidth={1.5} />
            )}
          </button>
        </div>
        {passwordError && (
          <p style={{ fontSize: 13, color: "#ef4444", marginBottom: 12, fontFamily: "system-ui, -apple-system, sans-serif" }}>Incorrect password. Please try again.</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => setShowPasswordModal(false)}
            style={{
              flex: 1,
              padding: "12px 16px",
              backgroundColor: "transparent",
              border: "1px solid #3e3e3e",
              borderRadius: 20,
              color: "#9b9b9b",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "system-ui, -apple-system, sans-serif",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#4e4e4e"; e.currentTarget.style.color = "#ececec"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#3e3e3e"; e.currentTarget.style.color = "#9b9b9b"; }}
          >
            Cancel
          </button>
          <button
            onClick={handlePasswordSubmit}
            style={{
              flex: 1,
              padding: "12px 16px",
              backgroundColor: "#10a37f",
              border: "none",
              borderRadius: 20,
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "system-ui, -apple-system, sans-serif",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#0d8a6a"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#10a37f"; }}
          >
            Unlock
          </button>
        </div>
      </div>
    </div>
  );

  // Demo Mode Banner
  const DemoModeBanner = () => (
    <div
      style={{
        backgroundColor: "#171717",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div className="flex items-center gap-3">
        <span
          style={{
            fontSize: 11,
            color: "#ececec",
            fontWeight: 500,
            padding: "4px 10px",
            backgroundColor: "#2f2f2f",
            borderRadius: 12,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Demo
        </span>
        <span style={{ fontSize: 13, color: "#8e8e8e", fontFamily: "system-ui, -apple-system, sans-serif" }}>
          Viewing sample data
        </span>
      </div>
      <button
        onClick={() => setShowPasswordModal(true)}
        className="flex items-center gap-2"
        style={{
          background: "none",
          border: "none",
          color: "#8e8e8e",
          fontSize: 13,
          cursor: "pointer",
          padding: "6px 12px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          transition: "color 0.15s ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#ececec"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "#8e8e8e"; }}
      >
        <Lock className="w-4 h-4" strokeWidth={1.5} />
        Access real data
      </button>
    </div>
  );

  // Real Data Banner
  const RealDataBanner = () => (
    <div
      style={{
        backgroundColor: "rgba(16, 163, 127, 0.1)",
        borderBottom: "1px solid rgba(16, 163, 127, 0.2)",
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div className="flex items-center gap-3">
        <span
          style={{
            fontSize: 11,
            color: "#10a37f",
            fontWeight: 500,
            padding: "4px 10px",
            backgroundColor: "rgba(16, 163, 127, 0.15)",
            borderRadius: 12,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Authenticated
        </span>
        <span style={{ fontSize: 13, color: "#8e8e8e", fontFamily: "system-ui, -apple-system, sans-serif" }}>
          Viewing classified data
        </span>
      </div>
      <button
        onClick={handleSwitchToDemo}
        style={{
          background: "none",
          border: "none",
          color: "#8e8e8e",
          fontSize: 13,
          cursor: "pointer",
          padding: "6px 12px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          transition: "color 0.15s ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#ececec"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "#8e8e8e"; }}
      >
        Switch to demo
      </button>
    </div>
  );

  return (
    <>
      {showPasswordModal && <PasswordModal />}
    <div className="flex min-h-screen" style={{ backgroundColor: "#171717" }}>
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
        style={{ backgroundColor: "#171717" }}
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
            <div style={{ width: "100%", maxWidth: 800, margin: "0 auto" }}>
              <BackButton />
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 36, fontWeight: 600, color: "#ececec", fontFamily: "system-ui, -apple-system, sans-serif" }}>Feedback Demo</h1>
                <p style={{ fontSize: 16, color: "#8e8e8e", lineHeight: 1.6, marginTop: 12, fontFamily: "system-ui, -apple-system, sans-serif" }}>
                  Enter a comment to see how the model classifies it.
                </p>
              </div>

              <SampleComments onSelectSample={handleSelectSample} />

              {/* Input area */}
              <div style={{ marginTop: 24 }}>
                <div 
                  style={{ 
                    backgroundColor: "#212121", 
                    border: "1px solid #3e3e3e", 
                    padding: 24,
                    borderRadius: 12,
                  }}
                >
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
                    className="w-full"
                    style={{
                      backgroundColor: "transparent",
                      color: "#ececec",
                      border: "none",
                      borderRadius: 0,
                      resize: "none",
                      outline: "none",
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      fontWeight: 400,
                      fontSize: 15,
                      lineHeight: 1.7,
                      minHeight: 140,
                    }}
                  />
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !modelLoaded}
                  className="w-full transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "#ececec",
                    color: "#171717",
                    fontWeight: 500,
                    fontSize: 15,
                    marginTop: 16,
                    padding: "16px 24px",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    borderRadius: 20,
                    border: "none",
                  }}
                  onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#d4d4d4"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ececec"; }}
                >
                  {isAnalyzing ? "Analyzing..." : modelLoaded ? "Classify feedback" : "Model unavailable"}
                </button>
              </div>

              {predictions && (
                <PredictionCard subPredictions={predictions.subPredictions} />
              )}
            </div>
          )}

          {/* UPLOAD */}
          {activePage === "upload" && (
            <div style={{ width: "100%", maxWidth: 900, margin: "0 auto" }}>
              <BackButton />
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 36, fontWeight: 600, color: "#ececec", fontFamily: "system-ui, -apple-system, sans-serif" }}>Bulk Upload</h1>
                <p style={{ fontSize: 16, color: "#8e8e8e", lineHeight: 1.6, marginTop: 12, fontFamily: "system-ui, -apple-system, sans-serif" }}>
                  Upload a file with comments to classify them in bulk.
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
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      color: "#10a37f",
                      padding: 0,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 500 }}>View results</span>
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
            <div style={{ width: "100%" }}>
              <BackButton />
              <div style={{ marginBottom: 32, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <h1 style={{ fontSize: 36, fontWeight: 600, color: "#ececec", fontFamily: "system-ui, -apple-system, sans-serif" }}>Insights</h1>
                  <p style={{ fontSize: 16, color: "#8e8e8e", lineHeight: 1.6, marginTop: 12, fontFamily: "system-ui, -apple-system, sans-serif" }}>
                    Analytics dashboard for your classified feedback data.
                  </p>
                </div>
                {bulkResults.length > 0 && (
                  <button
                    onClick={() => {
                      try {
                        const workbook = XLSX.utils.book_new();
                        const allCols = Object.keys(bulkResults[0] || {});
                        const originalCols = allCols.filter(c => c !== "Predicted_Subcategory" && c !== "Subcategory_Confidence");
                        const reorderedResults = bulkResults.map(row => {
                          const newRow: any = {};
                          originalCols.forEach(col => { newRow[col] = row[col]; });
                          newRow["★ Predicted Subcategory"] = row["Predicted_Subcategory"];
                          newRow["★ Confidence"] = row["Subcategory_Confidence"];
                          return newRow;
                        });
                        const orderedCols = [...originalCols, "★ Predicted Subcategory", "★ Confidence"];
                        const worksheet = XLSX.utils.json_to_sheet(reorderedResults, { header: orderedCols });
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
                    className="flex items-center gap-2"
                    style={{
                      backgroundColor: "#212121",
                      border: "1px solid #3e3e3e",
                      borderRadius: 20,
                      cursor: "pointer",
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      color: "#ececec",
                      padding: "10px 18px",
                      fontSize: 14,
                      fontWeight: 500,
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#2f2f2f"; e.currentTarget.style.borderColor = "#4e4e4e"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#212121"; e.currentTarget.style.borderColor = "#3e3e3e"; }}
                  >
                    <Download className="w-4 h-4" strokeWidth={1.5} />
                    <span>Download</span>
                  </button>
                )}
              </div>

              <AnalyticsDashboard results={bulkResults} processingTime={processingTime} />
            </div>
          )}

          {/* ABOUT */}
          {activePage === "about" && (
            <div style={{ width: "100%", maxWidth: 800, margin: "0 auto" }}>
              <BackButton />
              
              {/* Header */}
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 36, fontWeight: 600, color: "#ececec", fontFamily: "system-ui, -apple-system, sans-serif" }}>About</h1>
                <p style={{ fontSize: 16, color: "#8e8e8e", lineHeight: 1.6, marginTop: 12, fontFamily: "system-ui, -apple-system, sans-serif" }}>
                  How the classification model works.
                </p>
              </div>

              {/* Pipeline Section */}
              <div style={{ backgroundColor: "#212121", border: "1px solid #3e3e3e", padding: 32, borderRadius: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 24, height: 1, backgroundColor: "#3e3e3e" }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#8e8e8e", fontFamily: "system-ui, -apple-system, sans-serif" }}>
                    Processing Pipeline
                  </span>
                  <div style={{ flex: 1, height: 1, backgroundColor: "#3e3e3e" }} />
                </div>
                <PipelineVisualization />
              </div>

              {/* Description */}
              <div 
                style={{ 
                  marginTop: 16, 
                  padding: "28px 32px",
                  backgroundColor: "#212121",
                  border: "1px solid #3e3e3e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 40,
                  borderRadius: 12,
                }}
              >
                <p style={{ 
                  fontSize: 15, 
                  color: "#9b9b9b", 
                  lineHeight: 1.8, 
                  fontWeight: 400, 
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  flex: 1,
                }}>
                  Powered by a fine-tuned{" "}
                  <a 
                    href="https://www.nvidia.com/en-us/glossary/bert/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: "#10a37f", textDecoration: "none", fontWeight: 500 }}
                    onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}
                  >BERT</a> model that transforms hours of manual categorization into seconds of automated processing.
                </p>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span style={{ 
                    fontSize: 28, 
                    color: "#ececec", 
                    fontFamily: "system-ui, -apple-system, sans-serif", 
                    fontWeight: 600,
                    display: "block",
                  }}>1000+</span>
                  <span style={{ 
                    fontSize: 12, 
                    color: "#6e6e6e", 
                    display: "block", 
                    marginTop: 4,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}>comments/min</span>
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
