import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, Mic, ClipboardList,
  Puzzle, Building2, Scale, CreditCard, Target,
  ChevronLeft, ChevronRight, LogOut, Sun, Moon, Menu, X, FileEdit, MessageSquare
} from "lucide-react";
import ResumePage          from "./pages/ResumePage";
import InterviewPage       from "./pages/InterviewPage";
import Dashboard           from "./pages/Dashboard";
import LoginPage           from "./pages/LoginPage";
import RegisterPage        from "./pages/RegisterPage";
import AptitudePage        from "./pages/AptitudePage";
import PricingPage         from "./pages/PricingPage";
import CompanyTrackerPage  from "./pages/CompanyTrackerPage";
import OfferComparisonPage from "./pages/OfferComparisonPage";
import HistoryPage         from "./pages/HistoryPage";
import { getToken, getUser, clearAuth } from "./utils/auth";
import { useTheme } from "./context/ThemeContext";
import ResumeBuilderPage from "./pages/ResumeBuilderPage";
import GDPage from "./pages/GDPage";
import NotificationBell from "./components/NotificationPanel";


const NAV_SECTIONS = [
  {
    label: "OVERVIEW",
    items: [
      { to: "/dashboard",      icon: LayoutDashboard, label: "Dashboard"       },
    ]
  },
  {
    label: "RESUME",
    items: [
      { to: "/resume",         icon: FileText,        label: "Resume Analyzer" },
      { to: "/resume-builder", icon: FileEdit,        label: "Resume Builder"  },
    ]
  },
  { label: "INTERVIEW", items: [
    { to: "/interview", icon: Mic,           label: "Mock Interview"  },
    { to: "/gd",        icon: MessageSquare, label: "GD Simulator"    },  // ✅ already there
    { to: "/history",   icon: ClipboardList, label: "Session History" },
  ]},
  {
    label: "PRACTICE",
    items: [
      { to: "/aptitude",       icon: Puzzle,          label: "Aptitude"        },
      { to: "/companies",      icon: Building2,       label: "Companies"       },
    ]
  },
  {
    label: "TOOLS",
    items: [
      { to: "/offers",         icon: Scale,           label: "Offer Comparison"},
      { to: "/pricing",        icon: CreditCard,      label: "Pricing"         },
    ]
  },
];

// Bottom nav items for mobile (most important 5)
const MOBILE_NAV = [
  { to: "/dashboard",  icon: LayoutDashboard, label: "Home"      },
  { to: "/resume",     icon: FileText,        label: "Resume"    },
  { to: "/interview",  icon: Mic,             label: "Interview" },
  { to: "/aptitude",   icon: Puzzle,          label: "Aptitude"  },
  { to: "/companies",  icon: Building2,       label: "Companies" },
];  

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return mobile;
}

function ThemeToggle() {
  const { isDark, toggleTheme, theme } = useTheme();
  return (
    <button onClick={toggleTheme} style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      width: "36px", height: "36px", borderRadius: "10px",
      background: isDark ? "rgba(91,138,240,0.1)" : "rgba(67,97,238,0.08)",
      border: `1px solid ${isDark ? "rgba(91,138,240,0.2)" : "rgba(67,97,238,0.15)"}`,
      cursor: "pointer", color: theme.primary, transition: "all 0.2s", flexShrink: 0,
    }}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(91,138,240,0.2)" : "rgba(67,97,238,0.15)"}
      onMouseLeave={e => e.currentTarget.style.background = isDark ? "rgba(91,138,240,0.1)" : "rgba(67,97,238,0.08)"}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

// ── Mobile bottom navigation ──────────────────────────────────────────────────
// FIND the return in MobileBottomNav, add this after the MOBILE_NAV.map:
function MobileBottomNav({ onMoreClick }) {   // ← add onMoreClick prop
  const { pathname } = useLocation();
  const { theme } = useTheme();

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: theme.sidebar, borderTop: `1px solid ${theme.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-around",
      padding: "8px 0 max(8px, env(safe-area-inset-bottom))",
    }}>
      {MOBILE_NAV.map(({ to, icon: Icon, label }) => {
        const active = pathname === to;
        return (
          <Link key={to} to={to} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
            padding: "6px 10px", borderRadius: "10px", textDecoration: "none",
            color: active ? theme.primary : theme.textMuted,
            background: active ? theme.primaryGlow : "transparent",
            transition: "all 0.15s", minWidth: "52px",
          }}>
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            <span style={{ fontSize: "10px", fontWeight: active ? 700 : 400 }}>{label}</span>
          </Link>
        );
      })}

      {/* More button — opens drawer with ALL pages */}
      <button onClick={onMoreClick} style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
        padding: "6px 10px", borderRadius: "10px",
        background: "transparent", border: "none", cursor: "pointer",
        color: theme.textMuted, minWidth: "52px",
      }}>
        <Menu size={20} strokeWidth={1.8} />
        <span style={{ fontSize: "10px", fontWeight: 400 }}>More</span>
      </button>
    </div>
  );
}

// ── Mobile top header with hamburger ─────────────────────────────────────────
function MobileHeader({ onMenuOpen }) {
  const { theme } = useTheme();
  

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      height: "52px", background: theme.sidebar,
      borderBottom: `1px solid ${theme.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 16px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "28px", height: "28px", borderRadius: "8px",
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent2})`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Target size={14} color="#fff" />
        </div>
        <span style={{ color: theme.textPrimary, fontWeight: 800, fontSize: "15px" }}>
          Placement<span style={{ color: theme.primary }}>AI</span>
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <NotificationBell />
        <ThemeToggle />
        <button onClick={onMenuOpen} style={{
          background: "transparent", border: "none",
          color: theme.textSecondary, cursor: "pointer",
          display: "flex", alignItems: "center", padding: "4px",
        }}>
          <Menu size={20} />
        </button>
      </div>
    </div>
  );
}

// ── Mobile drawer (full nav) ──────────────────────────────────────────────────
function MobileDrawer({ open, onClose }) {
  const { pathname } = useLocation();
  const { theme, isDark } = useTheme();
  const navigate = useNavigate();
  const user = getUser();

  function logout() { clearAuth(); navigate("/login"); onClose(); }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)", zIndex: 200,
      }} />
      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "280px",
        background: theme.sidebar, borderLeft: `1px solid ${theme.border}`,
        zIndex: 201, display: "flex", flexDirection: "column",
        animation: "slideIn 0.2s ease",
      }}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderBottom: `1px solid ${theme.border}` }}>
          <span style={{ color: theme.textPrimary, fontWeight: 700, fontSize: "14px" }}>Navigation</span>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: theme.textMuted, cursor: "pointer", display: "flex" }}>
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
          {NAV_SECTIONS.map(section => (
            <div key={section.label} style={{ marginBottom: "16px" }}>
              <div style={{ color: theme.textMuted, fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", padding: "0 8px", marginBottom: "4px" }}>
                {section.label}
              </div>
              {section.items.map(item => {
                const active = pathname === item.to;
                const Icon = item.icon;
                return (
                  <Link key={item.to} to={item.to} onClick={onClose} style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 12px", borderRadius: "8px", marginBottom: "2px",
                    textDecoration: "none",
                    background: active ? `rgba(${isDark ? "91,138,240" : "67,97,238"},0.12)` : "transparent",
                    border: active ? `1px solid rgba(${isDark ? "91,138,240" : "67,97,238"},0.25)` : "1px solid transparent",
                    color: active ? theme.primary : isDark ? theme.textMuted : "#374151",
                    fontWeight: active ? 600 : 400, fontSize: "13px",
                  }}>
                    <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
                    <span>{item.label}</span>
                    {active && <div style={{ marginLeft: "auto", width: "5px", height: "5px", borderRadius: "50%", background: theme.primary }} />}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User + logout */}
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${theme.border}` }}>
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent1})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: "#fff", fontWeight: 700, flexShrink: 0 }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: theme.textPrimary, fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
                <div style={{ color: theme.textMuted, fontSize: "11px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
              </div>
              <button onClick={logout} style={{ background: "transparent", border: "none", cursor: "pointer", color: theme.textMuted, display: "flex", padding: "4px" }}>
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Desktop sidebar (unchanged) ───────────────────────────────────────────────
function Sidebar({ collapsed, setCollapsed }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  const { theme, isDark } = useTheme();
  const [tooltip, setTooltip] = useState({ visible: false, label: "", y: 0 });

  function logout() { clearAuth(); navigate("/login"); }
  function showTooltip(e, label) {
    if (!collapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ visible: true, label, y: rect.top + rect.height / 2 });
  }
  function hideTooltip() { setTooltip({ visible: false, label: "", y: 0 }); }

  return (
    <>
      {collapsed && tooltip.visible && (
        <div style={{
          position: "fixed", left: "76px", top: tooltip.y, transform: "translateY(-50%)",
          background: theme.surface, color: theme.textPrimary, padding: "6px 12px",
          borderRadius: "8px", fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap",
          pointerEvents: "none", border: `1px solid ${theme.border}`,
          zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        }}>
          <div style={{ position: "absolute", right: "100%", top: "50%", transform: "translateY(-50%)", border: "5px solid transparent", borderRightColor: theme.border }} />
          <div style={{ position: "absolute", right: "calc(100% - 1px)", top: "50%", transform: "translateY(-50%)", border: "5px solid transparent", borderRightColor: theme.surface }} />
          {tooltip.label}
        </div>
      )}

      <div style={{
        width: collapsed ? "64px" : "240px", minHeight: "100vh", flexShrink: 0,
        background: theme.sidebar, borderRight: `1px solid ${theme.border}`,
        display: "flex", flexDirection: "column",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
        transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)", overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{ padding: collapsed ? "16px 0" : "16px 14px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", gap: "8px" }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", flexShrink: 0, background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 12px ${theme.primaryGlow}` }}>
                <Target size={15} color="#fff" />
              </div>
              <div>
                <div style={{ color: theme.textPrimary, fontWeight: 800, fontSize: "14px", letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>
                  Placement<span style={{ color: theme.primary }}>AI</span>
                </div>
                <div style={{ color: isDark ? theme.textMuted : "#6b7280", fontSize: "9px" }}>Placement Prep Suite</div>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 12px ${theme.primaryGlow}` }}>
              <Target size={15} color="#fff" />
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: `rgba(${isDark ? "91,138,240" : "67,97,238"},0.1)`, border: `1px solid rgba(${isDark ? "91,138,240" : "67,97,238"},0.2)`, borderRadius: "6px", cursor: "pointer", color: theme.primary, padding: "4px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", flexShrink: 0 }}>
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: collapsed ? "10px 8px" : "10px 10px" }}>
          {NAV_SECTIONS.map(section => (
            <div key={section.label} style={{ marginBottom: "18px" }}>
              {!collapsed && <div style={{ color: isDark ? theme.textMuted : "#6b7280", fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", padding: "0 8px", marginBottom: "4px" }}>{section.label}</div>}
              {collapsed && <div style={{ height: "1px", background: theme.border, margin: "6px 0" }} />}
              {section.items.map(item => {
                const active = pathname === item.to;
                const Icon = item.icon;
                return (
                  <Link key={item.to} to={item.to}
                    onMouseEnter={e => { showTooltip(e, item.label); if (!active) { e.currentTarget.style.background = theme.surfaceHover; e.currentTarget.style.color = theme.textSecondary; } }}
                    onMouseLeave={e => { hideTooltip(); if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = isDark ? theme.textMuted : "#374151"; } }}
                    style={{
                      display: "flex", alignItems: "center", gap: collapsed ? "0" : "10px",
                      padding: collapsed ? "9px" : "8px 10px", borderRadius: "8px", marginBottom: "2px",
                      textDecoration: "none",
                      background: active ? `rgba(${isDark ? "91,138,240" : "67,97,238"},0.12)` : "transparent",
                      border: active ? `1px solid rgba(${isDark ? "91,138,240" : "67,97,238"},0.25)` : "1px solid transparent",
                      color: active ? theme.primary : isDark ? theme.textMuted : "#374151",
                      fontWeight: active ? 600 : 400, fontSize: "13px",
                      justifyContent: collapsed ? "center" : "flex-start", transition: "all 0.15s",
                    }}>
                    <Icon size={16} strokeWidth={active ? 2.5 : 1.8} style={{ flexShrink: 0 }} />
                    {!collapsed && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
                    {!collapsed && active && <div style={{ marginLeft: "auto", width: "5px", height: "5px", borderRadius: "50%", background: theme.primary }} />}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div style={{ padding: collapsed ? "10px 8px" : "10px", borderTop: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "8px" }}>
          {collapsed ? (
            // Collapsed — show icons vertically centered with gap
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <ThemeToggle />
              <NotificationBell />
            </div>
          ) : (
            // Expanded — show in a row with label
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ThemeToggle />
              <span style={{ color: theme.textSecondary, fontSize: "12px", flex: 1, whiteSpace: "nowrap" }}>
                {isDark ? "Dark" : "Light"}
              </span>
              <NotificationBell />
            </div>
          )}
          {user && (
            collapsed ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent1})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#fff", fontWeight: 700 }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <button onClick={logout} style={{ background: "transparent", border: "none", cursor: "pointer", color: isDark ? theme.textMuted : "#6b7280", padding: "4px", borderRadius: "6px", display: "flex", transition: "color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = theme.danger}
                  onMouseLeave={e => e.currentTarget.style.color = theme.textMuted}>
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", borderRadius: "10px", background: `rgba(${isDark ? "91,138,240" : "67,97,238"},0.06)`, border: `1px solid rgba(${isDark ? "91,138,240" : "67,97,238"},0.12)` }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent1})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#fff", fontWeight: 700 }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: theme.textPrimary, fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
                  <div style={{ color: isDark ? theme.textMuted : "#6b7280", fontSize: "10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
                </div>
                <button onClick={logout} style={{ background: "transparent", border: "none", cursor: "pointer", color: isDark ? theme.textMuted : "#6b7280", padding: "4px", display: "flex", transition: "color 0.15s", flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = theme.danger}
                  onMouseLeave={e => e.currentTarget.style.color = theme.textMuted}>
                  <LogOut size={14} />
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}

function Protected({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { theme } = useTheme();
  const isMobile = useIsMobile();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Desktop sidebar — hidden on mobile */}
      {!isMobile && <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />}

      {/* Mobile top bar + drawer */}
      {isMobile && <MobileHeader onMenuOpen={() => setDrawerOpen(true)} />}
      {isMobile && <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />}

      {/* Main content */}
      <div style={{
        marginLeft: isMobile ? "0" : collapsed ? "64px" : "240px",
        flex: 1, minHeight: "100vh", background: theme.bg,
        transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
        // On mobile: top padding for header, bottom padding for nav bar
        paddingTop: isMobile ? "52px" : "0",
        paddingBottom: isMobile ? "70px" : "0",
      }}>
        {children}
      </div>

      {/* Mobile bottom nav */}
      {isMobile && <MobileBottomNav onMoreClick={() => setDrawerOpen(true)} />}
    </div>
  );
}

export default function App() {
  const { theme } = useTheme();

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.textPrimary }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${theme.bg}; font-family: 'Inter', 'Segoe UI', sans-serif; color: ${theme.textPrimary}; }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse   { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes bounce  { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        @keyframes shimmer { from{background-position:200% 0} to{background-position:-200% 0} }
        .fade-in { animation: fadeUp 0.35s ease both; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 4px; }
        ::placeholder { color: ${theme.textMuted}; }
        textarea, input { outline: none; font-family: inherit; }
        textarea:focus, input:focus { border-color: ${theme.primary} !important; box-shadow: 0 0 0 3px ${theme.primaryGlow} !important; }
        a { text-decoration: none; }
      `}</style>

      <Routes>
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/register"  element={<RegisterPage />} />
        <Route path="/"          element={<Protected><AppLayout><Dashboard /></AppLayout></Protected>} />
        <Route path="/dashboard" element={<Protected><AppLayout><Dashboard /></AppLayout></Protected>} />
        <Route path="/resume"    element={<Protected><AppLayout><ResumePage /></AppLayout></Protected>} />
        <Route path="/interview" element={<Protected><AppLayout><InterviewPage /></AppLayout></Protected>} />
        <Route path="/aptitude"  element={<Protected><AppLayout><AptitudePage /></AppLayout></Protected>} />
        <Route path="/companies" element={<Protected><AppLayout><CompanyTrackerPage /></AppLayout></Protected>} />
        <Route path="/offers"    element={<Protected><AppLayout><OfferComparisonPage /></AppLayout></Protected>} />
        <Route path="/pricing"   element={<Protected><AppLayout><PricingPage /></AppLayout></Protected>} />
        <Route path="/history"   element={<Protected><AppLayout><HistoryPage /></AppLayout></Protected>} />
        <Route path="/resume-builder" element={<Protected><AppLayout><ResumeBuilderPage /></AppLayout></Protected>} />
        <Route path="/gd" element={<Protected><AppLayout><GDPage /></AppLayout></Protected>} />
      </Routes>
    </div>
  );
}