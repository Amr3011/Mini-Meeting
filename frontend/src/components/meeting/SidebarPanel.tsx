import React, { type ReactNode } from "react";

interface SidebarPanelProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Reusable Sidebar Panel Component
 * Used for Chat and Admin panels
 */
export const SidebarPanel: React.FC<SidebarPanelProps> = ({
  title,
  onClose,
  children,
}) => {
  return (
    <div
      className="modern-sidebar"
      style={{
        width: "min(360px, 100vw)",
        maxWidth: "360px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderLeft: "1px solid var(--lk-border-color)",
        backgroundColor: "var(--lk-bg2)",
        boxShadow: "-4px 0 16px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <h3 className="sidebar-title">{title}</h3>
        <button className="sidebar-close-btn" onClick={onClose} title="Close">
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Sidebar Content */}
      {children}
    </div>
  );
};
