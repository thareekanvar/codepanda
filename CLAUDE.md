# CodePanda - Claude Instructions

This is a Next.js 16 project using App Router.

## Key Patterns

- Server components by default, client components with `"use client"`
- API routes in `app/api/` using Route Handlers
- Database via Supabase client in `lib/supabase/`
- AI agents in `lib/agents/` run in parallel
- Tool-calling agents use `lib/ai/tool-agent-runner.ts`

## Code Style

- TypeScript strict mode
- Use Zod schemas for validation
- Follow existing component patterns in `components/`
- Use `cn()` utility for conditional classes
