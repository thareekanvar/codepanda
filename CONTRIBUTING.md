# Contributing to CodePanda

Thank you for your interest in contributing! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Adding a New Agent](#adding-a-new-agent)
- [Adding a New Tool](#adding-a-new-tool)

## Code of Conduct

Please be respectful and constructive in all interactions. We're here to build something useful together.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm (recommended)
- Supabase account
- Google Gemini API key

### Setup

```bash
# Clone your fork
git clone https://github.com/your-username/ai-pair-engineer.git
cd ai-pair-engineer

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Add your API keys to .env.local

# Start development server
pnpm dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

## How to Contribute

### Reporting Bugs

1. Check existing issues first
2. Create a new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### Suggesting Features

1. Check existing issues/discussions
2. Create a new issue with:
   - Problem statement
   - Proposed solution
   - Alternatives considered

### Submitting Code

1. Create an issue first (for large changes)
2. Fork and create a feature branch
3. Write your code
4. Add tests if applicable
5. Update documentation if needed
6. Submit a pull request

## Pull Request Process

1. **Create a descriptive PR title**
   - Use present tense ("Add feature" not "Added feature")
   - Reference issues if applicable

2. **Fill out the PR description**
   - What does this PR do?
   - Why is this change needed?
   - How to test it?

3. **Ensure CI passes**
   - No lint errors
   - TypeScript compiles
   - Tests pass (when we have them)

4. **Request review**
   - Wait for maintainer approval
   - Address feedback promptly

## Coding Standards

### TypeScript

- Use strict TypeScript
- Prefer `interface` over `type` for object shapes
- Use Zod schemas for runtime validation
- Avoid `any` — use `unknown` if needed

### React

- Use functional components with hooks
- Keep components small and focused
- Use Server Components when possible
- Client components need `"use client"` directive

### Styling

- Use Tailwind CSS utility classes
- Follow shadcn/ui patterns
- Use `cn()` utility for conditional classes

### File Naming

- Components: `PascalCase.tsx` (e.g., `ReviewResults.tsx`)
- Utilities: `kebab-case.ts` (e.g., `pr-fetcher.ts`)
- Types: `types.ts` in relevant directory

### Git Commits

- Use conventional commits:
  - `feat:` new feature
  - `fix:` bug fix
  - `docs:` documentation
  - `refactor:` code restructuring
  - `test:` adding tests
  - `chore:` maintenance

## Adding a New Agent

### 1. Create the Agent File

```typescript
// lib/agents/my-agent.ts
import { runAgent } from "@/lib/ai/agent-runner";
import { myAgentSchema, type MyAgentReview } from "@/lib/ai/schemas";

export async function runMyAgent(input: {
  diff: string;
  retrievedContext: string;
}): Promise<MyAgentReview> {
  const { output } = await runAgent({
    diff: input.diff,
    retrievedContext: input.retrievedContext,
    systemPrompt: `You are a [Role] reviewing a pull request.`,
    taskPrompt: `## Your Task\n[Specific instructions]`,
    outputSchema: myAgentSchema,
  });

  return output;
}
```

### 2. Add the Schema

```typescript
// lib/ai/schemas.ts
export const myAgentSchema = z.object({
  findings: z.array(/* ... */),
  score: z.number().min(0).max(100),
});

export type MyAgentReview = z.infer<typeof myAgentSchema>;
```

### 3. Register in Orchestrator

```typescript
// lib/agents/review-orchestrator.ts
const [/* ... */, myReview] = await Promise.all([
  /* ... */,
  runMyAgent({ diff, retrievedContext }),
]);
```

### 4. Update Coordinator

```typescript
// lib/agents/coordinator-agent.ts
// Add your agent's output to the coordinator prompt
```

## Adding a New Tool

### 1. Create the Tool

```typescript
// lib/tools/review-tools.ts
myTool: tool({
  description: "Description for the LLM",
  inputSchema: z.object({
    param: z.string().describe("What this param does"),
  }),
  execute: async ({ param }) => {
    // Tool implementation
    return { result: "..." };
  },
}),
```

### 2. Update Tool Context (if needed)

```typescript
// lib/tools/review-tools.ts
export interface ToolContext {
  // Add new context fields
}
```

## Questions?

Feel free to open an issue for any questions about contributing!
