import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Wrench,
  Calendar,
  AlertCircle,
  Loader2,
  PlusCircle,
  Edit,
  FileText,
  Save,
} from "lucide-react";
import { createRequest, getRequest, updateRequest } from "../services/api";
import type { RequestStatus, User } from "../types";
import { AppLayout } from "../components/AppLayout";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ToastContainer, useToast } from "../components/Toast";

export const RequestForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const isEditMode = Boolean(id);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [requestedService, setRequestedService] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [status, setStatus] = useState<RequestStatus>("NEW");
  const [notes, setNotes] = useState("");
  const [initialLoading, setInitialLoading] = useState<boolean>(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    customerName?: string;
    customerEmail?: string;
    requestedService?: string;
    scheduledDate?: string;
    status?: string;
    general?: string;
  }>({});

  useEffect(() => {
    document.title = isEditMode ? "DeskFlow — Edit Request" : "DeskFlow — New Request";
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        setCurrentUser(JSON.parse(userJson));
      } catch {
        setCurrentUser(null);
      }
    }
  }, [isEditMode]);

  const loadExistingRequest = useCallback(async () => {
    if (!id) return;
    setInitialLoading(true);
    setErrors({});
    try {
      const data = await getRequest(id);
      setCustomerName(data.customerName || "");
      setCustomerEmail(data.customerEmail || "");
      setRequestedService(data.requestedService || "");
      setScheduledDate(data.scheduledDate || "");
      setStatus(data.status || "NEW");
      setNotes(data.notes || "");
    } catch (err: any) {
      setErrors({ general: err.message || "Failed to load request for editing." });
    } finally {
      setInitialLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEditMode) loadExistingRequest();
  }, [isEditMode, loadExistingRequest]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!customerName.trim()) newErrors.customerName = "Customer name is required";
    if (
      customerEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())
    ) {
      newErrors.customerEmail = "Please enter a valid email address";
    }
    if (!requestedService.trim()) newErrors.requestedService = "Requested service is required";
    if (!scheduledDate.trim()) newErrors.scheduledDate = "Scheduled date is required";
    if (!status) newErrors.status = "Status is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});
    try {
      const payload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || undefined,
        requestedService: requestedService.trim(),
        scheduledDate: scheduledDate.trim(),
        status,
        notes: notes.trim() || undefined,
      };
      if (isEditMode && id) {
        await updateRequest(id, payload);
        addToast("Request updated successfully!", "success");
        navigate(`/requests/${id}`);
      } else {
        const newRequest = await createRequest(payload);
        addToast("Request created successfully!", "success");
        navigate(`/requests/${newRequest.id}`);
      }
    } catch (err: any) {
      setErrors({
        general: err.message || (isEditMode ? "Failed to update request." : "Failed to create request."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout user={currentUser} onLogout={handleLogout}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Back button */}
      <div style={{ marginBottom: 20 }}>
        <button
          type="button"
          onClick={() =>
            isEditMode && id ? navigate(`/requests/${id}`) : navigate("/requests")
          }
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
          <ArrowLeft size={15} />
          {isEditMode ? "Back to Request" : "Back to Requests"}
        </button>
      </div>

      <div style={{ maxWidth: 720, width: "100%" }}>
        {/* Loading (edit mode fetch) */}
        {initialLoading ? (
          <div
            style={{
              background: "#ffffff",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              padding: "48px 24px",
            }}
          >
            <LoadingSpinner message="Loading request..." />
          </div>
        ) : (
          <div
            style={{
              background: "#ffffff",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              overflow: "hidden",
              textAlign: "left",
            }}
          >
            {/* Card header */}
            <div
              style={{
                padding: "22px 28px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "#eef2ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isEditMode ? (
                  <Edit size={20} color="#4f46e5" />
                ) : (
                  <PlusCircle size={20} color="#4f46e5" />
                )}
              </div>
              <div>
                <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 3px" }}>
                  {isEditMode ? "Edit Request" : "Create New Request"}
                </h1>
                <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                  {isEditMode
                    ? `Editing request ID: ${id}`
                    : "Submit a new customer service request."}
                </p>
              </div>
            </div>

            {/* Error banner */}
            {errors.general && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "12px 28px",
                  background: "#fef2f2",
                  borderBottom: "1px solid #fecaca",
                  color: "#b91c1c",
                  fontSize: 13,
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                {errors.general}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Customer Name */}
              <Field label="Customer Name" required error={errors.customerName}>
                <InputWrapper icon={<UserIcon size={15} color="#94a3b8" />}>
                  <input
                    id="customerName"
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    disabled={submitting}
                    style={{ ...inputBase, borderColor: errors.customerName ? "#ef4444" : "#d1d5db" }}
                  />
                </InputWrapper>
              </Field>

              {/* Customer Email */}
              <Field label="Customer Email" hint="Optional" error={errors.customerEmail}>
                <InputWrapper icon={<Mail size={15} color="#94a3b8" />}>
                  <input
                    id="customerEmail"
                    type="email"
                    placeholder="e.g. jane@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    disabled={submitting}
                    style={{ ...inputBase, borderColor: errors.customerEmail ? "#ef4444" : "#d1d5db" }}
                  />
                </InputWrapper>
              </Field>

              {/* Requested Service */}
              <Field label="Requested Service" required error={errors.requestedService}>
                <InputWrapper icon={<Wrench size={15} color="#94a3b8" />}>
                  <input
                    id="requestedService"
                    type="text"
                    placeholder="e.g. HVAC Maintenance, Electrical Repair"
                    value={requestedService}
                    onChange={(e) => setRequestedService(e.target.value)}
                    disabled={submitting}
                    style={{ ...inputBase, borderColor: errors.requestedService ? "#ef4444" : "#d1d5db" }}
                  />
                </InputWrapper>
              </Field>

              {/* Date + Status row */}
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 200px" }}>
                  <Field label="Scheduled Date" required error={errors.scheduledDate}>
                    <InputWrapper icon={<Calendar size={15} color="#94a3b8" />}>
                      <input
                        id="scheduledDate"
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        disabled={submitting}
                        style={{ ...inputBase, borderColor: errors.scheduledDate ? "#ef4444" : "#d1d5db" }}
                      />
                    </InputWrapper>
                  </Field>
                </div>
                <div style={{ flex: "1 1 200px" }}>
                  <Field label="Status" required error={errors.status}>
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as RequestStatus)}
                      disabled={submitting}
                      style={{
                        ...inputBase,
                        paddingLeft: 12,
                        borderColor: errors.status ? "#ef4444" : "#d1d5db",
                        background: "#ffffff",
                        appearance: "auto",
                      }}
                    >
                      <option value="NEW">New</option>
                      <option value="QUALIFIED">Qualified</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </Field>
                </div>
              </div>

              {/* Notes */}
              <Field label="Notes / Additional Details">
                <div style={{ position: "relative" }}>
                  <FileText
                    size={15}
                    color="#94a3b8"
                    style={{ position: "absolute", left: 12, top: 12, pointerEvents: "none" }}
                  />
                  <textarea
                    id="notes"
                    rows={4}
                    placeholder="Enter any additional requirements, special instructions, or context..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={submitting}
                    style={{
                      ...inputBase,
                      paddingTop: 10,
                      paddingLeft: 36,
                      resize: "vertical",
                      minHeight: 100,
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              </Field>

              {/* Form actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  paddingTop: 16,
                  borderTop: "1px solid #f1f5f9",
                  marginTop: 4,
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    isEditMode && id ? navigate(`/requests/${id}`) : navigate("/requests")
                  }
                  disabled={submitting}
                  style={{
                    padding: "9px 18px",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#475569",
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.6 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "9px 20px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#ffffff",
                    background: "#4f46e5",
                    border: "none",
                    borderRadius: 8,
                    cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.8 : 1,
                    transition: "all 0.15s ease",
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} />
                      {isEditMode ? "Saving..." : "Creating..."}
                    </>
                  ) : isEditMode ? (
                    <>
                      <Save size={15} /> Save Changes
                    </>
                  ) : (
                    <>
                      <PlusCircle size={15} /> Create Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

// Helper sub-components
const Field: React.FC<{
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}> = ({ label, required, hint, error, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>
      {label}
      {required && <span style={{ color: "#dc2626", marginLeft: 3 }}>*</span>}
      {hint && <span style={{ color: "#94a3b8", fontWeight: 400, marginLeft: 6 }}>({hint})</span>}
    </label>
    {children}
    {error && <span style={{ fontSize: 12, color: "#dc2626" }}>{error}</span>}
  </div>
);

const InputWrapper: React.FC<{
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ icon, children }) => (
  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
    <span
      style={{
        position: "absolute",
        left: 11,
        display: "flex",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      {icon}
    </span>
    {children}
  </div>
);

const inputBase: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px 10px 36px",
  fontSize: 14,
  borderRadius: 8,
  border: "1px solid #d1d5db",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s ease",
  fontFamily: "inherit",
  color: "#0f172a",
};

export default RequestForm;
