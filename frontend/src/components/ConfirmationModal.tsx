import React, { useEffect } from "react";
import { X, Loader2, AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  open: boolean;
  title: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
  confirmVariant?: "primary" | "danger" | "success";
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  title,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  error,
  onConfirm,
  onCancel,
  children,
  confirmVariant = "primary",
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, loading, onCancel]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const confirmBg =
    confirmVariant === "danger"
      ? "#dc2626"
      : confirmVariant === "success"
      ? "#059669"
      : "#4f46e5";

  return (
    <div
      style={overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div style={dialog}>
        {/* Header */}
        <div style={header}>
          <h2 id="modal-title" style={titleStyle}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close dialog"
            style={closeBtn}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={body}>{children}</div>

        {/* Error */}
        {error && (
          <div style={errorBanner}>
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Footer */}
        <div style={footer}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: "9px 18px",
              fontSize: 13,
              fontWeight: 500,
              color: "#475569",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 20px",
              fontSize: 13,
              fontWeight: 600,
              color: "#ffffff",
              background: confirmBg,
              border: "none",
              borderRadius: 8,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading && (
              <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} />
            )}
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.5)",
  backdropFilter: "blur(2px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: 16,
  animation: "fadeIn 0.15s ease",
};

const dialog: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 14,
  boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
  width: "100%",
  maxWidth: 480,
  overflow: "hidden",
  animation: "slideUp 0.2s ease",
};

const header: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "18px 24px",
  borderBottom: "1px solid #f1f5f9",
};

const titleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: "#0f172a",
  margin: 0,
};

const closeBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#94a3b8",
  padding: 4,
  borderRadius: 6,
  transition: "color 0.15s ease",
};

const body: React.CSSProperties = {
  padding: "20px 24px",
};

const errorBanner: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  margin: "0 24px 4px",
  padding: "10px 14px",
  background: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: 8,
  color: "#b91c1c",
  fontSize: 13,
};

const footer: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  padding: "16px 24px",
  borderTop: "1px solid #f1f5f9",
  background: "#fafafa",
};

export default ConfirmationModal;
