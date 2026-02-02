import { Home, Brain, Upload, BarChart3, Wifi, WifiOff, Cpu } from "lucide-react";

export type Page = "home" | "classify" | "upload" | "insights";

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  apiOnline: boolean;
  modelLoaded: boolean;
}

const NAV_ITEMS: { page: Page; label: string; icon: typeof Home }[] = [
  { page: "home", label: "Home", icon: Home },
  { page: "classify", label: "Classify", icon: Brain },
  { page: "upload", label: "Upload", icon: Upload },
  { page: "insights", label: "Insights", icon: BarChart3 },
];

export function Sidebar({ activePage, onNavigate, apiOnline, modelLoaded }: SidebarProps) {
  return (
    <aside
      className="flex flex-col h-screen sticky top-0"
      style={{ width: 240, minWidth: 240, backgroundColor: "#000000" }}
    >
      {/* Logo */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#C8102E" }}
          >
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">FCR Feedback</h1>
            <p className="text-xs" style={{ color: "#A0A0A0" }}>Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        <div className="space-y-1">
          {NAV_ITEMS.map(({ page, label, icon: Icon }) => {
            const isActive = activePage === page;
            return (
              <button
                key={page}
                onClick={() => onNavigate(page)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors"
                style={{
                  backgroundColor: isActive ? "#252525" : "transparent",
                  color: isActive ? "#ffffff" : "#A0A0A0",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = "#A0A0A0";
                }}
              >
                <Icon className="w-5 h-5" />
                {label}
                {isActive && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: "#C8102E" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Status */}
      <div className="px-4 pb-6 space-y-2">
        <div className="flex items-center gap-2 px-2 py-1.5">
          {apiOnline ? (
            <Wifi className="w-3.5 h-3.5" style={{ color: "#22C55E" }} />
          ) : (
            <WifiOff className="w-3.5 h-3.5" style={{ color: "#EF4444" }} />
          )}
          <span className="text-xs" style={{ color: apiOnline ? "#22C55E" : "#EF4444" }}>
            {apiOnline ? "API Connected" : "API Offline"}
          </span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Cpu className="w-3.5 h-3.5" style={{ color: modelLoaded ? "#22C55E" : "#EF4444" }} />
          <span className="text-xs" style={{ color: modelLoaded ? "#22C55E" : "#EF4444" }}>
            {modelLoaded ? "Model Loaded" : "Model Unavailable"}
          </span>
        </div>
      </div>
    </aside>
  );
}
