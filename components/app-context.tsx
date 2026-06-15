"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Repository {
  id: string;
  name: string;
  url: string;
}

export interface PrFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes?: number;
  patch?: string;
}

export interface AgentState {
  name: string;
  status: "pending" | "running" | "done" | "error";
}

export interface ReviewResult {
  [key: string]: unknown;
  architectureReview?: Record<string, unknown>;
  issueAlignment?: Record<string, unknown>;
  testingReview?: Record<string, unknown>;
  codeQuality?: Record<string, unknown>;
  securityReview?: Record<string, unknown>;
  performanceReview?: Record<string, unknown>;
  coordinatorReview?: Record<string, unknown>;
  retrievalDebug?: {
    totalChunksRetrieved: number;
    chunks: Array<{
      content: string;
      similarity: number;
      type: string;
      source: string;
    }>;
  };
}

interface AppContextType {
  activeTab: "review" | "analyze";
  setActiveTab: (tab: "review" | "analyze") => void;
  repositories: Repository[];
  setRepositories: React.Dispatch<React.SetStateAction<Repository[]>>;
  selectedRepoId: string;
  setSelectedRepoId: (id: string) => void;
  prUrl: string;
  setPrUrl: (url: string) => void;
  fetchingPr: boolean;
  setFetchingPr: (fetching: boolean) => void;
  changedFiles: PrFile[];
  setChangedFiles: (files: PrFile[]) => void;
  selectedFile: PrFile | null;
  setSelectedFile: (file: PrFile | null) => void;
  prError: string | null;
  setPrError: (error: string | null) => void;
  issueDescription: string;
  setIssueDescription: (desc: string) => void;
  codeDiff: string;
  setCodeDiff: (diff: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  result: ReviewResult | null;
  setResult: (result: ReviewResult | null) => void;
  agents: AgentState[];
  setAgents: React.Dispatch<React.SetStateAction<AgentState[]>>;
  fetchRepositories: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<"review" | "analyze">("review");
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState("");
  const [prUrl, setPrUrl] = useState("");
  const [fetchingPr, setFetchingPr] = useState(false);
  const [changedFiles, setChangedFiles] = useState<PrFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<PrFile | null>(null);
  const [prError, setPrError] = useState<string | null>(null);
  const [issueDescription, setIssueDescription] = useState("");
  const [codeDiff, setCodeDiff] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReviewResult | null>(null);

  const [agents, setAgents] = useState<AgentState[]>([
    { name: "Principal Architect Agent", status: "pending" },
    { name: "Senior Product Engineer Agent", status: "pending" },
    { name: "Staff QA Engineer Agent", status: "pending" },
    { name: "Senior Code Quality Agent", status: "pending" },
    { name: "Review Coordinator", status: "pending" },
  ]);

  // Load repositories on mount
  useEffect(() => {
    fetchRepositories();
  }, []);

  async function fetchRepositories() {
    try {
      const response = await fetch("/api/repositories");
      const data = await response.json();
      if (response.ok && data.success) {
        setRepositories(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch repositories:", err);
    }
  }

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        repositories,
        setRepositories,
        selectedRepoId,
        setSelectedRepoId,
        prUrl,
        setPrUrl,
        fetchingPr,
        setFetchingPr,
        changedFiles,
        setChangedFiles,
        selectedFile,
        setSelectedFile,
        prError,
        setPrError,
        issueDescription,
        setIssueDescription,
        codeDiff,
        setCodeDiff,
        loading,
        setLoading,
        error,
        setError,
        result,
        setResult,
        agents,
        setAgents,
        fetchRepositories,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
