"use client";

import React from "react";

interface WorkspaceTabsProps {
  activeTab: "history" | "summary";
  setActiveTab: (tab: "history" | "summary") => void;
  reviewCount: number;
  hasSummary: boolean;
}

export function WorkspaceTabs({
  activeTab,
  setActiveTab,
  reviewCount,
  hasSummary,
}: WorkspaceTabsProps) {
  return (
    <div className="h-12 shrink-0 border-b border-border/40 px-6 flex items-center bg-muted/5">
      <div className="flex gap-4 items-center h-full">
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`text-[10px] font-bold uppercase tracking-wider transition-all h-full border-b-2 px-1 flex items-center ${
            activeTab === "history"
              ? "border-primary text-foreground font-extrabold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          PR Review History {reviewCount > 0 ? `(${reviewCount})` : ""}
        </button>

        {hasSummary && (
          <button
            type="button"
            onClick={() => setActiveTab("summary")}
            className={`text-[10px] font-bold uppercase tracking-wider transition-all h-full border-b-2 px-1 flex items-center ${
              activeTab === "summary"
                ? "border-primary text-foreground font-extrabold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Architecture Summary
          </button>
        )}
      </div>
    </div>
  );
}
