import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User as UserIcon,
  Mail,
  Lock,
  Building2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { register } from "../services/api";
import { DeskFlowLogo } from "../components/DeskFlowLogo";

export const Register: React.FC = () => {
  const navigate = useNavigate();

  const [workspaceName, setWorkspaceName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    workspaceName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  useEffect(() => {
    document.title = "DeskFlow — Create Account";
  }, []);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    if (!workspaceName.trim()) {
      newErrors.workspaceName = "Organization name is required";
    } else if (workspaceName.trim().length > 100) {
      newErrors.workspaceName = "Organization name must be 100 characters or fewer";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await register(name.trim(), email.trim(), password, workspaceName.trim());
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err: any) {
      setErrors({ general: err.message || "Registration failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={container}>
        <div style={card}>
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#ecfdf5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <CheckCircle2 size={32} color="#059669" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>
              Account Created!
            </h2>
            <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
              Your account has been created successfully. Redirecting to sign in...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={container}>
      <div style={card}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <DeskFlowLogo size="lg" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
            Create your account
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
            Start managing customer requests with DeskFlow.
          </p>
        </div>

        {/* Error banner */}
        {errors.general && (
          <div style={alertError}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errors.general}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate style={form}>
          {/* Full Name */}
          <div style={fieldGroup}>
            <label htmlFor="reg-name" style={labelStyle}>
              Full Name <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <div style={inputWrapper}>
              <UserIcon size={16} style={inputIcon} />
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                style={{ ...inputBase, borderColor: errors.name ? "#ef4444" : "#d1d5db" }}
              />
            </div>
            {errors.name && <span style={fieldError}>{errors.name}</span>}
          </div>

          {/* Organization Name */}
          <div style={fieldGroup}>
            <label htmlFor="reg-workspace" style={labelStyle}>
              Organization Name <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <div style={inputWrapper}>
              <Building2 size={16} style={inputIcon} />
              <input
                id="reg-workspace"
                type="text"
                autoComplete="organization"
                placeholder="e.g. Acme Corp"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                disabled={loading}
                maxLength={100}
                style={{
                  ...inputBase,
                  borderColor: errors.workspaceName ? "#ef4444" : "#d1d5db",
                }}
              />
            </div>
            {errors.workspaceName && <span style={fieldError}>{errors.workspaceName}</span>}
          </div>

          {/* Email */}
          <div style={fieldGroup}>
            <label htmlFor="reg-email" style={labelStyle}>
              Email Address <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <div style={inputWrapper}>
              <Mail size={16} style={inputIcon} />
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                style={{ ...inputBase, borderColor: errors.email ? "#ef4444" : "#d1d5db" }}
              />
            </div>
            {errors.email && <span style={fieldError}>{errors.email}</span>}
          </div>

          {/* Password */}
          <div style={fieldGroup}>
            <label htmlFor="reg-password" style={labelStyle}>
              Password <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <div style={inputWrapper}>
              <Lock size={16} style={inputIcon} />
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                style={{
                  ...inputBase,
                  paddingRight: 42,
                  borderColor: errors.password ? "#ef4444" : "#d1d5db",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={eyeBtn}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <span style={fieldError}>{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div style={fieldGroup}>
            <label htmlFor="reg-confirm" style={labelStyle}>
              Confirm Password <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <div style={inputWrapper}>
              <Lock size={16} style={inputIcon} />
              <input
                id="reg-confirm"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                style={{
                  ...inputBase,
                  paddingRight: 42,
                  borderColor: errors.confirmPassword ? "#ef4444" : "#d1d5db",
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                style={eyeBtn}
                tabIndex={-1}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span style={fieldError}>{errors.confirmPassword}</span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...submitBtn,
              opacity: loading ? 0.8 : 1,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: 4,
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />
                <span>Creating account...</span>
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Sign in link */}
        <div style={footer}>
          <span style={{ fontSize: 13, color: "#64748b" }}>Already have an account?</span>
          <Link to="/login" style={{ fontSize: 13, fontWeight: 600, color: "#4f46e5" }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

const container: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  background: "linear-gradient(160deg, #f0f4ff 0%, #f8fafc 60%)",
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 440,
  background: "#ffffff",
  borderRadius: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
  border: "1px solid #e2e8f0",
  padding: 36,
  boxSizing: "border-box",
  animation: "slideUp 0.25s ease",
};

const alertError: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  padding: "11px 14px",
  background: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: 8,
  color: "#b91c1c",
  fontSize: 13,
  marginBottom: 20,
};

const form: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 16 };

const fieldGroup: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 5,
  textAlign: "left",
};

const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#334155" };

const inputWrapper: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
};

const inputIcon: React.CSSProperties = {
  position: "absolute",
  left: 12,
  color: "#94a3b8",
  pointerEvents: "none",
  zIndex: 1,
};



const inputBase: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px 10px 38px",
  fontSize: 14,
  borderRadius: 8,
  border: "1px solid #d1d5db",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s ease",
  fontFamily: "inherit",
};

const eyeBtn: React.CSSProperties = {
  position: "absolute",
  right: 12,
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#94a3b8",
  display: "flex",
  alignItems: "center",
  padding: 0,
};

const fieldError: React.CSSProperties = { fontSize: 12, color: "#dc2626" };

const submitBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "11px",
  fontSize: 14,
  fontWeight: 600,
  color: "#ffffff",
  background: "#4f46e5",
  border: "none",
  borderRadius: 8,
  transition: "background 0.15s ease",
  width: "100%",
};

const footer: React.CSSProperties = {
  marginTop: 20,
  paddingTop: 20,
  borderTop: "1px solid #f1f5f9",
  display: "flex",
  gap: 6,
  justifyContent: "center",
  alignItems: "center",
};

export default Register;