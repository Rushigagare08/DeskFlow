import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Building2, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { login, getWorkspaces } from "../services/api";
import type { Workspace } from "../types";
import { DeskFlowLogo } from "../components/DeskFlowLogo";

export const Login: React.FC = () => {
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [errors, setErrors] = useState<{
    workspaceId?: string;
    email?: string;
    password?: string;
    general?: string;
  }>({});

  useEffect(() => {
    document.title = "DeskFlow — Sign In";
    let isMounted = true;
    getWorkspaces()
      .then((data) => {
        if (isMounted) {
          setWorkspaces(data);
          if (data.length > 0) {
            // Default to empty selection so user must explicitly choose, or preselect if wanted
            // Requirement specifies: Workspace dropdown with "[ Select workspace ]" or options
          }
        }
      })
      .catch((err) => {
        console.error("Failed to fetch workspaces:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingWorkspaces(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!workspaceId) {
      newErrors.workspaceId = "Please select a workspace";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!password) {
      newErrors.password = "Password is required";
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
      const response = await login(email.trim(), password, workspaceId);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      navigate("/dashboard");
    } catch (err: any) {
      setErrors({ general: err.message || "Login failed. Please check your credentials and workspace." });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoWsId: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setWorkspaceId(demoWsId);
    setErrors({});
  };

  return (
    <div style={container}>
      <div style={card}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <DeskFlowLogo size="lg" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
            Sign in to manage your customer requests.
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
          {/* Workspace dropdown */}
          <div style={fieldGroup}>
            <label htmlFor="login-workspace" style={label}>
              Workspace
            </label>
            <div style={inputWrapper}>
              <Building2 size={16} style={inputIcon} />
              <select
                id="login-workspace"
                value={workspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)}
                disabled={loading || loadingWorkspaces}
                style={{
                  ...inputBase,
                  borderColor: errors.workspaceId ? "#ef4444" : "#d1d5db",
                  appearance: "none",
                  backgroundColor: "#ffffff",
                  cursor: "pointer",
                }}
              >
                <option value="" disabled>
                  {loadingWorkspaces ? "Loading workspaces..." : "Select workspace"}
                </option>
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name}
                  </option>
                ))}
              </select>
              <div style={selectArrow}>▼</div>
            </div>
            {errors.workspaceId && <span style={fieldError}>{errors.workspaceId}</span>}
          </div>

          {/* Email */}
          <div style={fieldGroup}>
            <label htmlFor="login-email" style={label}>
              Email Address
            </label>
            <div style={inputWrapper}>
              <Mail size={16} style={inputIcon} />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                style={{
                  ...inputBase,
                  borderColor: errors.email ? "#ef4444" : "#d1d5db",
                }}
              />
            </div>
            {errors.email && <span style={fieldError}>{errors.email}</span>}
          </div>

          {/* Password */}
          <div style={fieldGroup}>
            <label htmlFor="login-password" style={label}>
              Password
            </label>
            <div style={inputWrapper}>
              <Lock size={16} style={inputIcon} />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
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
                <span>Signing in...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Demo accounts */}
        <div style={divider}>
          <span style={dividerLabel}>Demo accounts</span>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { email: "aarav@brightpath.demo", wsId: "ws-1", label: "BrightPath (Aarav)" },
            { email: "ananya@novaworks.demo", wsId: "ws-2", label: "NovaWorks (Ananya)" },
          ].map(({ email: dEmail, wsId: dWsId, label: dLabel }) => (
            <button
              key={dEmail}
              type="button"
              onClick={() => handleQuickFill(dEmail, dWsId)}
              disabled={loading}
              style={demoBtn}
            >
              {dLabel}
            </button>
          ))}
        </div>

        {/* Register link */}
        <div style={footer}>
          <span style={{ fontSize: 13, color: "#64748b" }}>Don't have an account?</span>
          <Link to="/register" style={{ fontSize: 13, fontWeight: 600, color: "#4f46e5" }}>
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

// Styles
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

const form: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 18,
};

const fieldGroup: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  textAlign: "left",
};

const label: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "#334155",
};

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

const selectArrow: React.CSSProperties = {
  position: "absolute",
  right: 12,
  fontSize: 10,
  color: "#94a3b8",
  pointerEvents: "none",
};

const inputBase: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px 10px 38px",
  fontSize: 14,
  borderRadius: 8,
  border: "1px solid #d1d5db",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
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

const fieldError: React.CSSProperties = {
  fontSize: 12,
  color: "#dc2626",
};

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

const divider: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  margin: "24px 0 12px",
};

const dividerLabel: React.CSSProperties = {
  fontSize: 11,
  color: "#94a3b8",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  margin: "0 auto",
};

const demoBtn: React.CSSProperties = {
  padding: "5px 12px",
  fontSize: 12,
  color: "#475569",
  background: "#f1f5f9",
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  cursor: "pointer",
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

export default Login;
