import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Inbox,
  Briefcase,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { DeskFlowLogo } from "./DeskFlowLogo";
import type { User } from "../types";

interface AppLayoutProps {
  children: React.ReactNode;
  user?: User | null;
  onLogout?: () => void;
}

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/requests", label: "Requests", icon: Inbox },
];

export const AppLayout: React.FC<AppLayoutProps> = ({ children, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) =>
    path === "/requests"
      ? location.pathname.startsWith("/requests")
      : location.pathname === path;

  const handleNav = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const getUserInitials = (u?: User | null) => {
    if (!u) return "U";
    const name = u.name || u.email || "";
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const sidebar = (
    <nav
      className={`app-sidebar${sidebarOpen ? " open" : ""}`}
      aria-label="Main navigation"
    >
      {/* Brand */}
      <div className="sidebar-brand">
        <DeskFlowLogo variant="light" size="md" showTagline />
      </div>

      {/* Nav */}
      <div className="sidebar-nav">
        <p className="sidebar-section-label">Navigation</p>
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <button
            key={path}
            type="button"
            className={`sidebar-link${isActive(path) ? " active" : ""}`}
            onClick={() => handleNav(path)}
            aria-current={isActive(path) ? "page" : undefined}
          >
            <Icon size={16} />
            <span style={{ flex: 1 }}>{label}</span>
            {isActive(path) && <ChevronRight size={14} style={{ opacity: 0.6 }} />}
          </button>
        ))}

        <p className="sidebar-section-label" style={{ marginTop: 8 }}>
          Work
        </p>
        <button
          type="button"
          className="sidebar-link"
          onClick={() => handleNav("/requests?status=QUALIFIED")}
          title="View qualified requests ready to convert"
        >
          <Briefcase size={16} />
          <span style={{ flex: 1 }}>Work Items</span>
        </button>
      </div>

      {/* User footer */}
      {user && (
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{getUserInitials(user)}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.name || "User"}</div>
            <div className="sidebar-user-email">{user.email}</div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Sign out"
            aria-label="Sign out"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#a5b4fc",
              padding: 4,
              display: "flex",
              alignItems: "center",
              borderRadius: 6,
              transition: "color 0.15s ease",
              flexShrink: 0,
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </nav>
  );

  return (
    <div className="app-layout">
      {/* Sidebar */}
      {sidebar}

      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay${sidebarOpen ? " visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Main area */}
      <div className="app-main">
        {/* Top header */}
        <header className="app-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Mobile hamburger */}
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            {/* Breadcrumb title */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {NAV_ITEMS.map(({ path, label }) =>
                isActive(path) ? (
                  <span
                    key={path}
                    style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}
                  >
                    {label}
                  </span>
                ) : null
              )}
              {location.pathname.startsWith("/requests/") && !location.pathname.endsWith("/new") && (
                <>
                  <ChevronRight size={14} color="#94a3b8" />
                  <span style={{ fontSize: 14, color: "#64748b" }}>
                    {location.pathname.endsWith("/edit") ? "Edit" : "Details"}
                  </span>
                </>
              )}
              {location.pathname === "/requests/new" && (
                <>
                  <ChevronRight size={14} color="#94a3b8" />
                  <span style={{ fontSize: 14, color: "#64748b" }}>New Request</span>
                </>
              )}
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {user?.workspaceName && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#4f46e5",
                  background: "#eef2ff",
                  border: "1px solid #c7d2fe",
                  borderRadius: 9999,
                  padding: "3px 10px",
                }}
              >
                {user.workspaceName}
              </span>
            )}

            {/* User avatar (desktop) */}
            {user && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "#4f46e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#ffffff",
                  }}
                >
                  {getUserInitials(user)}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <div className="app-content">{children}</div>
      </div>
    </div>
  );
};

export default AppLayout;
