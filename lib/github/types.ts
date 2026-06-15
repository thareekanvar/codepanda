export interface PrMetadata {
  title: string;
  body: string;
  state: string;
  labels: string[];
  author: string;
  baseBranch: string;
  headBranch: string;
  createdAt: string;
  updatedAt: string;
  additions: number;
  deletions: number;
  changedFiles: number;
}

export interface PrFile {
  filename: string;
  status: "added" | "modified" | "removed" | "renamed" | "copied" | "changed" | "unchanged";
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export interface PrData {
  metadata: PrMetadata;
  diff: string;
  files: PrFile[];
}

export interface ParsedPrUrl {
  owner: string;
  repo: string;
  pullNumber: number;
}
