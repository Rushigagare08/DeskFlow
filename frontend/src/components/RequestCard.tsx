import React from "react";
import { Calendar, Clock, ChevronRight, User } from "lucide-react";
import type { CustomerRequest } from "../types";
import { StatusBadge } from "./StatusBadge";

interface RequestCardProps {
  request: CustomerRequest;
  onClick?: () => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request, onClick }) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      onClick={onClick}
      style={styles.card}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick?.();
        }
      }}
    >
      <div style={styles.topRow}>
        <div style={styles.customerInfo}>
          <div style={styles.avatar}>
            <User size={16} color="#475569" />
          </div>
          <div>
            <h4 style={styles.customerName}>{request.customerName}</h4>
            <p style={styles.serviceName}>{request.requestedService}</p>
          </div>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div style={styles.metaRow}>
        <div style={styles.metaItem}>
          <Calendar size={14} color="#64748b" />
          <span>Scheduled: <strong>{request.scheduledDate || "-"}</strong></span>
        </div>
        <div style={styles.metaItem}>
          <Clock size={14} color="#64748b" />
          <span>Created: {formatDate(request.createdAt)}</span>
        </div>
        <ChevronRight size={18} color="#94a3b8" style={{ marginLeft: "auto" }} />
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "12px",
    cursor: "pointer",
    transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },
  customerInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  customerName: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "600",
    color: "#0f172a",
  },
  serviceName: {
    margin: "2px 0 0 0",
    fontSize: "13px",
    color: "#475569",
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    fontSize: "12px",
    color: "#64748b",
    paddingTop: "8px",
    borderTop: "1px solid #f1f5f9",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
};

export default RequestCard;
