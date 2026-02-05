import { Home, Brain, Upload, BarChart3 } from "lucide-react";

export type Page = "home" | "classify" | "upload" | "insights" | "about";

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  apiOnline: boolean;
  modelLoaded: boolean;
}

const NAV_ITEMS: { page: Page; label: string; icon: typeof Home }[] = [
  { page: "home", label: "Home", icon: Home },
  { page: "classify", label: "Feedback Demo", icon: Brain },
  { page: "upload", label: "Bulk Upload", icon: Upload },
  { page: "insights", label: "Insights", icon: BarChart3 },
];

export function Sidebar({ activePage, onNavigate, apiOnline, modelLoaded }: SidebarProps) {
  return (
    <aside
      className="flex flex-col h-screen sticky top-0"
      style={{
        width: 260,
        minWidth: 260,
        backgroundColor: "#171717",
        borderRight: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "20px 16px 12px" }}>
        <h1
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#ececec",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Flightline
        </h1>
        <p style={{ fontSize: 12, color: "#8e8e8e", marginTop: 2 }}>
          Delta Airlines
        </p>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "8px 8px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map(({ page, label, icon: Icon }) => {
            const isActive = activePage === page;
            return (
              <button
                key={page}
                onClick={() => onNavigate(page)}
                className="w-full flex items-center gap-3 text-left transition-all"
                style={{
                  padding: "10px 12px",
                  backgroundColor: isActive ? "#212121" : "transparent",
                  color: isActive ? "#ececec" : "#9b9b9b",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: isActive ? 500 : 400,
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "#212121";
                    e.currentTarget.style.color = "#ececec";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#9b9b9b";
                  }
                }}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Status */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="flex items-center gap-2">
            <span
              style={{
                width: 8,
                height: 8,
                backgroundColor: apiOnline ? "#10a37f" : "#ef4444",
                borderRadius: "50%",
              }}
            />
            <span style={{ fontSize: 12, color: "#9b9b9b" }}>
              {apiOnline ? "Online" : "Offline"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              style={{
                width: 8,
                height: 8,
                backgroundColor: modelLoaded ? "#10a37f" : "#ef4444",
                borderRadius: "50%",
              }}
            />
            <span style={{ fontSize: 12, color: "#9b9b9b" }}>
              {modelLoaded ? "Model Ready" : "Model N/A"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
