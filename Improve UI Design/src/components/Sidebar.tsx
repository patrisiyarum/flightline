import { Home, Brain, Upload, BarChart3 } from "lucide-react";

export type Page = "home" | "classify" | "upload" | "insights";

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  apiOnline: boolean;
  modelLoaded: boolean;
}

const NAV_ITEMS: { page: Page; label: string; icon: typeof Home }[] = [
  { page: "home", label: "HOME", icon: Home },
  { page: "classify", label: "CLASSIFY", icon: Brain },
  { page: "upload", label: "UPLOAD", icon: Upload },
  { page: "insights", label: "INSIGHTS", icon: BarChart3 },
];

export function Sidebar({ activePage, onNavigate, apiOnline, modelLoaded }: SidebarProps) {
  return (
    <aside
      className="flex flex-col h-screen sticky top-0"
      style={{
        width: "var(--sidebar-width, 248px)",
        minWidth: "var(--sidebar-width, 248px)",
        backgroundColor: "#d9d9d9",
        borderRight: "1px solid #c0c0c0",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "24px var(--sidebar-padding-x, 24px) 16px",
          borderBottom: "1px solid #c0c0c0",
          marginBottom: 8,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "#0f0e12",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              lineHeight: 1.4,
            }}
          >
            FCR FEEDBACK
          </h1>
          <p
            style={{
              fontSize: 10,
              fontWeight: 400,
              color: "#6b6b6b",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Intelligence
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--sidebar-nav-gap, 2px)",
          }}
        >
          {NAV_ITEMS.map(({ page, label, icon: Icon }) => {
            const isActive = activePage === page;
            return (
              <button
                key={page}
                onClick={() => onNavigate(page)}
                className="w-full flex items-center gap-3 text-left transition-colors"
                style={{
                  padding: "10px var(--sidebar-padding-x, 24px)",
                  backgroundColor: isActive ? "rgba(0,0,0,0.06)" : "transparent",
                  color: isActive ? "#0f0e12" : "#6b6b6b",
                  borderLeft: isActive ? "2px solid #0f0e12" : "2px solid transparent",
                  fontSize: 11,
                  fontWeight: isActive ? 500 : 400,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  lineHeight: 1.6,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "#0f0e12";
                    e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "#6b6b6b";
                    e.currentTarget.style.backgroundColor = "transparent";
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
        className="space-y-2"
        style={{
          padding: "0 var(--sidebar-padding-x, 24px) 24px",
        }}
      >
        <div className="flex items-center gap-2 py-1">
          <span
            style={{
              width: 6,
              height: 6,
              backgroundColor: apiOnline ? "#2d8a4e" : "#c0392b",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 400,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: apiOnline ? "#2d8a4e" : "#c0392b",
            }}
          >
            {apiOnline ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
        <div className="flex items-center gap-2 py-1">
          <span
            style={{
              width: 6,
              height: 6,
              backgroundColor: modelLoaded ? "#2d8a4e" : "#c0392b",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 400,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: modelLoaded ? "#2d8a4e" : "#c0392b",
            }}
          >
            {modelLoaded ? "MODEL READY" : "MODEL N/A"}
          </span>
        </div>
      </div>
    </aside>
  );
}
