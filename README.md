# CodePanda

> Open-source, multi-agent code review system that detects design flaws, proposes tests, and identifies security & performance issues — before human review.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Vercel AI SDK](https://img.shields.io/badge/AI%20SDK-6-blue)](https://sdk.vercel.ai/)

## What is this?

CodePanda is a web-based code review tool that runs **6 specialized AI agents in parallel** to analyze pull requests. Each agent focuses on a different aspect of code quality, then a coordinator synthesizes their findings into a single actionable review.

Unlike single-pass AI reviewers, this system gives agents **tool-calling capabilities** — they can read full files, search git history, query GitHub APIs, and trace code paths to understand the full context before making recommendations.

### The 6 Agents

| Agent | Role | What it checks |
|-------|------|----------------|
| **Architecture** | Principal Architect | Violations, folder placement, naming, module boundaries |
| **Issue Alignment** | Senior Product Engineer | Requirements coverage, missing features, edge cases |
| **Testing** | Staff QA Engineer | Missing test scenarios, coverage gaps |
| **Code Quality** | Senior Quality Engineer | Maintainability, complexity, duplication, error handling |
| **Security** | Senior Security Engineer | Injection, XSS, auth flaws, secrets exposure, CVEs |
| **Performance** | Senior Performance Engineer | N+1 queries, memory leaks, re-renders, bundle size |

## Features

- **Multi-Agent Review** — 6 specialist agents run in parallel with independent analysis
- **Tool-Calling Agents** — Agents explore the codebase (read files, grep, git history, GitHub API)
- **RAG Pipeline** — Vector embeddings for repository-aware context retrieval
- **Diff-Aware Chunking** — Large diffs are split per-file, not hard-truncated
- **Git History Analysis** — Agents see commit history, blame data, code evolution
- **Structured Output** — Zod-validated schemas with scores, severity levels, and findings
- **Web Dashboard** — Beautiful UI with tabbed review results and score visualization
- **Self-Reflection** — Each agent reports confidence, uncertainty flags, and context gaps

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase account (free tier works)
- Google Gemini API key

### 1. Clone & Install

```bash
git clone https://github.com/your-username/ai-pair-engineer.git
cd ai-pair-engineer
pnpm install
```

### 2. Set Up Supabase

1. Create a new Supabase project
2. Run the SQL migrations (see `supabase/` folder)
3. Enable the `vector` extension for pgvector

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Google Gemini API Key (required)
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-key

# Supabase (required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# GitHub Token (optional - for private repos)
GITHUB_TOKEN=ghp_xxxxx
```

### 4. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Web UI (Next.js)                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐    ┌──────────────────────────────┐   │
│  │  Analyze    │    │         Review               │   │
│  │  Repository │    │  ┌─────────────────────────┐ │   │
│  │  ─────────  │    │  │   RAG Pipeline          │ │   │
│  │  Clone      │    │  │   (pgvector + Gemini)   │ │   │
│  │  Scan       │    │  └─────────────────────────┘ │   │
│  │  Detect     │    │  ┌─────────────────────────┐ │   │
│  │  Embed      │    │  │   6 Agent Parallel      │ │   │
│  │  ─────────  │    │  │   Architecture │ Issue   │ │   │
│  │  Store      │    │  │   Testing      │ Quality │ │   │
│  │  in DB      │    │  │   Security     │ Perf    │ │   │
│  └─────────────┘    │  └─────────────────────────┘ │   │
│                     │  ┌─────────────────────────┐ │   │
│                     │  │   Coordinator Agent     │ │   │
│                     │  │   (Synthesizes 6 → 1)   │ │   │
│                     │  └─────────────────────────┘ │   │
│                     └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Agent Tools

Agents with tool-calling capabilities can:

| Tool | Description |
|------|-------------|
| `readFile` | Read full file contents from the repo |
| `listDirectory` | List files/folders in a directory |
| `searchInFiles` | Grep-like search across the codebase |
| `gitLog` | Get commit history for a file or repo |
| `gitBlame` | See who last modified each line |
| `gitSearchHistory` | Find commits that added/removed code |
| `githubGetFile` | Fetch file from GitHub API |
| `githubGetPrFiles` | Get all changed files in a PR |
| `githubSearchCode` | Search code across the GitHub repo |
| `githubGetIssue` | Fetch issue/PR details and comments |
| `getDiffStats` | Analyze diff statistics and risk score |
| `analyzeComplexity` | Measure cyclomatic complexity |

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **AI:** Vercel AI SDK + Google Gemini
- **Database:** Supabase (PostgreSQL + pgvector)
- **UI:** shadcn/ui + Tailwind CSS
- **State:** TanStack Query
- **Language:** TypeScript

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes
│   │   ├── analyze/        # Repository analysis endpoint
│   │   ├── review/         # Code review endpoint
│   │   └── github/         # GitHub API proxy
│   ├── repositories/       # Repository detail pages
│   └── reviews/            # Review detail pages
├── components/             # React components
│   ├── review/             # Review UI components
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── agents/             # AI agent implementations
│   │   ├── architecture-agent.ts
│   │   ├── issue-agent.ts
│   │   ├── testing-agent.ts
│   │   ├── quality-agent.ts
│   │   ├── security-agent.ts
│   │   ├── performance-agent.ts
│   │   ├── coordinator-agent.ts
│   │   └── review-orchestrator.ts
│   ├── ai/                 # AI utilities
│   │   ├── model.ts        # Gemini model config
│   │   ├── schemas.ts      # Zod output schemas
│   │   ├── agent-runner.ts # Base agent runner
│   │   ├── tool-agent-runner.ts # Tool-calling agent
│   │   └── diff-chunker.ts # Smart diff chunking
│   ├── tools/              # Agent tool registry
│   │   └── review-tools.ts # 12 tools for agents
│   ├── rag/                # RAG pipeline
│   │   ├── chunker.ts      # Text chunking
│   │   ├── embeddings.ts   # Gemini embeddings
│   │   ├── vector-store.ts # pgvector storage
│   │   └── retriever.ts    # Context retrieval
│   ├── github/             # GitHub integration
│   │   ├── pr-fetcher.ts   # PR data fetching
│   │   ├── git-history.ts  # Git history analysis
│   │   └── types.ts        # TypeScript types
│   ├── repository/         # Repository analysis
│   └── supabase/           # Database client
├── supabase/               # SQL migrations
└── hooks/                  # React hooks
```

## How It Works

### 1. Repository Analysis (One-time)

```
Clone repo → Scan files → Detect framework/language/patterns
→ Chunk source files → Generate embeddings → Store in pgvector
```

### 2. Code Review (Per PR)

```
Fetch PR diff → Retrieve RAG context → Fetch git history
→ Run 6 agents in parallel (each can call tools)
→ Coordinator synthesizes findings
→ Return structured review with scores
```

## API Reference

### `POST /api/analyze`

Analyze a repository and store it in the vector database.

```json
{
  "url": "https://github.com/owner/repo"
}
```

### `POST /api/review`

Run a multi-agent review on a PR diff.

```json
{
  "repositoryId": "uuid",
  "issueDescription": "Description of what the PR should do...",
  "codeDiff": "diff --git a/...",
  "prUrl": "https://github.com/owner/repo/pull/123"
}
```

### `POST /api/github/pr`

Fetch PR data from GitHub.

```json
{
  "url": "https://github.com/owner/repo/pull/123"
}
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License. See [LICENSE](LICENSE) for details.

## Acknowledgments

- Built with [Vercel AI SDK](https://sdk.vercel.ai/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Embeddings by [Google Gemini](https://ai.google.dev/)
- Database by [Supabase](https://supabase.com/)
