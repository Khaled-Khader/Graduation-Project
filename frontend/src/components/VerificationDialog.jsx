import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import { useAuth } from "../Auth/AuthHook";
import {
  fetchMyVerificationStatus,
  skipProviderVerification,
  uploadVerificationDocuments,
} from "../util/http";

const DOCUMENT_TYPES = [
  { value: "VETERINARY_LICENSE", label: "Veterinary license" },
  { value: "CLINIC_LICENSE", label: "Clinic license" },
  { value: "CERTIFICATE", label: "Certificate" },
  { value: "IDENTIFICATION", label: "Identification" },
];

function latestRejectedRequest(requests = []) {
  return requests.find((request) => request.status === "REJECTED");
}

export const OPEN_VERIFICATION_DIALOG_EVENT = "petnexus:open-verification-dialog";

export function openVerificationDialog() {
  window.dispatchEvent(new CustomEvent(OPEN_VERIFICATION_DIALOG_EVENT));
}

export default function VerificationDialog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isProvider = user?.role === "VET" || user?.role === "CLINIC";
  const skipKey = user?.id ? `petnexus-verification-skip-${user.id}` : null;

  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [documentType, setDocumentType] = useState(DOCUMENT_TYPES[0].value);
  const [skipped, setSkipped] = useState(() => {
    return skipKey ? localStorage.getItem(skipKey) === "true" : false;
  });

  const { data: status, isLoading } = useQuery({
    queryKey: ["verification-status", user?.id],
    queryFn: fetchMyVerificationStatus,
    enabled: isProvider,
    retry: false,
  });

  const rejectedRequest = useMemo(
    () => latestRejectedRequest(status?.requests),
    [status]
  );

  useEffect(() => {
    if (!skipKey) {
      setSkipped(false);
      return;
    }

    setSkipped(localStorage.getItem(skipKey) === "true");
  }, [skipKey]);

  useEffect(() => {
    if (!isProvider || isLoading || !status) {
      setOpen(false);
      return;
    }

    if (status.requiresVerification && !skipped) {
      setOpen(true);
    }
  }, [isProvider, isLoading, skipped, status]);

  useEffect(() => {
    function handleOpenVerificationDialog() {
      if (!isProvider) return;

      if (skipKey) {
        localStorage.removeItem(skipKey);
      }

      setSkipped(false);
      setOpen(true);
    }

    window.addEventListener(
      OPEN_VERIFICATION_DIALOG_EVENT,
      handleOpenVerificationDialog
    );

    return () => {
      window.removeEventListener(
        OPEN_VERIFICATION_DIALOG_EVENT,
        handleOpenVerificationDialog
      );
    };
  }, [isProvider, skipKey]);

  const uploadMutation = useMutation({
    mutationFn: uploadVerificationDocuments,
    onSuccess: async () => {
      if (skipKey) {
        localStorage.removeItem(skipKey);
      }
      setSkipped(false);
      setFiles([]);
      await queryClient.invalidateQueries({
        queryKey: ["verification-status", user?.id],
      });
      setOpen(false);
    },
  });

  const skipMutation = useMutation({
    mutationFn: skipProviderVerification,
    onSuccess: () => {
      if (skipKey) {
        localStorage.setItem(skipKey, "true");
      }
      setSkipped(true);
      setOpen(false);
    },
  });

  if (!isProvider || !open) {
    return null;
  }

  function handleFilesChange(event) {
    setFiles(Array.from(event.target.files || []));
  }

  function handleSubmit(event) {
    event.preventDefault();
    uploadMutation.mutate({ files, documentType });
  }

  const selectedFilesLabel =
    files.length === 0
      ? "No documents selected"
      : files.map((file) => file.name).join(", ");

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#050B24]/70 px-4 backdrop-blur-sm">
      <section className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#111936] p-6 text-white shadow-[0_0_40px_rgba(10,57,224,0.35)]">
        <button
          type="button"
          onClick={() => skipMutation.mutate()}
          className="absolute right-4 top-4 rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
          aria-label="Skip verification"
        >
          <X size={18} />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0A39E0]/20 text-[#7EA1FF]">
            <ShieldCheck size={24} />
          </span>
          <div>
            <h2 className="text-2xl font-bold">Provider verification</h2>
            <p className="text-sm text-white/65">
              {user.role === "CLINIC" ? "Clinic" : "Veterinarian"} account
            </p>
          </div>
        </div>

        {rejectedRequest?.rejectionReason && (
          <div className="mb-4 flex gap-3 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
            <p>{rejectedRequest.rejectionReason}</p>
          </div>
        )}

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-white/8 p-3">
            <FileText className="mb-2 text-[#7EA1FF]" size={20} />
            <p className="text-sm font-semibold">Documents</p>
            <p className="text-xs text-white/55">License, certificates, ID</p>
          </div>
          <div className="rounded-xl bg-white/8 p-3">
            <Upload className="mb-2 text-[#7EA1FF]" size={20} />
            <p className="text-sm font-semibold">Secure upload</p>
            <p className="text-xs text-white/55">Cloudinary storage</p>
          </div>
          <div className="rounded-xl bg-white/8 p-3">
            <Clock3 className="mb-2 text-[#7EA1FF]" size={20} />
            <p className="text-sm font-semibold">Review</p>
            <p className="text-xs text-white/55">Admin approval</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white/80">
              Document type
            </span>
            <select
              value={documentType}
              onChange={(event) => setDocumentType(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-[#7EA1FF]"
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value} className="text-[#0A0F29]">
                  {type.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block cursor-pointer rounded-xl border border-dashed border-white/25 bg-white/8 p-4 transition hover:border-[#7EA1FF] hover:bg-white/12">
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={handleFilesChange}
            />
            <span className="flex items-center gap-3 text-sm font-semibold">
              <Upload size={18} />
              Choose verification documents
            </span>
            <span className="mt-2 block truncate text-xs text-white/55">
              {selectedFilesLabel}
            </span>
          </label>

          {uploadMutation.isError && (
            <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-100">
              {uploadMutation.error.message}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={files.length === 0 || uploadMutation.isPending}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0A39E0] px-4 py-3 font-semibold transition hover:bg-[#1346ff] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 size={18} />
              {uploadMutation.isPending ? "Uploading..." : "Submit"}
            </button>
            <button
              type="button"
              disabled={skipMutation.isPending}
              onClick={() => skipMutation.mutate()}
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/15 px-4 py-3 font-semibold text-white/80 transition hover:bg-white/10 disabled:opacity-50"
            >
              Skip
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
