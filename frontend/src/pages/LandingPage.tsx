import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Inbox,
  ShieldCheck,
  Workflow,
  CheckCircle2,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { DeskFlowLogo } from "../components/DeskFlowLogo";

export const LandingPage: React.FC = () => {
  useEffect(() => {
    document.title = "DeskFlow — Turn Customer Requests into Completed Work";
  }, []);

  return (
    <div style={pageContainer}>
      {/* Navigation Header */}
      <header style={headerStyle}>
        <div style={headerInner}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <DeskFlowLogo size="md" showTagline={false} />
          </Link>
          <div style={navButtons}>
            <Link to="/login" style={loginBtnStyle}>
              Sign In
            </Link>
            <Link to="/register" style={getStartedNavBtn}>
              Get Started
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main style={mainContent}>
        <section style={heroSection}>
          <div style={badgeContainer}>
            <span style={badge}>
              <Sparkles size={14} color="#4f46e5" />
              <span>Modern Customer Request Operations</span>
            </span>
          </div>

          <h1 style={heroHeadline}>
            Turn customer requests into{" "}
            <span style={heroGradientText}>completed work.</span>
          </h1>

          <p style={heroSubtext}>
            DeskFlow streamlines intake, team coordination, and delivery into a single,
            isolated workspace. Capture client needs, qualify opportunities, and convert
            them directly into actionable work items.
          </p>

          <div style={ctaGroup}>
            <Link to="/register" style={primaryCtaBtn}>
              Get Started Free
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" style={secondaryCtaBtn}>
              Login to Workspace
            </Link>
          </div>

          <div style={highlightsRow}>
            <div style={highlightItem}>
              <CheckCircle2 size={16} color="#10b981" />
              <span>Multi-tenant Isolation</span>
            </div>
            <div style={highlightItem}>
              <CheckCircle2 size={16} color="#10b981" />
              <span>Real-time Status Tracking</span>
            </div>
            <div style={highlightItem}>
              <CheckCircle2 size={16} color="#10b981" />
              <span>1-Click Work Item Handoff</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section style={featuresSection}>
          <div style={sectionHeadingWrapper}>
            <h2 style={sectionTitle}>Everything your team needs to deliver</h2>
            <p style={sectionSubtitle}>
              Built from the ground up for agencies, consultancies, and internal service desks.
            </p>
          </div>

          <div style={featuresGrid}>
            {/* Feature 1: Request Management */}
            <div style={featureCard}>
              <div style={{ ...iconCircle, background: "#eef2ff", color: "#4f46e5" }}>
                <Inbox size={24} />
              </div>
              <h3 style={featureHeading}>Request Management</h3>
              <p style={featureDescription}>
                Centralize incoming service requests from clients. Track priorities, scheduled
                dates, contact details, and progress through NEW, QUALIFIED, and CLOSED stages.
              </p>
              <div style={featureFooter}>
                <span style={featureTag}>Status Pipelines</span>
                <span style={featureTag}>Audit Timeline</span>
              </div>
            </div>

            {/* Feature 2: Workspace Isolation */}
            <div style={featureCard}>
              <div style={{ ...iconCircle, background: "#ecfdf5", color: "#059669" }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={featureHeading}>Workspace Isolation</h3>
              <p style={featureDescription}>
                Strict multi-tenant security guarantees that data, user accounts, and customer
                requests remain strictly partitioned and accessible only within authorized workspaces.
              </p>
              <div style={featureFooter}>
                <span style={featureTag}>Role-Based Access</span>
                <span style={featureTag}>Zero Data Leakage</span>
              </div>
            </div>

            {/* Feature 3: Request-to-Work Conversion */}
            <div style={featureCard}>
              <div style={{ ...iconCircle, background: "#faf5ff", color: "#7c3aed" }}>
                <Workflow size={24} />
              </div>
              <h3 style={featureHeading}>Request-to-Work Conversion</h3>
              <p style={featureDescription}>
                Instantly convert qualified customer requests into tracked execution tasks.
                Maintain a verifiable link between the client's original order and internal delivery.
              </p>
              <div style={featureFooter}>
                <span style={featureTag}>1-Click Conversion</span>
                <span style={featureTag}>Execution Work Items</span>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section style={ctaBanner}>
          <div style={ctaBannerContent}>
            <h2 style={ctaBannerTitle}>Ready to streamline your client desk?</h2>
            <p style={ctaBannerSubtitle}>
              Experience the fast, isolated, and structured request management platform.
            </p>
            <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/register" style={primaryCtaBtn}>
                Get Started Now
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={footerStyle}>
        <div style={footerInner}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <DeskFlowLogo size="sm" showTagline={false} />
            <span style={{ fontSize: 13, color: "#64748b" }}>
              — Turn customer requests into completed work.
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>
            © {new Date().getFullYear()} DeskFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

// Styles
const pageContainer: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#f8fafc",
  color: "#0f172a",
};

const headerStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 30,
  backgroundColor: "rgba(255, 255, 255, 0.85)",
  backdropFilter: "blur(12px)",
  borderBottom: "1px solid #e2e8f0",
  padding: "12px 24px",
};

const headerInner: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const navButtons: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const loginBtnStyle: React.CSSProperties = {
  padding: "8px 16px",
  fontSize: 14,
  fontWeight: 600,
  color: "#475569",
  textDecoration: "none",
  borderRadius: 8,
  transition: "all 0.15s ease",
};

const getStartedNavBtn: React.CSSProperties = {
  padding: "8px 18px",
  fontSize: 14,
  fontWeight: 600,
  color: "#ffffff",
  backgroundColor: "#4f46e5",
  textDecoration: "none",
  borderRadius: 8,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  boxShadow: "0 1px 3px rgba(79, 70, 229, 0.3)",
};

const mainContent: React.CSSProperties = {
  flex: 1,
  maxWidth: 1200,
  margin: "0 auto",
  padding: "48px 24px 80px",
  width: "100%",
};

const heroSection: React.CSSProperties = {
  textAlign: "center",
  padding: "40px 16px 64px",
  maxWidth: 820,
  margin: "0 auto",
};

const badgeContainer: React.CSSProperties = {
  display: "inline-flex",
  marginBottom: 20,
};

const badge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 14px",
  backgroundColor: "#eef2ff",
  border: "1px solid #e0e7ff",
  borderRadius: 9999,
  color: "#4f46e5",
  fontSize: 13,
  fontWeight: 600,
};

const heroHeadline: React.CSSProperties = {
  fontSize: "clamp(32px, 5vw, 54px)",
  fontWeight: 800,
  lineHeight: 1.15,
  letterSpacing: "-0.03em",
  color: "#0f172a",
  margin: "0 0 20px",
};

const heroGradientText: React.CSSProperties = {
  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const heroSubtext: React.CSSProperties = {
  fontSize: "clamp(16px, 2vw, 19px)",
  lineHeight: 1.6,
  color: "#475569",
  margin: "0 auto 36px",
  maxWidth: 680,
};

const ctaGroup: React.CSSProperties = {
  display: "flex",
  gap: 14,
  justifyContent: "center",
  flexWrap: "wrap",
  marginBottom: 36,
};

const primaryCtaBtn: React.CSSProperties = {
  padding: "13px 26px",
  fontSize: 15,
  fontWeight: 600,
  color: "#ffffff",
  backgroundColor: "#4f46e5",
  borderRadius: 10,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  boxShadow: "0 4px 14px rgba(79, 70, 229, 0.35)",
  transition: "transform 0.15s ease",
};

const secondaryCtaBtn: React.CSSProperties = {
  padding: "13px 24px",
  fontSize: 15,
  fontWeight: 600,
  color: "#1e293b",
  backgroundColor: "#ffffff",
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
};

const highlightsRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: 24,
  flexWrap: "wrap",
  color: "#64748b",
  fontSize: 13,
  fontWeight: 500,
  paddingTop: 12,
};

const highlightItem: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const featuresSection: React.CSSProperties = {
  paddingTop: 48,
  paddingBottom: 48,
};

const sectionHeadingWrapper: React.CSSProperties = {
  textAlign: "center",
  marginBottom: 48,
};

const sectionTitle: React.CSSProperties = {
  fontSize: "clamp(24px, 3.5vw, 34px)",
  fontWeight: 700,
  letterSpacing: "-0.02em",
  color: "#0f172a",
  margin: "0 0 10px",
};

const sectionSubtitle: React.CSSProperties = {
  fontSize: 16,
  color: "#64748b",
  margin: 0,
};

const featuresGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: 24,
};

const featureCard: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 32,
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
};

const iconCircle: React.CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 20,
};

const featureHeading: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: "#0f172a",
  margin: "0 0 12px",
};

const featureDescription: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.6,
  color: "#475569",
  margin: "0 0 24px",
  flex: 1,
};

const featureFooter: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  borderTop: "1px solid #f1f5f9",
  paddingTop: 16,
};

const featureTag: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#475569",
  backgroundColor: "#f1f5f9",
  padding: "4px 10px",
  borderRadius: 6,
};

const ctaBanner: React.CSSProperties = {
  marginTop: 64,
  background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
  borderRadius: 20,
  padding: "48px 24px",
  textAlign: "center",
  color: "#ffffff",
  boxShadow: "0 10px 25px -5px rgba(49, 46, 129, 0.4)",
};

const ctaBannerContent: React.CSSProperties = {
  maxWidth: 600,
  margin: "0 auto",
};

const ctaBannerTitle: React.CSSProperties = {
  fontSize: "clamp(22px, 3vw, 32px)",
  fontWeight: 700,
  margin: "0 0 10px",
  color: "#ffffff",
};

const ctaBannerSubtitle: React.CSSProperties = {
  fontSize: 15,
  color: "#c7d2fe",
  margin: 0,
};

const footerStyle: React.CSSProperties = {
  borderTop: "1px solid #e2e8f0",
  backgroundColor: "#ffffff",
  padding: "24px",
  marginTop: "auto",
};

const footerInner: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 16,
};

export default LandingPage;
