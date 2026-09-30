import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search, Inbox, AlertCircle } from "lucide-react";
import { getRequests } from "../services/api";
import type { CustomerRequest, User } from "../types";
import { AppLayout } from "../components/AppLayout";
import { RequestTable } from "../components/RequestTable";
import { StatusFilter, type FilterOption } from "../components/StatusFilter";
import { SkeletonRow } from "../components/LoadingSpinner";
import { ToastContainer, useToast } from "../components/Toast";

export const Requests: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toasts, addToast, removeToast } = useToast();

  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentFilter, setCurrentFilter] = useState<FilterOption>(() => {
    const s = searchParams.get("status");
    if (s === "NEW" || s === "QUALIFIED" || s === "CLOSED") return s;
    return "ALL";
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.title = "DeskFlow — Requests";
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        setCurrentUser(JSON.parse(userJson));
      } catch {
        setCurrentUser(null);
      }
    }
  }, []);

  const fetchRequests = useCallback(async (filter: FilterOption) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRequests(filter === "ALL" ? undefined : filter);
      setRequests(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load requests.");
      addToast(err.message || "Failed to load requests.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests(currentFilter);
  }, [currentFilter, fetchRequests]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Client-side search filter
  const filtered = requests.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.customerName.toLowerCase().includes(q) ||
      r.requestedService.toLowerCase().includes(q) ||
      (r.customerEmail?.toLowerCase().includes(q) ?? false)
    );
  });

  // Count badges
  const counts: Partial<Record<FilterOption, number>> = {
    ALL: requests.length,
    NEW: requests.filter((r) => r.status === "NEW").length,
    QUALIFIED: requests.filter((r) => r.status === "QUALIFIED").length,
    CLOSED: requests.filter((r) => r.status === "CLOSED").length,
  };

  return (
    <AppLayout user={currentUser} onLogout={handleLogout}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Page header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
          textAlign: "left",
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: "0 0 5px" }}>
            Customer Requests
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
            Review, qualify, and manage incoming customer requests.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/requests/new")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 18px",
            fontSize: 13,
            fontWeight: 600,
            color: "#ffffff",
            background: "#4f46e5",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <Plus size={15} /> New Request
        </button>
      </div>

      {/* Toolbar: Search + Filter */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 240px", maxWidth: 360 }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: 11,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder="Search requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 34px",
              fontSize: 13,
              borderRadius: 8,
              border: "1px solid #d1d5db",
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
              background: "#ffffff",
            }}
          />
        </div>

        {/* Status filter */}
        <StatusFilter
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
          disabled={loading}
          counts={counts}
        />
      </div>

      {/* Content card */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}
      >
        {/* Loading skeleton */}
        {loading && (
          <div>
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div
            style={{
              padding: "36px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              background: "#fef2f2",
            }}
          >
            <AlertCircle size={32} color="#dc2626" />
            <p style={{ fontSize: 14, color: "#991b1b", margin: 0 }}>{error}</p>
            <button
              type="button"
              onClick={() => fetchRequests(currentFilter)}
              style={{
                padding: "7px 16px",
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
        {!loading && !error && filtered.length === 0 && (
          <div
            style={{
              padding: "56px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Inbox size={44} color="#cbd5e1" />
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>
              {search
                ? `No results for "${search}"`
                : currentFilter === "ALL"
                ? "No requests yet"
                : `No ${currentFilter.toLowerCase()} requests`}
            </h3>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, textAlign: "center" }}>
              {search
                ? "Try a different search term."
                : currentFilter === "ALL"
                ? "Customer requests will appear here once they are created."
                : `There are no requests with "${currentFilter}" status.`}
            </p>
            {!search && currentFilter === "ALL" && (
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
                <Plus size={14} /> Create Request
              </button>
            )}
            {(!search && currentFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => setCurrentFilter("ALL")}
                style={{
                  marginTop: 8,
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
                View All Requests
              </button>
            )}
          </div>
        )}

        {/* Table */}
        {!loading && !error && filtered.length > 0 && (
          <RequestTable
            requests={filtered}
            onSelectRequest={(req) => navigate(`/requests/${req.id}`)}
          />
        )}

        {/* Footer count */}
        {!loading && !error && filtered.length > 0 && (
          <div
            style={{
              padding: "10px 20px",
              borderTop: "1px solid #f1f5f9",
              fontSize: 12,
              color: "#94a3b8",
              textAlign: "right",
            }}
          >
            {filtered.length} request{filtered.length !== 1 ? "s" : ""}
            {search && ` matching "${search}"`}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Requests;
