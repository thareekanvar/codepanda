import type { RepositoryScan } from "./scanner";

type Framework = "nextjs" | "react" | "express" | "nestjs" | "vue" | "angular" | "nuxt" | "fastify" | "other";
type Language = "typescript" | "javascript" | "python" | "go" | "rust" | "java" | "other";
type ArchitecturePattern = "feature_based" | "layered" | "service_layer" | "repository_pattern" | "mvc" | "clean_architecture" | "monolithic" | "microservices" | "other";

export interface DetectionResult {
  framework: Framework;
  language: Language;
  architecturePattern: ArchitecturePattern;
  languageBreakdown: Record<string, number>;
  detectedPatterns: string[];
  folderStructure: string[];
  importantFiles: string[];
}

/**
 * Detect the primary framework from package.json and config files.
 */
function detectFramework(scan: RepositoryScan): Framework {
  const deps = {
    ...(scan.packageJson?.dependencies as Record<string, string> || {}),
    ...(scan.packageJson?.devDependencies as Record<string, string> || {}),
  };

  if (deps["next"] || scan.configFiles["next.config.js"] || scan.configFiles["next.config.ts"] || scan.configFiles["next.config.mjs"]) {
    return "nextjs";
  }
  if (deps["nuxt"] || scan.configFiles["nuxt.config.ts"] || scan.configFiles["nuxt.config.js"]) {
    return "nuxt";
  }
  if (deps["@nestjs/core"] || scan.configFiles["nest-cli.json"]) {
    return "nestjs";
  }
  if (deps["@angular/core"] || scan.configFiles["angular.json"]) {
    return "angular";
  }
  if (deps["vue"] || scan.configFiles["vue.config.js"]) {
    return "vue";
  }
  if (deps["fastify"]) {
    return "fastify";
  }
  if (deps["express"]) {
    return "express";
  }
  if (deps["react"]) {
    return "react";
  }

  return "other";
}

/**
 * Detect primary language from file extensions.
 */
function detectLanguage(scan: RepositoryScan): { primary: Language; breakdown: Record<string, number> } {
  const extCounts: Record<string, number> = {};

  for (const file of scan.files) {
    const ext = file.extension;
    if (ext) {
      extCounts[ext] = (extCounts[ext] || 0) + 1;
    }
  }

  const total = scan.files.length || 1;
  const breakdown: Record<string, number> = {};
  for (const [ext, count] of Object.entries(extCounts)) {
    breakdown[ext] = Math.round((count / total) * 100);
  }

  const tsCount = (extCounts[".ts"] || 0) + (extCounts[".tsx"] || 0);
  const jsCount = (extCounts[".js"] || 0) + (extCounts[".jsx"] || 0);
  const pyCount = extCounts[".py"] || 0;
  const goCount = extCounts[".go"] || 0;
  const rsCount = extCounts[".rs"] || 0;
  const javaCount = extCounts[".java"] || 0;

  const max = Math.max(tsCount, jsCount, pyCount, goCount, rsCount, javaCount);

  let primary: Language = "other";
  if (max === tsCount && tsCount > 0) primary = "typescript";
  else if (max === jsCount && jsCount > 0) primary = "javascript";
  else if (max === pyCount && pyCount > 0) primary = "python";
  else if (max === goCount && goCount > 0) primary = "go";
  else if (max === rsCount && rsCount > 0) primary = "rust";
  else if (max === javaCount && javaCount > 0) primary = "java";

  return { primary, breakdown };
}

/**
 * Detect architecture patterns from folder structure.
 */
function detectArchitecturePattern(scan: RepositoryScan): { pattern: ArchitecturePattern; detected: string[] } {
  const folders = new Set<string>();
  const detected: string[] = [];

  for (const file of scan.files) {
    const parts = file.path.split("/");
    if (parts.length > 1) {
      folders.add(parts[0]);
      if (parts.length > 2) {
        folders.add(`${parts[0]}/${parts[1]}`);
      }
    }
  }

  // Check for feature-based architecture
  const featureFolders = ["features", "modules", "domains"];
  if (featureFolders.some((f) => folders.has(f) || folders.has(`src/${f}`))) {
    detected.push("Feature-based module organization");
  }

  // Check for layered architecture
  const layeredFolders = ["controllers", "services", "repositories", "models", "entities"];
  const layeredCount = layeredFolders.filter(
    (f) => folders.has(f) || folders.has(`src/${f}`)
  ).length;
  if (layeredCount >= 3) {
    detected.push("Layered architecture (controllers/services/repositories)");
  }

  // Check for service layer
  if (folders.has("services") || folders.has("src/services") || folders.has("lib/services")) {
    detected.push("Service layer pattern");
  }

  // Check for repository pattern
  if (folders.has("repositories") || folders.has("src/repositories") || folders.has("src/repos")) {
    detected.push("Repository pattern");
  }

  // Check for MVC
  const mvcFolders = ["models", "views", "controllers"];
  const mvcCount = mvcFolders.filter(
    (f) => folders.has(f) || folders.has(`src/${f}`)
  ).length;
  if (mvcCount >= 2) {
    detected.push("MVC pattern");
  }

  // Check for Next.js App Router
  if (folders.has("app") || folders.has("src/app")) {
    detected.push("Next.js App Router structure");
  }

  // Check for clean architecture
  if (
    (folders.has("domain") || folders.has("src/domain")) &&
    (folders.has("infrastructure") || folders.has("src/infrastructure"))
  ) {
    detected.push("Clean architecture");
  }

  // Determine primary pattern
  let pattern: ArchitecturePattern = "other";
  if (detected.includes("Clean architecture")) pattern = "clean_architecture";
  else if (detected.includes("Feature-based module organization")) pattern = "feature_based";
  else if (detected.includes("Layered architecture (controllers/services/repositories)")) pattern = "layered";
  else if (detected.includes("MVC pattern")) pattern = "mvc";
  else if (detected.includes("Service layer pattern")) pattern = "service_layer";
  else if (detected.includes("Repository pattern")) pattern = "repository_pattern";

  return { pattern, detected };
}

/**
 * Identify the most important files in the repository.
 */
function findImportantFiles(scan: RepositoryScan): string[] {
  const important: string[] = [];
  const priorityPatterns = [
    /^package\.json$/,
    /^tsconfig\.json$/,
    /^(next|nuxt|angular|vue|vite)\.config\./,
    /^\w+\.config\.(ts|js|mjs)$/,
    /^(app|src)\/(layout|page)\.(tsx|jsx|ts|js)$/,
    /^(app|src)\/api\//,
    /^(lib|utils|helpers)\//,
    /^(middleware|proxy)\.(ts|js)$/,
    /^(services|controllers|repositories)\//,
    /schema\.(ts|js|prisma)$/,
    /types?\.(ts|d\.ts)$/,
  ];

  for (const file of scan.files) {
    if (priorityPatterns.some((p) => p.test(file.path))) {
      important.push(file.path);
    }
  }

  return important.slice(0, 50); // Max 50 important files
}

/**
 * Run all detectors on a scanned repository.
 */
export function detectRepositoryInfo(scan: RepositoryScan): DetectionResult {
  const framework = detectFramework(scan);
  const { primary: language, breakdown } = detectLanguage(scan);
  const { pattern, detected } = detectArchitecturePattern(scan);
  const importantFiles = findImportantFiles(scan);

  return {
    framework,
    language,
    architecturePattern: pattern,
    languageBreakdown: breakdown,
    detectedPatterns: detected,
    folderStructure: scan.fileTree.slice(0, 100), // First 100 lines
    importantFiles,
  };
}
