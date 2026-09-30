import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Inbox,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { getRequests } from "../services/api";
import type { CustomerRequest, User } from "../types";
import { AppLayout } from "../components/AppLayout";
import { StatusBadge } from "../components/StatusBadge";
import { SkeletonStatCard, SkeletonRow } from "../components/LoadingSpinner";
import { ToastContainer, useToast } from "../components/Toast";

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    document.title = "DeskFlow — Dashboard";
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        setCurrentUser(JSON.parse(userJson));
      } catch {
        setCurrentUser(null);
      }
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRequests();
      setRequests(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load requests.");
      addToast(err.message || "Failed to load requests.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Stats computed from real data
  const total = requests.length;
  const newCount = requests.filter((r) => r.status === "NEW").length;
  const qualifiedCount = requests.filter((r) => r.status === "QUALIFIED").length;
  const closedCount = requests.filter((r) => r.status === "CLOSED").length;
  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const statCards = [
    {
      label: "Total Requests",
      value: total,
      icon: TrendingUp,
      iconBg: "#eef2ff",
      iconColor: "#4f46e5",
      accent: "#4f46e5",
    },
    {
      label: "New",
      value: newCount,
      icon: Clock,
      iconBg: "#fffbeb",
      iconColor: "#f59e0b",
      accent: "#f59e0b",
    },
    {
      label: "Qualified",
      value: qualifiedCount,
      icon: CheckCircle2,
      iconBg: "#ecfdf5",
      iconColor: "#10b981",
      accent: "#10b981",
    },
    {
      label: "Closed",
      value: closedCount,
      icon: XCircle,
      iconBg: "#f1f5f9",
      iconColor: "#64748b",
      accent: "#64748b",
    },
  ];

  const userName = currentUser?.name?.split(" ")[0] || currentUser?.email?.split("@")[0] || "there";

  return (
    <AppLayout user={currentUser} onLogout={handleLogout}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Page header */}
      <div style={{ marginBottom: 28, textAlign: "left" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
          {getGreeting()}, {userName} 👋
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
          Here's what's happening with your customer requests.
        </p>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {loading
          ? [1, 2, 3, 4].map((i) => <SkeletonStatCard key={i} />)
          : statCards.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  style={{
                    background: "#ffffff",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    padding: "20px 22px",
                    textAlign: "left",
                    borderTop: `3px solid ${s.accent}`,
                    transition: "box-shadow 0.15s ease",
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: s.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 14,
                    }}
                  >
                    <Icon size={20} color={s.iconColor} />
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 6, fontWeight: 500 }}>
                    {s.label}
                  </div>
                </div>
              );
            })}
      </div>

      {/* Recent Requests */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}
      >
        {/* Card header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 22px",
            borderBottom: "1px solid #f1f5f9",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Recent Requests
            </h2>
            <p style={{ fontSize: 12, color: "#64748b", margin: "3px 0 0" }}>
              The 5 most recent customer requests in your workspace.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => navigate("/requests")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "7px 14px",
                fontSize: 13,
                fontWeight: 500,
                color: "#4f46e5",
                background: "#eef2ff",
                border: "1px solid #c7d2fe",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              View all <ArrowRight size={13} />
            </button>
            <button
              type="button"
              onClick={() => navigate("/requests/new")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "7px 14px",
                fontSize: 13,
                fontWeight: 600,
                color: "#ffffff",
                background: "#4f46e5",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              <Plus size={14} /> New Request
            </button>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div>
            {[1, 2, 3].map((i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div
            style={{
              padding: "32px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              background: "#fef2f2",
            }}
          >
            <AlertCircle size={28} color="#dc2626" />
            <p style={{ fontSize: 14, color: "#991b1b", margin: 0 }}>{error}</p>
            <button
              type="button"
              onClick={fetchRequests}
              style={{
                padding: "7px 14px",
                fontSize: 13,
                fontWeight: 500,
                color: "#ffffff",
                background: "#dc2626",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && recentRequests.length === 0 && (
          <div
            style={{
              padding: "48px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Inbox size={40} color="#cbd5e1" />
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>
              No requests yet
            </h3>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
              Customer requests will appear here once they are created.
            </p>
            <button
              type="button"
              onClick={() => navigate("/requests/new")}
              style={{
                marginTop: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 600,
                color: "#ffffff",
                background: "#4f46e5",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              <Plus size={14} /> Create First Request
            </button>
          </div>
        )}

        {/* Recent requests table */}
        {!loading && !error && recentRequests.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  {["Customer", "Service", "Scheduled", "Status", "Created", ""].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        padding: "10px 16px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        width:
                          i === 0
                            ? "20%"
                            : i === 1
                            ? "26%"
                            : i === 2
                            ? "14%"
                            : i === 3
                            ? "12%"
                            : i === 4
                            ? "16%"
                            : "12%",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((req, idx) => (
                  <tr
                    key={req.id}
                    onClick={() => navigate(`/requests/${req.id}`)}
                    style={{
                      borderBottom: idx < recentRequests.length - 1 ? "1px solid #f1f5f9" : "none",
                      cursor: "pointer",
                      transition: "background 0.1s ease",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLTableRowElement).style.background = "#f8fafc")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")
                    }
                  >
                    <td style={td}>
                      <span style={{ fontWeight: 600, color: "#0f172a", fontSize: 13 }}>
                        {req.customerName}
                      </span>
                    </td>
                    <td style={td}>
                      <span
                        style={{
                          fontSize: 13,
                          color: "#334155",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "block",
                        }}
                      >
                        {req.requestedService}
                      </span>
                    </td>
                    <td style={td}>
                      <span style={{ fontSize: 13, color: "#475569" }}>
                        {req.scheduledDate || "—"}
                      </span>
                    </td>
                    <td style={td}>
                      <StatusBadge status={req.status} />
                    </td>
                    <td style={td}>
                      <span style={{ fontSize: 13, color: "#64748b" }}>
                        {formatDate(req.createdAt)}
                      </span>
                    </td>
                    <td style={td}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/requests/${req.id}`);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "5px 10px",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#4f46e5",
                          background: "#eef2ff",
                          border: "none",
                          borderRadius: 6,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        View <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

const td: React.CSSProperties = { padding: "12px 16px", verticalAlign: "middle" };

export default Dashboard;
