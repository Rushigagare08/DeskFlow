import React from "react";

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout-container">
      <header className="layout-header">
        <h1>Client Request Desk</h1>
      </header>
      <main className="layout-main">{children}</main>
    </div>
  );
};

export default Layout;
