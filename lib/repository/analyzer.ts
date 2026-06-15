import { generateText, Output } from "ai";
import { geminiFlash } from "@/lib/ai/model";
import { architectureAnalysisSchema } from "@/lib/ai/schemas";
import type { ArchitectureAnalysis } from "@/lib/ai/schemas";
import { supabase } from "@/lib/supabase/client";
import {
  cloneRepository,
  scanRepository,
  cleanupRepository,
} from "./scanner";
import { detectRepositoryInfo } from "./detector";
import {
  chunkArchitectureSummary,
  chunkFolderSummaries,
  chunkSourceFile,
  chunkConventions,
  type TextChunk,
} from "@/lib/rag/chunker";
import { storeChunks, deleteRepositoryChunks } from "@/lib/rag/vector-store";

export interface AnalysisResult {
  repositoryId: string;
  name: string;
  url: string;
  analysis: ArchitectureAnalysis;
}

/**
 * Full repository analysis pipeline:
 * 1. Clone → 2. Scan → 3. Detect → 4. AI Analysis → 5. Chunk → 6. Embed → 7. Store
 */
export async function analyzeRepository(url: string): Promise<AnalysisResult> {
  let repoPath: string | null = null;

  try {
    // Extract repo name from URL
    const urlParts = url.replace(/\.git$/, "").split("/");
    const repoName = `${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`;

    // Step 1: Clone
    repoPath = await cloneRepository(url);

    // Step 2: Scan
    const scan = await scanRepository(repoPath);

    // Step 3: Detect
    const detection = detectRepositoryInfo(scan);

    // Step 4: AI-powered deep analysis
    const importantFileContents = scan.files
      .filter((f) => detection.importantFiles.includes(f.path))
      .slice(0, 20)
      .map((f) => `--- ${f.path} ---\n${f.content.slice(0, 3000)}`)
      .join("\n\n");

    const { output: analysis } = await generateText({
      model: geminiFlash,
      output: Output.object({ schema: architectureAnalysisSchema }),
      prompt: `Analyze this repository's architecture and conventions.

## Detected Info
- Framework: ${detection.framework}
- Language: ${detection.language}
- Architecture Pattern: ${detection.architecturePattern}
- Detected Patterns: ${detection.detectedPatterns.join(", ")}

## Folder Structure
${detection.folderStructure.join("\n")}

## Important Files
${importantFileContents}

## Package.json
${scan.packageJson ? JSON.stringify(scan.packageJson, null, 2).slice(0, 3000) : "Not found"}

## Config Files
${Object.entries(scan.configFiles)
  .map(([name, content]) => `--- ${name} ---\n${content.slice(0, 1000)}`)
  .join("\n\n")}

Provide a comprehensive analysis including:
1. Confirmed framework, language, and architecture pattern
2. Naming conventions used throughout the codebase
3. Folder summaries for key modules
4. A detailed architecture summary
5. Health score, strengths, and concerns`,
    });

    if (!analysis) {
      throw new Error("Failed to generate architecture analysis");
    }

    // Step 5: Upsert repository record
    const { data: existingRepo } = await supabase
      .from("repositories")
      .select("id")
      .eq("url", url)
      .single();

    let repositoryId: string;

    if (existingRepo) {
      repositoryId = existingRepo.id;
      // Update existing
      await supabase
        .from("repositories")
        .update({
          name: repoName,
          architecture_summary: analysis.architectureSummary,
        })
        .eq("id", repositoryId);

      // Delete old chunks
      await deleteRepositoryChunks(repositoryId);
    } else {
      // Insert new
      const { data: newRepo, error } = await supabase
        .from("repositories")
        .insert({
          name: repoName,
          url,
          architecture_summary: analysis.architectureSummary,
        })
        .select("id")
        .single();

      if (error || !newRepo) {
        throw new Error(`Failed to create repository: ${error?.message}`);
      }

      repositoryId = newRepo.id;
    }

    // Step 6: Chunk everything
    const allChunks: TextChunk[] = [
      ...chunkArchitectureSummary(analysis.architectureSummary),
      ...chunkFolderSummaries(analysis.folderSummaries),
      ...chunkConventions(analysis.namingConventions),
    ];

    // Add important source files
    const sourceFiles = scan.files
      .filter((f) => detection.importantFiles.includes(f.path))
      .slice(0, 30);

    for (const file of sourceFiles) {
      allChunks.push(...chunkSourceFile(file.path, file.content));
    }

    // Step 7: Generate embeddings and store
    await storeChunks(repositoryId, allChunks);

    return {
      repositoryId,
      name: repoName,
      url,
      analysis,
    };
  } finally {
    // Cleanup
    if (repoPath) {
      await cleanupRepository(repoPath);
    }
  }
}
