"use client";

interface ReviewScopeProps {
  issueDescription: string;
}

export function ReviewScope({ issueDescription }: ReviewScopeProps) {
  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold text-foreground/80">Review Scope & Context</h3>
        <p className="text-xs text-muted-foreground">
          The target problem statement or checklist items specified for this automated review.
        </p>
      </div>
      <pre className="whitespace-pre-wrap leading-relaxed bg-muted/20 border border-border/80 rounded-xl p-5 font-mono text-xs text-foreground/90 overflow-x-auto scrollbar-thin w-full max-w-full">
        {issueDescription}
      </pre>
    </div>
  );
}
