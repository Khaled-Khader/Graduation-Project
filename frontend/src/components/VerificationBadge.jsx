import { CheckCircle2 } from "lucide-react";

export default function VerificationBadge({ compact = false }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border border-sky-300 bg-sky-100 font-semibold text-sky-700 ${
        compact ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs"
      }`}
      title="Verified provider"
    >
      <CheckCircle2 className={compact ? "h-3 w-3" : "h-4 w-4"} />
      Verified
    </span>
  );
}
