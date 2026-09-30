import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  size = 28,
  fullPage = false,
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: fullPage ? "0" : "40px 24px",
        minHeight: fullPage ? "100vh" : undefined,
        width: "100%",
        gap: 12,
      }}
    >
      <Loader2
        size={size}
        color="#4f46e5"
        style={{ animation: "spin 0.8s linear infinite" }}
      />
      {message && (
        <p style={{ fontSize: 14, color: "#64748b", margin: 0, fontWeight: 500 }}>
          {message}
        </p>
      )}
    </div>
  );
};

// Skeleton line component
export const SkeletonLine: React.FC<{ width?: string; height?: number }> = ({
  width = "100%",
  height = 16,
}) => (
  <div
    className="skeleton"
    style={{ width, height, borderRadius: 6 }}
    aria-hidden="true"
  />
);

// Skeleton card for dashboard stat cards
export const SkeletonStatCard: React.FC = () => (
  <div
    style={{
      background: "#ffffff",
      borderRadius: 12,
      border: "1px solid #e2e8f0",
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}
    aria-hidden="true"
  >
    <SkeletonLine width="40px" height={40} />
    <SkeletonLine width="60%" height={14} />
    <SkeletonLine width="40%" height={28} />
  </div>
);

// Skeleton row for table
export const SkeletonRow: React.FC = () => (
  <div
    style={{
      padding: "14px 20px",
      borderBottom: "1px solid #f1f5f9",
      display: "flex",
      gap: 16,
      alignItems: "center",
    }}
    aria-hidden="true"
  >
    <SkeletonLine width="18%" height={14} />
    <SkeletonLine width="24%" height={14} />
    <SkeletonLine width="14%" height={14} />
    <SkeletonLine width="10%" height={22} />
    <SkeletonLine width="14%" height={14} />
    <SkeletonLine width="8%" height={30} />
  </div>
);

export default LoadingSpinner;
