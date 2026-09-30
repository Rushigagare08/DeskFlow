import React from "react";

export type FilterOption = "ALL" | "NEW" | "QUALIFIED" | "CLOSED";

const FILTERS: { value: FilterOption; label: string; dotColor: string }[] = [
  { value: "ALL", label: "All", dotColor: "transparent" },
  { value: "NEW", label: "New", dotColor: "#f59e0b" },
  { value: "QUALIFIED", label: "Qualified", dotColor: "#10b981" },
  { value: "CLOSED", label: "Closed", dotColor: "#64748b" },
];

interface StatusFilterProps {
  currentFilter: FilterOption;
  onFilterChange: (f: FilterOption) => void;
  disabled?: boolean;
  counts?: Partial<Record<FilterOption, number>>;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({
  currentFilter,
  onFilterChange,
  disabled,
  counts,
}) => {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        background: "#f1f5f9",
        borderRadius: 8,
        padding: 4,
        width: "fit-content",
        flexWrap: "wrap",
      }}
      role="tablist"
      aria-label="Filter requests by status"
    >
      {FILTERS.map((f) => {
        const active = currentFilter === f.value;
        return (
          <button
            key={f.value}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onFilterChange(f.value)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              border: "none",
              cursor: disabled ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: active ? "#ffffff" : "transparent",
              color: active ? "#1e293b" : "#64748b",
              boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              opacity: disabled ? 0.6 : 1,
            }}
          >
            {f.dotColor !== "transparent" && (
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: f.dotColor,
                  flexShrink: 0,
                }}
              />
            )}
            {f.label}
            {counts && counts[f.value] !== undefined && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  background: active ? "#e0e7ff" : "#e2e8f0",
                  color: active ? "#4f46e5" : "#64748b",
                  borderRadius: 9999,
                  padding: "1px 6px",
                  minWidth: 18,
                  textAlign: "center",
                }}
              >
                {counts[f.value]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default StatusFilter;
