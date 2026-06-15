export interface Repository {
  id: string;
  name: string;
  url: string;
  architecture_summary: string | null;
  created_at: string;
}

export interface RepositoryChunk {
  id: string;
  repository_id: string;
  content: string;
  metadata: ChunkMetadata;
  embedding?: number[];
  created_at: string;
}

export interface ChunkMetadata {
  type: "architecture_summary" | "folder_summary" | "source_file" | "convention";
  filePath?: string;
  chunkIndex?: number;
  folderPath?: string;
  description?: string;
  queriedFor?: string;
}

export interface MatchedChunk {
  id: string;
  content: string;
  metadata: ChunkMetadata;
  similarity: number;
}
