import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export function getRecommendationDetails(recommendation: string | undefined) {
  switch (recommendation) {
    case "approve":
      return {
        label: "Approved",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        icon: CheckCircle2,
      };
    case "approve_with_comments":
      return {
        label: "Approved with Comments",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        icon: AlertTriangle,
      };
    case "request_changes":
    default:
      return {
        label: "Changes Requested",
        color: "text-red-400 bg-red-500/10 border-red-500/20",
        icon: XCircle,
      };
  }
}
