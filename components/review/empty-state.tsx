"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center my-auto py-12 ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted border border-border/40 mb-4 shadow-sm">
        <Icon className="h-5 w-5 text-muted-foreground/80" />
      </div>
      <h3 className="text-sm font-semibold text-foreground/80">{title}</h3>
      <p className="text-xs text-muted-foreground mt-2 max-w-xs leading-relaxed font-sans">
        {description}
      </p>
    </div>
  );
}
