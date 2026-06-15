import { z } from "zod";

// ─── Repository Analysis Schemas ──────────────────────────────

export const frameworkSchema = z.enum([
  "nextjs",
  "react",
  "express",
  "nestjs",
  "vue",
  "angular",
  "nuxt",
  "fastify",
  "other",
]);

export const languageSchema = z.enum([
  "typescript",
  "javascript",
  "python",
  "go",
  "rust",
  "java",
  "other",
]);

export const architecturePatternSchema = z.enum([
  "feature_based",
  "layered",
  "service_layer",
  "repository_pattern",
  "mvc",
  "clean_architecture",
  "monolithic",
  "microservices",
  "other",
]);

export const namingConventionSchema = z.object({
  hooks: z.string().describe("Hook naming pattern, e.g., use* prefix"),
  services: z.string().describe("Service naming pattern, e.g., *Service suffix"),
  components: z.string().describe("Component naming pattern, e.g., PascalCase"),
  api: z.string().describe("API route naming pattern"),
  files: z.string().describe("File naming convention, e.g., kebab-case, camelCase"),
});

export const folderSummarySchema = z.object({
  path: z.string().describe("Relative folder path"),
  name: z.string().describe("Human-readable module name"),
  description: z.string().describe("What this folder/module handles"),
  keyFiles: z.array(z.string()).describe("Important files in this folder"),
});

export const architectureAnalysisSchema = z.object({
  framework: frameworkSchema.describe("Detected framework"),
  language: languageSchema.describe("Primary language"),
  architecturePattern: architecturePatternSchema.describe("Architecture pattern"),
  namingConventions: namingConventionSchema,
  folderSummaries: z
    .array(folderSummarySchema)
    .describe("Summaries of key folders/modules"),
  architectureSummary: z
    .string()
    .describe(
      "Comprehensive architecture summary describing patterns, conventions, and structure"
    ),
  healthScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Overall repository health score 0-100"),
  strengths: z.array(z.string()).describe("Architecture strengths"),
  concerns: z.array(z.string()).describe("Architecture concerns or risks"),
});

export type ArchitectureAnalysis = z.infer<typeof architectureAnalysisSchema>;

// ─── Architecture Review Agent Schema ──────────────────────────

export const severitySchema = z.enum(["critical", "warning", "info", "positive"]);

export const architectureFindingSchema = z.object({
  title: z.string().describe("Short finding title"),
  description: z.string().describe("Detailed explanation of the finding"),
  severity: severitySchema,
  location: z.string().optional().describe("File path or area in the codebase"),
  recommendation: z.string().describe("Actionable recommendation"),
});

export const architectureReviewSchema = z.object({
  findings: z.array(architectureFindingSchema),
  overallAssessment: z
    .string()
    .describe("Overall architecture compliance assessment"),
  score: z
    .number()
    .min(0)
    .max(100)
    .describe("Architecture compliance score 0-100"),
});

export type ArchitectureReview = z.infer<typeof architectureReviewSchema>;

// ─── Issue Alignment Agent Schema ──────────────────────────────

export const requirementStatusSchema = z.enum([
  "implemented",
  "partially_implemented",
  "not_implemented",
  "over_implemented",
]);

export const requirementCheckSchema = z.object({
  requirement: z.string().describe("The requirement from the issue"),
  status: requirementStatusSchema,
  explanation: z.string().describe("How the requirement is or isn't met"),
  evidence: z.string().optional().describe("Code evidence from the diff"),
});

export const issueAlignmentSchema = z.object({
  requirements: z.array(requirementCheckSchema),
  missingRequirements: z
    .array(z.string())
    .describe("Requirements not addressed at all"),
  edgeCases: z.array(z.string()).describe("Unhandled edge cases"),
  overallAssessment: z.string().describe("Overall issue alignment assessment"),
  score: z
    .number()
    .min(0)
    .max(100)
    .describe("Issue alignment score 0-100"),
});

export type IssueAlignment = z.infer<typeof issueAlignmentSchema>;

// ─── Testing Agent Schema ──────────────────────────────────────

export const testTypeSchema = z.enum([
  "unit",
  "integration",
  "e2e",
  "edge_case",
  "performance",
  "security",
]);

export const testPrioritySchema = z.enum(["critical", "high", "medium", "low"]);

export const missingTestSchema = z.object({
  type: testTypeSchema,
  scenario: z.string().describe("Test scenario description"),
  reason: z.string().describe("Why this test is needed"),
  priority: testPrioritySchema,
  suggestedCode: z
    .string()
    .optional()
    .describe("Suggested test code skeleton"),
});

export const testingReviewSchema = z.object({
  missingTests: z.array(missingTestSchema),
  testCoverage: z
    .string()
    .describe("Assessment of current test coverage based on the diff"),
  score: z
    .number()
    .min(0)
    .max(100)
    .describe("Testing completeness score 0-100"),
});

export type TestingReview = z.infer<typeof testingReviewSchema>;

// ─── Code Quality Agent Schema ──────────────────────────────────

export const qualityCategorySchema = z.enum([
  "maintainability",
  "complexity",
  "readability",
  "duplication",
  "error_handling",
  "security",
  "performance",
  "best_practices",
]);

export const qualityFindingSchema = z.object({
  category: qualityCategorySchema,
  title: z.string().describe("Short finding title"),
  description: z.string().describe("Detailed explanation"),
  severity: severitySchema,
  location: z.string().optional().describe("File path or code reference"),
  suggestion: z.string().describe("Improvement suggestion"),
});

export const codeQualitySchema = z.object({
  findings: z.array(qualityFindingSchema),
  overallAssessment: z.string().describe("Overall code quality assessment"),
  score: z
    .number()
    .min(0)
    .max(100)
    .describe("Code quality score 0-100"),
});

export type CodeQuality = z.infer<typeof codeQualitySchema>;

// ─── Security Agent Schema ──────────────────────────────────────

export const securityVulnTypeSchema = z.enum([
  "injection",
  "xss",
  "authentication",
  "authorization",
  "secrets_exposure",
  "path_traversal",
  "ssrf",
  "deserialization",
  "insecure_direct_object",
  "open_redirect",
  "csrf",
  "insecure_config",
  "dependency_vulnerability",
  "other",
]);

export const securitySeveritySchema = z.enum([
  "critical",
  "high",
  "medium",
  "low",
  "informational",
]);

export const securityFindingSchema = z.object({
  vulnType: securityVulnTypeSchema,
  title: z.string().describe("Short vulnerability title"),
  description: z.string().describe("Detailed explanation of the vulnerability"),
  severity: securitySeveritySchema,
  location: z.string().describe("File path and line reference"),
  evidence: z.string().describe("Code snippet showing the vulnerability"),
  impact: z.string().describe("What an attacker could achieve"),
  remediation: z.string().describe("Specific fix recommendation with code example"),
  references: z.array(z.string()).optional().describe("Related CVEs or OWASP references"),
});

export const securityReviewSchema = z.object({
  findings: z.array(securityFindingSchema),
  overallAssessment: z.string().describe("Overall security posture assessment"),
  score: z
    .number()
    .min(0)
    .max(100)
    .describe("Security score 0-100 (100 = no issues found)"),
  secretsFound: z
    .array(z.string())
    .describe("Any hardcoded secrets, API keys, or credentials detected"),
});

export type SecurityReview = z.infer<typeof securityReviewSchema>;

// ─── Performance Agent Schema ──────────────────────────────────

export const perfIssueTypeSchema = z.enum([
  "n_plus_one_query",
  "missing_index",
  "memory_leak",
  "excessive_render",
  "large_bundle",
  "blocking_operation",
  "missing_cache",
  "inefficient_algorithm",
  "excessive_re_fetch",
  "missing_debounce",
  "unoptimized_image",
  "missing_lazy_load",
  "other",
]);

export const performanceFindingSchema = z.object({
  issueType: perfIssueTypeSchema,
  title: z.string().describe("Short performance issue title"),
  description: z.string().describe("Detailed explanation"),
  severity: severitySchema,
  location: z.string().describe("File path and code reference"),
  impact: z.string().describe("Performance impact (e.g., 'O(n^2) complexity on every render')"),
  currentCode: z.string().describe("The problematic code snippet"),
  suggestedFix: z.string().describe("Optimized code or approach"),
});

export const performanceReviewSchema = z.object({
  findings: z.array(performanceFindingSchema),
  overallAssessment: z.string().describe("Overall performance assessment"),
  score: z
    .number()
    .min(0)
    .max(100)
    .describe("Performance score 0-100 (100 = no issues found)"),
  bundleImpact: z
    .string()
    .optional()
    .describe("Assessment of bundle size impact from these changes"),
});

export type PerformanceReview = z.infer<typeof performanceReviewSchema>;

// ─── Coordinator Agent Schema ───────────────────────────────────

export const recommendationSchema = z.enum([
  "approve",
  "approve_with_comments",
  "request_changes",
]);

export const coordinatorSchema = z.object({
  overallScore: z.number().min(0).max(100).describe("Overall review score"),
  architectureScore: z.number().min(0).max(100),
  issueAlignmentScore: z.number().min(0).max(100),
  codeQualityScore: z.number().min(0).max(100),
  testingScore: z.number().min(0).max(100),
  securityScore: z.number().min(0).max(100),
  performanceScore: z.number().min(0).max(100),
  criticalFindings: z
    .array(z.string())
    .describe("Must-fix issues before merging"),
  warnings: z
    .array(z.string())
    .describe("Non-blocking concerns to consider"),
  positiveFeedback: z
    .array(z.string())
    .describe("Things done well in this PR"),
  summary: z.string().describe("Executive summary of the review"),
  recommendation: recommendationSchema,
  confidenceScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Confidence in the review accuracy"),
});

export type CoordinatorReview = z.infer<typeof coordinatorSchema>;

// ─── API Request/Response Schemas ───────────────────────────────

export const analyzeRequestSchema = z.object({
  url: z
    .string()
    .url()
    .regex(
      /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+/,
      "Must be a valid GitHub repository URL"
    ),
});

export const reviewRequestSchema = z.object({
  repositoryId: z.string().uuid(),
  issueDescription: z
    .string()
    .min(10, "Issue description must be at least 10 characters"),
  codeDiff: z.string().min(10, "Code diff must be at least 10 characters"),
  prUrl: z.string().optional(),
});

export const githubPrRequestSchema = z.object({
  url: z
    .string()
    .url()
    .regex(
      /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+/,
      "Must be a valid GitHub PR URL"
    ),
});
