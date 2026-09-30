import React, { useEffect, useState, useCallback } from "react";
import {
  History,
  Clock,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
  FileEdit,
  Briefcase,
  Activity as ActivityIcon,
  RefreshCw,
} from "lucide-react";
import { getActivities } from "../services/api";
import type { Activity } from "../types";
import { LoadingSpinner } from "./LoadingSpinner";

interface ActivityTimelineProps {
  requestId: string;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const getActionIcon = (action: string) => {
  const act = action.toUpperCase();
  if (act.includes("CREATE") && !act.includes("WORK")) {
    return { icon: <CheckCircle2 size={14} color="#4f46e5" />, bg: "#eef2ff", border: "#c7d2fe" };
  }
  if (act.includes("STATUS") || act.includes("UPDATE")) {
    return { icon: <FileEdit size={14} color="#059669" />, bg: "#ecfdf5", border: "#a7f3d0" };
  }
  if (act.includes("WORK_ITEM") || act.includes("CONVERT") || act.includes("WORK")) {
    return { icon: <Briefcase size={14} color="#7c3aed" />, bg: "#f5f3ff", border: "#ddd6fe" };
  }
  return { icon: <ActivityIcon size={14} color="#64748b" />, bg: "#f8fafc", border: "#e2e8f0" };
};

const getActionLabel = (action: string) => {
  const map: Record<string, string> = {
    REQUEST_CREATED: "Request Created",
    STATUS_UPDATED: "Status Updated",
    REQUEST_UPDATED: "Request Updated",
    WORK_ITEM_CREATED: "Work Item Created",
    CONVERT_TO_WORK_ITEM: "Converted to Work Item",
  };
  return map[action.toUpperCase()] ?? action.replace(/_/g, " ");
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ requestId }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    if (!requestId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getActivities(requestId);
      setActivities(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load activity timeline.");
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        padding: 24,
        marginTop: 24,
        textAlign: "left",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          paddingBottom: 14,
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "#eef2ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <History size={15} color="#4f46e5" />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Activity Timeline
          </h3>
          {activities.length > 0 && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: "#e0e7ff",
                color: "#4f46e5",
                borderRadius: 9999,
                padding: "1px 8px",
              }}
            >
              {activities.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={fetchActivities}
          disabled={loading}
          aria-label="Refresh activity"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 12,
            color: "#64748b",
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            padding: "5px 10px",
            borderRadius: 6,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          <RefreshCw size={12} style={loading ? { animation: "spin 0.8s linear infinite" } : {}} />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && <LoadingSpinner message="Loading activity..." size={22} />}

      {/* Error */}
      {error && !loading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: 14,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 8,
          }}
        >
          <AlertCircle size={18} color="#dc2626" />
          <span style={{ fontSize: 13, color: "#b91c1c", flex: 1 }}>{error}</span>
          <button
            type="button"
            onClick={fetchActivities}
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: "4px 10px",
              background: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && activities.length === 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "32px 16px",
            gap: 8,
          }}
        >
          <History size={32} color="#cbd5e1" />
          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
            No activity recorded yet.
          </p>
        </div>
      )}

      {/* Timeline */}
      {!loading && !error && activities.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {activities.map((activity, index) => {
            const isLast = index === activities.length - 1;
            const { icon, bg, border } = getActionIcon(activity.action);
            return (
              <div key={activity.id ?? index} style={{ display: "flex", gap: 14 }}>
                {/* Axis */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: 28,
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: bg,
                      border: `1px solid ${border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </div>
                  {!isLast && (
                    <div
                      style={{
                        width: 2,
                        flex: 1,
                        background: "#e2e8f0",
                        margin: "4px 0",
                        minHeight: 16,
                      }}
                    />
                  )}
                </div>

                {/* Content */}
                <div
                  style={{
                    flex: 1,
                    paddingBottom: isLast ? 0 : 18,
                  }}
                >
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 8,
                        marginBottom: activity.details ? 8 : 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#1e293b",
                          background: "#e2e8f0",
                          padding: "2px 8px",
                          borderRadius: 4,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {getActionLabel(activity.action)}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 11,
                          color: "#64748b",
                        }}
                      >
                        <Clock size={11} />
                        <span>{formatDate(activity.createdAt)}</span>
                      </div>
                    </div>

                    {activity.details && (
                      <p style={{ fontSize: 13, color: "#334155", margin: "0 0 6px", lineHeight: "1.5" }}>
                        {activity.details}
                      </p>
                    )}

                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#94a3b8" }}>
                      <UserIcon size={11} />
                      <span>User: <strong style={{ color: "#64748b" }}>{activity.userId}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;
