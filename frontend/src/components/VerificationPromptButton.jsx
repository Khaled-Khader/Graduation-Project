import { ShieldCheck } from "lucide-react";
import { openVerificationDialog } from "./VerificationDialog";

export default function VerificationPromptButton({
  compact = false,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={openVerificationDialog}
      className={`inline-flex animate-pulse items-center justify-center gap-2 rounded-full border border-amber-200/70 bg-amber-300 px-4 py-2.5 text-sm font-bold text-[#1B1A05] shadow-[0_0_24px_rgba(251,191,36,0.65)] transition hover:bg-amber-200 hover:shadow-[0_0_32px_rgba(251,191,36,0.85)] active:scale-95 ${compact ? "px-3 py-2 text-xs" : ""} ${className}`}
    >
      <ShieldCheck className={compact ? "h-4 w-4" : "h-5 w-5"} />
      Verify account
    </button>
  );
}
