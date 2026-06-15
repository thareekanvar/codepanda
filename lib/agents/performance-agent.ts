import { runToolAgent } from "@/lib/ai/tool-agent-runner";
import { performanceReviewSchema, type PerformanceReview } from "@/lib/ai/schemas";
import type { ToolContext } from "@/lib/tools/review-tools";

/**
 * Performance Agent — Identifies performance issues using tool-calling.
 * Can read full files, check imports, analyze complexity, and trace data flow.
 */
export async function runPerformanceAgent(input: {
  diff: string;
  retrievedContext: string;
  toolContext: ToolContext;
}): Promise<PerformanceReview> {
  const { output } = await runToolAgent({
    diff: input.diff,
    retrievedContext: input.retrievedContext,
    toolContext: input.toolContext,
    maxSteps: 10,
    systemPrompt: `You are a Senior Performance Engineer conducting a thorough performance review of a pull request.

You have access to tools that let you explore the codebase. Use them to:
1. Read full files to understand the complete context of performance issues
2. Search for patterns like "useEffect", "useState", "addEventListener" to find re-render issues
3. Check imports to identify large libraries that could bloat the bundle
4. Analyze function complexity and nesting depth
5. Trace data flow to find unnecessary re-computations

Your role is to identify code that will cause slowdowns, memory leaks, excessive re-renders, or poor user experience at scale.

When you find a performance issue:
- Read the full file to understand the complete context
- Search for similar patterns elsewhere in the codebase
- Document the exact location, impact, and optimization`,
    taskPrompt: `## Your Task
Review the code changes for performance issues and optimization opportunities.

Check for these categories:
1. **N+1 queries** — Database queries inside loops, missing batch operations
2. **Missing indexes** — Queries that would benefit from database indexes
3. **Memory leaks** — Event listeners not cleaned up, growing arrays/objects, closures retaining references
4. **Excessive re-renders** — React components re-rendering unnecessarily, missing memoization
5. **Large bundle** — Importing entire libraries instead of tree-shaking, unused exports
6. **Blocking operations** — Synchronous I/O, heavy computations on main thread
7. **Missing caching** — Repeated expensive computations or API calls without cache
8. **Inefficient algorithms** — O(n^2) or worse complexity where O(n) is possible
9. **Excessive re-fetch** — API calls without proper deduplication or stale-while-revalidate
10. **Missing debounce** — Rapid-fire events (scroll, resize, input) without debounce/throttle
11. **Unoptimized images** — Large images without lazy loading, WebP conversion, or responsive sizing
12. **Missing lazy load** — Heavy components or routes loaded eagerly

Use your tools to:
- Read full files to understand the complete performance context
- Search for similar patterns elsewhere in the codebase that might have the same issue
- Analyze function complexity and nesting depth
- Check for large imports that could bloat the bundle

For each finding, provide:
- Issue type
- Clear title
- Detailed description
- Severity (critical, warning, info, or positive for good practices)
- Exact location (file path + code reference)
- Current problematic code snippet
- Performance impact (e.g., "O(n^2) complexity on every render", "blocks main thread for 200ms")
- Suggested optimized code or approach

Include positive findings where good performance patterns are used.
Provide an overall performance assessment and a score from 0-100.`,
    outputSchema: performanceReviewSchema,
  });

  return output;
}
