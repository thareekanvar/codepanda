"use client";

import React, { useState } from "react";
import { ChevronRight, FlaskConical } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockTitle,
  CodeBlockFilename,
  CodeBlockActions,
  CodeBlockCopyButton,
} from "@/components/ai-elements/code-block";
import type { TestingReview as TestingReviewType } from "@/lib/ai/schemas";

interface TestingReviewProps {
  testCoverage: string;
  missingTests: TestingReviewType["missingTests"];
}

export function TestingReview({ testCoverage, missingTests }: TestingReviewProps) {
  // Initialize expanded state: critical or high priority tests are open by default, or the first one if none match
  const [expandedTests, setExpandedTests] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    const hasHighPriority = missingTests.some((t) => t.priority === "critical" || t.priority === "high");
    missingTests.forEach((test, idx) => {
      initial[idx] = hasHighPriority ? test.priority === "critical" || test.priority === "high" : idx === 0;
    });
    return initial;
  });

  const toggleTest = (idx: number) => {
    setExpandedTests((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20";
      case "high":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
      case "medium":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20";
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-foreground/80">Test Coverage Analysis</h3>
        <Message from="assistant" className="max-w-full">
          <MessageContent className="w-full bg-muted/15 border border-border/80 p-5 rounded-2xl text-sm leading-relaxed text-foreground/90">
            <MessageResponse>{testCoverage}</MessageResponse>
          </MessageContent>
        </Message>
      </div>

      <Separator className="bg-border/20" />

      <div>
        <h4 className="text-sm font-semibold mb-4 text-foreground/85">Suggested Test Scenarios</h4>
        {missingTests.length === 0 ? (
          <p className="text-sm text-muted-foreground">Test coverage looks complete; no missing test scenarios identified.</p>
        ) : (
          <div className="space-y-3 w-full max-w-full">
            {missingTests.map((test, idx) => {
              const isExpanded = expandedTests[idx] ?? false;
              return (
                <div
                  key={idx}
                  className="border border-border/40 rounded-lg overflow-hidden bg-muted/5 transition-all duration-200 w-full max-w-full"
                >
                  {/* Accordion Header */}
                  <button
                    type="button"
                    onClick={() => toggleTest(idx)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/10 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <ChevronRight
                        className={`h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                      <FlaskConical className="h-4 w-4 text-rose-500 shrink-0" />
                      <span className="font-sans text-xs font-semibold text-foreground/90 truncate">
                        {test.scenario} <span className="text-[10px] text-muted-foreground font-mono font-normal">[{test.type.toUpperCase()}]</span>
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ml-2 ${getPriorityBadgeClass(
                        test.priority
                      )}`}
                    >
                      {test.priority}
                    </span>
                  </button>

                  {/* Accordion Content */}
                  {isExpanded && (
                    <div className="border-t border-border/20 bg-card/40 p-4 space-y-3 text-xs w-full max-w-full overflow-hidden">
                      <p className="text-xs text-foreground/85 leading-relaxed">{test.reason}</p>
                      {test.suggestedCode && (
                        <div className="mt-2 text-xs w-full max-w-full overflow-hidden">
                          <h4 className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                            Suggested Test Code
                          </h4>
                          <div className="rounded-lg overflow-auto max-h-[320px] w-full max-w-full scrollbar-thin">
                            <CodeBlock code={test.suggestedCode} language="typescript" className="w-full border border-border/30 rounded-lg">
                              <CodeBlockHeader className="border-b border-border/20 bg-muted/50 backdrop-blur-sm sticky top-0 z-10">
                                <CodeBlockTitle>
                                  <CodeBlockFilename>suggested-test.spec.ts</CodeBlockFilename>
                                </CodeBlockTitle>
                                <CodeBlockActions>
                                  <CodeBlockCopyButton />
                                </CodeBlockActions>
                              </CodeBlockHeader>
                            </CodeBlock>
                          </div>
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
    </div>
  );
}
