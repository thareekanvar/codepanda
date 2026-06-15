"use client";

import React from "react";

// Diff Parsing Helper Types and Functions
export interface DiffLine {
  oldLineNum: number | null;
  newLineNum: number | null;
  type: "addition" | "deletion" | "normal" | "hunk-header";
  content: string;
}

export function parsePatch(patch: string): DiffLine[] {
  const lines = patch.split("\n");
  const result: DiffLine[] = [];

  let oldLineNum = 0;
  let newLineNum = 0;

  for (const line of lines) {
    if (line.startsWith("@@")) {
      const match = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/);
      if (match) {
        oldLineNum = parseInt(match[1], 10);
        newLineNum = parseInt(match[2], 10);
      }
      result.push({
        oldLineNum: null,
        newLineNum: null,
        type: "hunk-header",
        content: line,
      });
    } else if (line.startsWith("+")) {
      result.push({
        oldLineNum: null,
        newLineNum: newLineNum++,
        type: "addition",
        content: line.substring(1),
      });
    } else if (line.startsWith("-")) {
      result.push({
        oldLineNum: oldLineNum++,
        newLineNum: null,
        type: "deletion",
        content: line.substring(1),
      });
    } else {
      if (line.startsWith("\\")) {
        result.push({
          oldLineNum: null,
          newLineNum: null,
          type: "normal",
          content: line,
        });
      } else {
        result.push({
          oldLineNum: oldLineNum++,
          newLineNum: newLineNum++,
          type: "normal",
          content: line.startsWith(" ") ? line.substring(1) : line,
        });
      }
    }
  }
  return result;
}

interface DiffViewerProps {
  patch: string;
}

export function DiffViewer({ patch }: DiffViewerProps) {
  const diffLines = parsePatch(patch);
  return (
    <div className="min-w-full table border-collapse select-text">
      {diffLines.map((line, idx) => {
        let rowClass = "hover:bg-zinc-900/50";
        let numClass =
          "text-zinc-600 dark:text-zinc-500 select-none text-right pr-2 w-10 border-r border-zinc-900/40 bg-zinc-950/70 text-[10px]";
        let codeClass = "pl-4 pr-2 whitespace-pre font-mono text-zinc-300";
        let sign = " ";

        if (line.type === "addition") {
          rowClass =
            "bg-emerald-950/20 text-emerald-300 dark:text-emerald-400 hover:bg-emerald-950/30";
          numClass =
            "bg-emerald-950/30 text-emerald-600 dark:text-emerald-500 border-r border-emerald-900/20 select-none text-right pr-2 w-10 text-[10px]";
          codeClass =
            "pl-4 pr-2 whitespace-pre font-mono text-emerald-300 dark:text-emerald-400";
          sign = "+";
        } else if (line.type === "deletion") {
          rowClass =
            "bg-red-950/20 text-red-300 dark:text-red-400 hover:bg-red-950/30 line-through decoration-red-900/20";
          numClass =
            "bg-red-950/30 text-red-600 dark:text-red-500 border-r border-red-900/20 select-none text-right pr-2 w-10 text-[10px]";
          codeClass =
            "pl-4 pr-2 whitespace-pre font-mono text-red-300 dark:text-red-400";
          sign = "-";
        } else if (line.type === "hunk-header") {
          rowClass =
            "bg-blue-950/10 text-blue-400/80 font-semibold select-none border-y border-blue-950/20";
          numClass =
            "bg-blue-950/15 text-blue-500/50 border-r border-blue-900/10 text-right pr-2 w-10 text-[10px]";
          codeClass =
            "pl-4 pr-2 whitespace-pre font-mono text-blue-400/80 font-semibold text-[10px]";
          sign = " ";
        }

        return (
          <div key={idx} className={`table-row ${rowClass} py-0.5`}>
            {/* Old line number */}
            <div className={`table-cell ${numClass}`}>{line.oldLineNum ?? ""}</div>
            {/* New line number */}
            <div className={`table-cell ${numClass}`}>{line.newLineNum ?? ""}</div>
            {/* Diff Sign (+ / -) */}
            <div className="table-cell select-none text-center w-6 border-r border-zinc-900/40 font-mono opacity-50 pl-1 text-[10px]">
              {sign}
            </div>
            {/* Code Content */}
            <div className={`table-cell ${codeClass} text-[11px]`}>
              {line.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
