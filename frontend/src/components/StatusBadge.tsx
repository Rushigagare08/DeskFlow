import React from "react";
import type { RequestStatus } from "../types";

interface StatusBadgeProps {
  status: RequestStatus;
}

const STATUS_CONFIG: Record<
  RequestStatus,
  { bg: string; color: string; border: string; dot: string; label: string }
> = {
  NEW: {
    bg: "#fffbeb",
    color: "#92400e",
    border: "#fef3c7",
    dot: "#f59e0b",
    label: "New",
  },
  QUALIFIED: {
    bg: "#ecfdf5",
    color: "#065f46",
    border: "#a7f3d0",
    dot: "#10b981",
    label: "Qualified",
  },
  CLOSED: {
    bg: "#f1f5f9",
    color: "#334155",
    border: "#cbd5e1",
    dot: "#64748b",
    label: "Closed",
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.CLOSED;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.02em",
        border: `1px solid ${cfg.border}`,
        backgroundColor: cfg.bg,
        color: cfg.color,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: cfg.dot,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
