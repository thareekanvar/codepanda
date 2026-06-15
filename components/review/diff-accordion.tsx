"use client";

import React, { useState } from "react";
import { ChevronRight, FileText, Search, X } from "lucide-react";
import { DiffViewer } from "./diff-viewer";
import { PrFile } from "@/components/app-context";
import { Input } from "@/components/ui/input";

interface DiffAccordionProps {
  changedFiles: PrFile[];
  expandedFiles: Record<string, boolean>;
  toggleFileExpanded: (filename: string) => void;
}

export function DiffAccordion({
  changedFiles,
  expandedFiles,
  toggleFileExpanded,
}: DiffAccordionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFiles = changedFiles.filter((file) =>
    file.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search changed files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9 h-9 text-xs bg-muted/10 border-border/40"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-2 h-5 w-5 flex items-center justify-center rounded-sm hover:bg-muted hover:text-foreground text-muted-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {filteredFiles.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-8 text-center bg-card/5">
          <p className="text-xs text-muted-foreground">No files matching &quot;{searchQuery}&quot;</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFiles.map((file, idx) => {
        const isExpanded = expandedFiles[file.filename] ?? (idx === 0);
        return (
          <div
            key={idx}
            className="border border-border/40 rounded-lg overflow-hidden bg-muted/5 transition-all duration-200"
          >
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => toggleFileExpanded(file.filename)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/10 text-left transition-colors"
            >
              <div className="flex items-center gap-2.5 truncate">
                <ChevronRight
                  className={`h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <span className="font-mono text-xs font-semibold text-foreground/90 truncate">
                  {file.filename}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-2">
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold">
                  {file.additions > 0 && (
                    <span className="text-emerald-500 font-bold">
                      +{file.additions}
                    </span>
                  )}
                  {file.deletions > 0 && (
                    <span className="text-red-500 font-bold">
                      -{file.deletions}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    file.status === "added"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : file.status === "removed"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  }`}
                >
                  {file.status.toUpperCase()}
                </span>
              </div>
            </button>

            {/* Accordion Content (Diff Code block) */}
            {isExpanded && (
              <div className="border-t border-border/20 bg-zinc-950/80 dark:bg-zinc-950/40 select-text overflow-x-auto w-full">
                {file.patch ? (
                  <DiffViewer patch={file.patch} />
                ) : (
                  <div className="p-4 text-center text-xs text-muted-foreground font-sans">
                    No patch preview available for this file.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
        </div>
      )}
    </div>
  );
}
