import { Home, Brain, Upload, BarChart3, Info } from "lucide-react";

export type Page = "home" | "classify" | "upload" | "insights" | "about";

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  apiOnline: boolean;
  modelLoaded: boolean;
}

const NAV_ITEMS: { page: Page; label: string; icon: typeof Home }[] = [
  { page: "home", label: "HOME", icon: Home },
  { page: "classify", label: "FEEDBACK DEMO", icon: Brain },
  { page: "upload", label: "BULK UPLOAD", icon: Upload },
  { page: "insights", label: "INSIGHTS", icon: BarChart3 },
  { page: "about", label: "ABOUT", icon: Info },
];

export function Sidebar({ activePage, onNavigate, apiOnline, modelLoaded }: SidebarProps) {
  return (
    <aside
      className="flex flex-col h-screen sticky top-0"
      style={{
        width: "var(--sidebar-width, 240px)",
        minWidth: "var(--sidebar-width, 240px)",
        backgroundColor: "#f5f5f5",
        borderRight: "1px solid #e0e0e0",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "28px 24px 20px",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <h1
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#1a1a1a",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Delta Airlines
        </h1>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "16px 0" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map(({ page, label, icon: Icon }) => {
            const isActive = activePage === page;
            return (
              <button
                key={page}
                onClick={() => onNavigate(page)}
                className="w-full flex items-center gap-3 text-left transition-all"
                style={{
                  padding: "12px 24px",
                  backgroundColor: isActive ? "#ffffff" : "transparent",
                  color: isActive ? "#1a1a1a" : "#666666",
                  borderLeft: isActive ? "3px solid #1a1a1a" : "3px solid transparent",
                  fontSize: 11,
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "#ebebeb";
                    e.currentTarget.style.color = "#1a1a1a";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#666666";
                  }
                }}
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Status */}
      <div
        style={{
          padding: "20px 24px",
          borderTop: "1px solid #e0e0e0",
          backgroundColor: "#fafafa",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="flex items-center gap-3">
            <span
              style={{
                width: 8,
                height: 8,
                backgroundColor: apiOnline ? "#22c55e" : "#ef4444",
                display: "inline-block",
                borderRadius: "50%",
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: apiOnline ? "#16a34a" : "#dc2626",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {apiOnline ? "Online" : "Offline"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span
              style={{
                width: 8,
                height: 8,
                backgroundColor: modelLoaded ? "#22c55e" : "#ef4444",
                display: "inline-block",
                borderRadius: "50%",
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: modelLoaded ? "#16a34a" : "#dc2626",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {modelLoaded ? "Model Ready" : "Model N/A"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
