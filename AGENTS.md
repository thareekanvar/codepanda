# CodePanda

Open-source, multi-agent code review system with 6 specialized AI agents.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **AI:** Vercel AI SDK + Google Gemini
- **Database:** Supabase (PostgreSQL + pgvector)
- **UI:** shadcn/ui + Tailwind CSS
- **Language:** TypeScript

## Project Structure

- `lib/agents/` - 6 AI agents (architecture, issue, testing, quality, security, performance)
- `lib/ai/` - AI utilities (model, schemas, agent runners, diff chunker)
- `lib/tools/` - 12 tools for agent tool-calling
- `lib/rag/` - RAG pipeline (chunker, embeddings, vector store, retriever)
- `lib/github/` - GitHub integration (PR fetcher, git history)
- `components/` - React UI components
- `app/` - Next.js App Router pages and API routes

## Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint

## Environment Variables

Required:
- `GOOGLE_GENERATIVE_AI_API_KEY` - Gemini API key
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase client URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Supabase client key

Optional:
- `GITHUB_TOKEN` - For private repos
- `BRAVE_API_KEY` - For web search in agents
