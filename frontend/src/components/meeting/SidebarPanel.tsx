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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid var(--lk-border-color)",
          backgroundColor: "var(--lk-bg2)",
          flexShrink: 0,
        }}
      >
        <h3
          style={{
            color: "var(--lk-fg)",
            fontWeight: "600",
            margin: 0,
            fontSize: "15px",
          }}
        >
          {title}
        </h3>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--lk-fg2)",
            cursor: "pointer",
            padding: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "6px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--lk-bg)";
            e.currentTarget.style.color = "var(--lk-fg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--lk-fg2)";
          }}
          title="Close"
        >
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
