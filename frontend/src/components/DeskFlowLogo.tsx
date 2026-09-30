import React from "react";
import { ArrowRight } from "lucide-react";

interface DeskFlowLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light";
  showTagline?: boolean;
}

export const DeskFlowLogo: React.FC<DeskFlowLogoProps> = ({
  size = "md",
  variant = "dark",
  showTagline = false,
}) => {
  const iconSize = size === "sm" ? 16 : size === "lg" ? 28 : 20;
  const iconBoxSize = size === "sm" ? 28 : size === "lg" ? 48 : 36;
  const titleSize = size === "sm" ? 16 : size === "lg" ? 26 : 20;
  const taglineSize = 11;

  const titleColor = variant === "light" ? "#ffffff" : "#1e1b4b";
  const taglineColor = variant === "light" ? "#a5b4fc" : "#6366f1";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {/* Icon mark */}
      <div
        style={{
          width: iconBoxSize,
          height: iconBoxSize,
          borderRadius: 8,
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(79,70,229,0.35)",
        }}
      >
        <ArrowRight size={iconSize} color="#ffffff" strokeWidth={2.5} />
      </div>

      {/* Wordmark */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span
          style={{
            fontSize: titleSize,
            fontWeight: 800,
            color: titleColor,
            letterSpacing: "-0.025em",
            lineHeight: 1,
          }}
        >
          DeskFlow
        </span>
        {showTagline && (
          <span
            style={{
              fontSize: taglineSize,
              color: taglineColor,
              marginTop: 3,
              fontWeight: 400,
              lineHeight: 1,
            }}
          >
            Turn customer requests into completed work.
          </span>
        )}
      </div>
    </div>
  );
};

export default DeskFlowLogo;
