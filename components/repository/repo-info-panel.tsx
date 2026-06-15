"use client";

import React from "react";
import { Folder, ExternalLink } from "lucide-react";
import type { Repository } from "@/hooks/use-repository";

interface RepoInfoPanelProps {
  repo: Repository;
}

export function RepoInfoPanel({ repo }: RepoInfoPanelProps) {
  return (
    <div className="w-full shrink-0 border-b border-border/40 bg-muted/15 px-6 py-2.5">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Folder className="h-4.5 w-4.5 text-primary animate-pulse" />
            <h1 className="text-sm font-bold tracking-tight text-foreground">{repo.name}</h1>
          </div>
          <div className="flex flex-col gap-1 text-[10px] text-muted-foreground font-mono">
            <a
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              className="hover:underline inline-flex items-center gap-1 text-primary w-fit"
            >
              {repo.url} <ExternalLink className="h-2.5 w-2.5" />
            </a>
            <span>INDEXED ON: {new Date(repo.created_at).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
