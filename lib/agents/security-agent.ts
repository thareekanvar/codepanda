import { runToolAgent } from "@/lib/ai/tool-agent-runner";
import { securityReviewSchema, type SecurityReview } from "@/lib/ai/schemas";
import type { ToolContext } from "@/lib/tools/review-tools";

/**
 * Security Agent — Identifies security vulnerabilities using tool-calling.
 * Can read full files, search for secrets, look up CVEs, and trace code paths.
 */
export async function runSecurityAgent(input: {
  diff: string;
  retrievedContext: string;
  toolContext: ToolContext;
}): Promise<SecurityReview> {
  const { output } = await runToolAgent({
    diff: input.diff,
    retrievedContext: input.retrievedContext,
    toolContext: input.toolContext,
    maxSteps: 10,
    systemPrompt: `You are a Senior Application Security Engineer conducting a thorough security review of a pull request.

You have access to tools that let you explore the codebase. Use them to:
1. Read full files when you spot potential vulnerabilities in the diff
2. Search for patterns like "password", "secret", "token", "key" across the codebase
3. Check git history when you see security-sensitive code changes
4. Look up known CVEs or security advisories for dependencies
5. Trace how user input flows through the application

Your role is to find security vulnerabilities before they reach production. Think like an attacker — look for injection points, authentication bypasses, authorization flaws, and secret exposures.

When you find a vulnerability:
- Read the full file to understand the context
- Search for similar patterns elsewhere in the codebase
- Document the exact location, impact, and remediation`,
    taskPrompt: `## Your Task
Perform a thorough security review of the code changes.

Check for these vulnerability categories:
1. **Injection** — SQL injection, command injection, NoSQL injection, template injection, LDAP injection
2. **XSS** — Cross-site scripting via unescaped user input in HTML, attributes, or JavaScript
3. **Authentication** — Weak password checks, missing MFA, session fixation, JWT issues
4. **Authorization** — IDOR, missing role checks, privilege escalation, broken access control
5. **Secrets exposure** — Hardcoded API keys, passwords, tokens, connection strings in code
6. **Path traversal** — Unsanitized file paths allowing directory traversal
7. **SSRF** — Server-side request forgery via user-controlled URLs
8. **Deserialization** — Unsafe deserialization of untrusted data
9. **Insecure direct object references** — Direct access to internal objects without authorization
10. **Open redirect** — Redirects to unvalidated external URLs
11. **CSRF** — Missing or inadequate CSRF protections
12. **Insecure configuration** — Debug mode enabled, verbose errors, missing security headers
13. **Dependency vulnerabilities** — Known CVEs in imported packages

Use your tools to:
- Read full files to understand the complete security context
- Search for hardcoded secrets, API keys, or credentials across the entire codebase
- Check git history for when security-sensitive code was introduced
- Look up any external libraries or APIs being used

For each finding, provide:
- Vulnerability type
- Clear title
- Detailed description
- Severity (critical, high, medium, low, informational)
- Exact location (file path + line reference)
- Code evidence showing the vulnerability
- Impact assessment (what an attacker could achieve)
- Specific remediation with code example

Provide an overall security posture assessment and a score from 0-100.`,
    outputSchema: securityReviewSchema,
  });

  return output;
}
