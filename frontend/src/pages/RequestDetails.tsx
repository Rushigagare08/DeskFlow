import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Briefcase,
  Calendar,
  Clock,
  User as UserIcon,
  Mail,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { getRequest, createWorkItem } from "../services/api";
import type { CustomerRequest, User } from "../types";
import { AppLayout } from "../components/AppLayout";
import { StatusBadge } from "../components/StatusBadge";
import { ActivityTimeline } from "../components/ActivityTimeline";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ToastContainer, useToast } from "../components/Toast";

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

export const RequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const [request, setRequest] = useState<CustomerRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);

  useEffect(() => {
    document.title = "DeskFlow — Request Details";
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        setCurrentUser(JSON.parse(userJson));
      } catch {
        setCurrentUser(null);
      }
    }
  }, []);

  const fetchRequest = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getRequest(id);
      setRequest(data);
    } catch (err: any) {
      setError(err.message || "Failed to load request details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleOpenConversionModal = () => {
    if (!request || request.status !== "QUALIFIED") return;
    setConversionError(null);
    setIsModalOpen(true);
  };

  const handleConfirmConversion = async () => {
    if (!request || request.status !== "QUALIFIED") return;
    setIsConverting(true);
    setConversionError(null);
    try {
      await createWorkItem(request.id);
      setIsModalOpen(false);
      addToast("Work Item created successfully!", "success");
      await fetchRequest();
      setActivityRefreshKey((prev) => prev + 1);
    } catch (err: any) {
      setConversionError(err.message || "Failed to convert request to Work Item.");
    } finally {
      setIsConverting(false);
    }
  };

  const isQualified = request?.status === "QUALIFIED";

  return (
    <AppLayout user={currentUser} onLogout={handleLogout}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Back button */}
      <div style={{ marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => navigate("/requests")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            fontSize: 13,
            fontWeight: 500,
            color: "#475569",
            background: "#f1f5f9",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={15} /> Back to Requests
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            padding: "48px 24px",
          }}
        >
          <LoadingSpinner message="Loading request details..." />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div
          style={{
            background: "#fef2f2",
            borderRadius: 12,
            border: "1px solid #fecaca",
            padding: "48px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <AlertCircle size={36} color="#dc2626" />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#991b1b", margin: 0 }}>
            Error Loading Request
          </h3>
          <p style={{ fontSize: 14, color: "#b91c1c", margin: 0 }}>{error}</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={fetchRequest}
              style={{
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 500,
                color: "#ffffff",
                background: "#dc2626",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => navigate("/requests")}
              style={{
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 500,
                color: "#475569",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Back to Requests
            </button>
          </div>
        </div>
      )}

      {/* Request details */}
      {!loading && !error && request && (
        <div>
          {/* Main card */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              padding: 28,
              textAlign: "left",
            }}
          >
            {/* Title row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 16,
                paddingBottom: 20,
                marginBottom: 20,
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <StatusBadge status={request.status} />
                  <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
                    ID: {request.id}
                  </span>
                </div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  {request.requestedService}
                </h1>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => navigate(`/requests/${request.id}/edit`)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#334155",
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  <Edit size={15} /> Edit Request
                </button>

                <button
                  type="button"
                  onClick={handleOpenConversionModal}
                  disabled={!isQualified}
                  title={
                    !isQualified
                      ? `Cannot convert: status must be QUALIFIED (currently ${request.status})`
                      : "Convert this qualified request into a Work Item"
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#ffffff",
                    background: isQualified ? "#059669" : "#94a3b8",
                    border: "none",
                    borderRadius: 8,
                    cursor: isQualified ? "pointer" : "not-allowed",
                    opacity: isQualified ? 1 : 0.7,
                    transition: "all 0.15s ease",
                  }}
                >
                  <Briefcase size={15} /> Create Work Item
                </button>
              </div>
            </div>

            {/* Status notice */}
            {!isQualified && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 14px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#64748b",
                  marginBottom: 20,
                }}
              >
                <AlertCircle size={14} />
                <span>
                  Only <strong>QUALIFIED</strong> requests can be converted into Work Items.
                  Current status: <strong>{request.status}</strong>.
                </span>
              </div>
            )}

            {/* Info grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 16,
                marginBottom: request.notes ? 20 : 0,
              }}
            >
              {/* Customer info */}
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  padding: 20,
                }}
              >
                <h3
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    margin: "0 0 14px",
                  }}
                >
                  Customer Information
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <UserIcon size={15} color="#94a3b8" style={{ marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>Customer Name</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginTop: 2 }}>
                        {request.customerName}
                      </div>
                    </div>
                  </div>
                  {request.customerEmail && (
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <Mail size={15} color="#94a3b8" style={{ marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>Email</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginTop: 2 }}>
                          {request.customerEmail}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Service & timing */}
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  padding: 20,
                }}
              >
                <h3
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    margin: "0 0 14px",
                  }}
                >
                  Service & Timing
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <Calendar size={15} color="#94a3b8" style={{ marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>Scheduled Date</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginTop: 2 }}>
                        {request.scheduledDate || "—"}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <Clock size={15} color="#94a3b8" style={{ marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>Created</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginTop: 2 }}>
                        {formatDate(request.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <Clock size={15} color="#94a3b8" style={{ marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>Last Updated</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginTop: 2 }}>
                        {formatDate(request.updatedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {request.notes && (
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  padding: 20,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <FileText size={15} color="#94a3b8" />
                  <h3
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      margin: 0,
                    }}
                  >
                    Notes / Requirements
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: "#334155",
                    lineHeight: 1.6,
                    margin: 0,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {request.notes}
                </p>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <ActivityTimeline key={activityRefreshKey} requestId={request.id} />

          {/* Work Item Conversion Modal */}
          <ConfirmationModal
            open={isModalOpen}
            title="Create Work Item?"
            confirmText="Create Work Item"
            cancelText="Cancel"
            loading={isConverting}
            error={conversionError}
            onConfirm={handleConfirmConversion}
            onCancel={() => {
              if (!isConverting) {
                setIsModalOpen(false);
                setConversionError(null);
              }
            }}
            confirmVariant="success"
          >
            <div>
              {/* Warning */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "#fffbeb",
                  border: "1px solid #fef3c7",
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginBottom: 16,
                  fontSize: 13,
                  color: "#92400e",
                  fontWeight: 500,
                }}
              >
                <CheckCircle2 size={15} color="#d97706" />
                This will convert the qualified request into a work item.
              </div>

              {/* Request summary */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  fontSize: 13,
                }}
              >
                {[
                  { label: "Customer", value: request.customerName },
                  { label: "Requested Service", value: request.requestedService },
                  { label: "Scheduled Date", value: request.scheduledDate || "—" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ color: "#64748b" }}>{label}</span>
                    <strong style={{ color: "#0f172a", textAlign: "right" }}>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </ConfirmationModal>
        </div>
      )}
    </AppLayout>
  );
};

export default RequestDetails;
