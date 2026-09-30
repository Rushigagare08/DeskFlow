import React from "react";
import { ArrowRight, Calendar, User, Wrench } from "lucide-react";
import type { CustomerRequest } from "../types";
import { StatusBadge } from "./StatusBadge";

interface RequestTableProps {
  requests: CustomerRequest[];
  onSelectRequest: (r: CustomerRequest) => void;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
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

// Desktop table view
const DesktopTable: React.FC<RequestTableProps> = ({ requests, onSelectRequest }) => (
  <div className="desktop-table-view" style={{ overflowX: "auto" }}>
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        tableLayout: "fixed",
      }}
    >
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
                whiteSpace: "nowrap",
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
        {requests.map((req, idx) => (
          <tr
            key={req.id}
            onClick={() => onSelectRequest(req)}
            style={{
              borderBottom:
                idx < requests.length - 1 ? "1px solid #f1f5f9" : "none",
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
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: "#eef2ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <User size={14} color="#4f46e5" />
                </div>
                <span
                  style={{
                    fontWeight: 600,
                    color: "#0f172a",
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {req.customerName}
                </span>
              </div>
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
                  onSelectRequest(req);
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
                  transition: "all 0.15s ease",
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
);

// Mobile card view
const MobileCards: React.FC<RequestTableProps> = ({ requests, onSelectRequest }) => (
  <div className="mobile-card-view" style={{ display: "flex", flexDirection: "column", gap: 1 }}>
    {requests.map((req) => (
      <div
        key={req.id}
        onClick={() => onSelectRequest(req)}
        style={{
          padding: "16px",
          borderBottom: "1px solid #f1f5f9",
          cursor: "pointer",
          transition: "background 0.1s ease",
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onSelectRequest(req);
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLDivElement).style.background = "#f8fafc")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLDivElement).style.background = "transparent")
        }
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 10,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
              {req.customerName}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              {formatDate(req.createdAt)}
            </div>
          </div>
          <StatusBadge status={req.status} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <Wrench size={13} color="#94a3b8" />
            <span style={{ color: "#475569" }}>{req.requestedService}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <Calendar size={13} color="#94a3b8" />
            <span style={{ color: "#475569" }}>{req.scheduledDate || "—"}</span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const RequestTable: React.FC<RequestTableProps> = ({ requests, onSelectRequest }) => (
  <>
    <DesktopTable requests={requests} onSelectRequest={onSelectRequest} />
    <MobileCards requests={requests} onSelectRequest={onSelectRequest} />
  </>
);

const td: React.CSSProperties = {
  padding: "12px 16px",
  verticalAlign: "middle",
};

export default RequestTable;
