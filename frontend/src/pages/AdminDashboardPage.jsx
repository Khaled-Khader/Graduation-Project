import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Ban,
  CheckCircle2,
  FileText,
  LogOut,
  Megaphone,
  Send,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  XCircle,
} from "lucide-react";
import LogoutDialog from "../components/posts/dialogs/LogoutDialog";
import { useLogout } from "../hooks/useLogout";
import {
  approveAdminVerification,
  deleteAdminPost,
  fetchAdminPosts,
  fetchAdminUsers,
  fetchAdminVerifications,
  rejectAdminVerification,
  sendAdminBroadcastNotification,
  updateAdminUserStatus,
} from "../util/http";

const tabs = [
  { id: "users", label: "Users", icon: Users },
  { id: "verifications", label: "Verifications", icon: ShieldCheck },
  { id: "posts", label: "Posts", icon: FileText },
  { id: "broadcast", label: "Broadcast", icon: Megaphone },
];

const roleOptions = ["OWNER", "VET", "CLINIC", "ADMIN"];
const accountStatusOptions = ["ACTIVE", "SUSPENDED", "BANNED"];
const verificationStatusOptions = [
  "PENDING",
  "UNDER_REVIEW",
  "VERIFIED",
  "REJECTED",
  "UNVERIFIED",
];

function formatDate(value) {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function fullName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || "No name";
}

function badgeClass(value) {
  switch (value) {
    case "ACTIVE":
    case "VERIFIED":
      return "border-emerald-300/30 bg-emerald-400/10 text-emerald-200";
    case "PENDING":
    case "UNDER_REVIEW":
    case "SUSPENDED":
      return "border-amber-300/30 bg-amber-400/10 text-amber-200";
    case "BANNED":
    case "REJECTED":
      return "border-red-300/30 bg-red-400/10 text-red-200";
    default:
      return "border-slate-300/20 bg-slate-300/10 text-slate-200";
  }
}

function StatusBadge({ value }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClass(value)}`}>
      {value || "N/A"}
    </span>
  );
}

function isPdfUrl(url) {
  return (url || "").split("?")[0].toLowerCase().endsWith(".pdf");
}

function verificationDocumentUrl(request) {
  return request.documentPreviewUrl || request.documentUrl;
}

function ActionButton({ children, tone = "neutral", ...props }) {
  const toneClass = {
    neutral: "border-white/10 bg-white/10 text-white hover:bg-white/15",
    success: "border-emerald-300/25 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25",
    warning: "border-amber-300/25 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25",
    danger: "border-red-300/25 bg-red-500/15 text-red-100 hover:bg-red-500/25",
  }[tone];

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${toneClass}`}
      {...props}
    >
      {children}
    </button>
  );
}

function AdminHeader() {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { logout, isPending: isLoggingOut } = useLogout();

  function handleConfirmLogout() {
    setShowLogoutDialog(false);
    logout();
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#071323]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1CE0B7]/15 text-[#1CE0B7]">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-white/55">PetNexus moderation console</p>
            </div>
          </div>

          <ActionButton
            tone="danger"
            onClick={() => setShowLogoutDialog(true)}
            disabled={isLoggingOut}
          >
            <LogOut size={17} />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </ActionButton>
        </div>
      </header>

      <LogoutDialog
        open={showLogoutDialog}
        onCancel={() => setShowLogoutDialog(false)}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
      />
    </>
  );
}

function TabButton({ tab, active, onClick, count = 0 }) {
  const Icon = tab.icon;
  const hasCount = count > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-white text-[#071323]"
          : "border border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon size={18} />
      {tab.label}
      {hasCount && (
        <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white shadow-sm">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

function UsersSection() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [accountStatus, setAccountStatus] = useState("");
  const [page, setPage] = useState(0);
  const [statusTarget, setStatusTarget] = useState(null);
  const [statusReason, setStatusReason] = useState("");

  const usersQuery = useQuery({
    queryKey: ["admin-users", query, role, accountStatus, page],
    queryFn: () => fetchAdminUsers({ query: query.trim(), role, accountStatus, page, size: 12 }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, action, reason }) => updateAdminUserStatus(userId, action, reason),
    onSuccess: () => {
      setStatusTarget(null);
      setStatusReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const usersList = usersQuery.data?.content || [];
  const totalPages = usersQuery.data?.totalPages || 1;

  function changeFilter(setter, value) {
    setter(value);
    setPage(0);
  }

  function prepareStatusChange(user, action) {
    setStatusTarget({
      userId: user.id,
      action,
      name: fullName(user),
      status: action === "ban" ? "BANNED" : "SUSPENDED",
    });
    setStatusReason("");
  }

  function submitStatusChange() {
    const reason = statusReason.trim();
    if (!statusTarget || !reason) return;

    statusMutation.mutate({
      userId: statusTarget.userId,
      action: statusTarget.action,
      reason,
    });
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-3 rounded-lg border border-white/10 bg-[#0D1830] p-4 md:grid-cols-[1fr_180px_190px]">
        <input
          value={query}
          onChange={(event) => changeFilter(setQuery, event.target.value)}
          placeholder="Search by name or email"
          className="min-h-11 rounded-lg border border-white/10 bg-white/10 px-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-[#1CE0B7]/70"
        />
        <select
          value={role}
          onChange={(event) => changeFilter(setRole, event.target.value)}
          className="min-h-11 rounded-lg border border-white/10 bg-[#111936] px-3 text-sm text-white outline-none focus:border-[#1CE0B7]/70"
        >
          <option value="">All roles</option>
          {roleOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={accountStatus}
          onChange={(event) => changeFilter(setAccountStatus, event.target.value)}
          className="min-h-11 rounded-lg border border-white/10 bg-[#111936] px-3 text-sm text-white outline-none focus:border-[#1CE0B7]/70"
        >
          <option value="">All statuses</option>
          {accountStatusOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {statusTarget && (
        <div className="grid gap-3 rounded-lg border border-amber-300/25 bg-amber-500/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-amber-100">
              {statusTarget.status === "BANNED" ? "Ban" : "Suspend"} {statusTarget.name}
            </p>
            <ActionButton tone="neutral" onClick={() => setStatusTarget(null)}>
              Cancel
            </ActionButton>
          </div>
          <textarea
            value={statusReason}
            onChange={(event) => setStatusReason(event.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Reason shown to the user on login"
            className="min-h-24 resize-y rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-amber-300/70"
          />
          <div className="flex justify-end">
            <ActionButton
              tone={statusTarget.status === "BANNED" ? "danger" : "warning"}
              disabled={!statusReason.trim() || statusMutation.isPending}
              onClick={submitStatusChange}
            >
              {statusMutation.isPending ? "Saving..." : `Confirm ${statusTarget.status}`}
            </ActionButton>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0D1830]">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase text-white/50">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Verification</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {usersQuery.isLoading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-white/60">
                    Loading users...
                  </td>
                </tr>
              ) : usersList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-white/60">
                    No users found.
                  </td>
                </tr>
              ) : (
                usersList.map((user) => (
                  <tr key={user.id} className="align-top text-white/85">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {user.photoUrl ? (
                          <img src={user.photoUrl} alt={fullName(user)} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white">
                            {fullName(user).charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">{fullName(user)}</p>
                          <p className="truncate text-xs text-white/50">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge value={user.role} />
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge value={user.accountStatus} />
                      {user.accountStatus !== "ACTIVE" && user.accountStatusReason && (
                        <p className="mt-2 max-w-[260px] whitespace-pre-wrap break-words text-xs text-white/55">
                          {user.accountStatusReason}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge value={user.verificationStatus} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <ActionButton
                          tone="success"
                          disabled={statusMutation.isPending || user.role === "ADMIN" || user.accountStatus === "ACTIVE"}
                          onClick={() => statusMutation.mutate({ userId: user.id, action: "activate" })}
                        >
                          <CheckCircle2 size={16} />
                          Activate
                        </ActionButton>
                        <ActionButton
                          tone="warning"
                          disabled={statusMutation.isPending || user.role === "ADMIN" || user.accountStatus === "SUSPENDED"}
                          onClick={() => prepareStatusChange(user, "suspend")}
                        >
                          <UserCog size={16} />
                          Suspend
                        </ActionButton>
                        <ActionButton
                          tone="danger"
                          disabled={statusMutation.isPending || user.role === "ADMIN" || user.accountStatus === "BANNED"}
                          onClick={() => prepareStatusChange(user, "ban")}
                        >
                          <Ban size={16} />
                          Ban
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {statusMutation.isError && (
        <p className="rounded-lg border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {statusMutation.error.message}
        </p>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}

function VerificationsSection() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("PENDING");
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState("");

  const verificationsQuery = useQuery({
    queryKey: ["admin-verifications", status],
    queryFn: () => fetchAdminVerifications(status),
  });

  const approveMutation = useMutation({
    mutationFn: approveAdminVerification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-verifications"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ requestId, rejectionReason }) => rejectAdminVerification(requestId, rejectionReason),
    onSuccess: () => {
      setRejectingId(null);
      setReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-verifications"] });
    },
  });

  const requests = verificationsQuery.data || [];

  function submitReject(requestId) {
    const trimmedReason = reason.trim();
    if (!trimmedReason) return;
    rejectMutation.mutate({ requestId, rejectionReason: trimmedReason });
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#0D1830] p-4">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="min-h-11 rounded-lg border border-white/10 bg-[#111936] px-3 text-sm text-white outline-none focus:border-[#1CE0B7]/70"
        >
          <option value="">All requests</option>
          {verificationStatusOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <div className="text-sm text-white/55">{requests.length} requests</div>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0D1830]">
        <div className="overflow-x-auto">
          <table className="min-w-[1040px] w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase text-white/50">
              <tr>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Document</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {verificationsQuery.isLoading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-white/60">
                    Loading requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-white/60">
                    No verification requests found.
                  </td>
                </tr>
              ) : (
                requests.map((request) => {
                  const reviewUrl = verificationDocumentUrl(request);
                  const isPdf = isPdfUrl(request.documentUrl);

                  return (
                  <tr key={request.id} className="align-top text-white/85">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-white">{request.providerEmail}</p>
                      <p className="text-xs text-white/50">{request.providerRole} - ID {request.providerId}</p>
                    </td>
                    <td className="px-4 py-4">
                      <a
                        href={reviewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
                      >
                        <FileText size={16} />
                        {isPdf ? "Preview PDF" : request.documentType || "DOCUMENT"}
                      </a>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge value={request.status} />
                      {request.rejectionReason && (
                        <p className="mt-2 max-w-[280px] text-xs text-red-200">{request.rejectionReason}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-white/65">{formatDate(request.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <ActionButton
                          tone="success"
                          disabled={approveMutation.isPending || request.status === "VERIFIED"}
                          onClick={() => approveMutation.mutate(request.id)}
                        >
                          <CheckCircle2 size={16} />
                          Approve
                        </ActionButton>
                        <ActionButton
                          tone="danger"
                          disabled={rejectMutation.isPending}
                          onClick={() => {
                            setRejectingId(rejectingId === request.id ? null : request.id);
                            setReason("");
                          }}
                        >
                          <XCircle size={16} />
                          Reject
                        </ActionButton>
                      </div>
                      {rejectingId === request.id && (
                        <div className="mt-3 flex justify-end gap-2">
                          <input
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            placeholder="Reason"
                            className="min-h-10 w-64 rounded-lg border border-white/10 bg-white/10 px-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-red-300/70"
                          />
                          <ActionButton
                            tone="danger"
                            disabled={!reason.trim() || rejectMutation.isPending}
                            onClick={() => submitReject(request.id)}
                          >
                            Submit
                          </ActionButton>
                        </div>
                      )}
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(approveMutation.isError || rejectMutation.isError) && (
        <p className="rounded-lg border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {approveMutation.error?.message || rejectMutation.error?.message}
        </p>
      )}
    </section>
  );
}

function PostsSection() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState("latest");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");

  const postsQuery = useQuery({
    queryKey: ["admin-posts", page, sortBy],
    queryFn: () => fetchAdminPosts({ page, size: 10, sortBy }),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ postId, reason }) => deleteAdminPost(postId, reason),
    onSuccess: () => {
      setDeleteTarget(null);
      setDeleteReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    },
  });

  const posts = postsQuery.data?.content || [];
  const totalPages = postsQuery.data?.totalPages || 1;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#0D1830] p-4">
        <select
          value={sortBy}
          onChange={(event) => {
            setSortBy(event.target.value);
            setPage(0);
          }}
          className="min-h-11 rounded-lg border border-white/10 bg-[#111936] px-3 text-sm text-white outline-none focus:border-[#1CE0B7]/70"
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="comments">Most commented</option>
        </select>
      </div>

      <div className="grid gap-4">
        {postsQuery.isLoading ? (
          <div className="rounded-lg border border-white/10 bg-[#0D1830] p-8 text-center text-white/60">
            Loading posts...
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-[#0D1830] p-8 text-center text-white/60">
            No posts found.
          </div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="rounded-lg border border-white/10 bg-[#0D1830] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <StatusBadge value={post.postType} />
                    {post.adoptionStatus && <StatusBadge value={post.adoptionStatus} />}
                    <span className="text-xs text-white/45">{formatDate(post.createdAt)}</span>
                  </div>
                  <p className="font-semibold text-white">{post.ownerName || "Unknown user"}</p>
                  <p className="text-xs text-white/50">Owner ID {post.ownerId || post.userId}</p>
                </div>
                <ActionButton
                  tone="danger"
                  onClick={() => {
                    setDeleteTarget(post.id);
                    setDeleteReason("");
                  }}
                >
                  <Trash2 size={16} />
                  Delete
                </ActionButton>
              </div>

              <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-white/80">
                {post.content || "No content"}
              </p>

              {post.imageUrl && (
                <a href={post.imageUrl} target="_blank" rel="noreferrer" className="mt-4 block max-w-xs overflow-hidden rounded-lg border border-white/10">
                  <img src={post.imageUrl} alt="post" className="h-40 w-full object-cover" />
                </a>
              )}

              {deleteTarget === post.id && (
                <div className="mt-4 grid gap-3 rounded-lg border border-red-300/20 bg-red-500/10 p-3">
                  <span className="text-sm text-red-100">Delete this post permanently?</span>
                  <textarea
                    value={deleteReason}
                    onChange={(event) => setDeleteReason(event.target.value)}
                    rows={3}
                    maxLength={1000}
                    placeholder="Reason sent to the post owner"
                    className="min-h-24 resize-y rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-red-300/70"
                  />
                  <div className="flex flex-wrap justify-end gap-2">
                  <ActionButton
                    tone="neutral"
                    onClick={() => {
                      setDeleteTarget(null);
                      setDeleteReason("");
                    }}
                  >
                    Cancel
                  </ActionButton>
                  <ActionButton
                    tone="danger"
                    disabled={!deleteReason.trim() || deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate({ postId: post.id, reason: deleteReason.trim() })}
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                  </ActionButton>
                  </div>
                </div>
              )}
            </article>
          ))
        )}
      </div>

      {deleteMutation.isError && (
        <p className="rounded-lg border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {deleteMutation.error.message}
        </p>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}

function BroadcastSection() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sentCount, setSentCount] = useState(null);

  const broadcastMutation = useMutation({
    mutationFn: sendAdminBroadcastNotification,
    onSuccess: (data) => {
      setTitle("");
      setMessage("");
      setSentCount(data?.deliveredCount ?? 0);
    },
  });

  const canSend = title.trim().length > 0 && message.trim().length > 0;

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSend || broadcastMutation.isPending) return;

    setSentCount(null);
    broadcastMutation.mutate({
      title: title.trim(),
      message: message.trim(),
    });
  }

  return (
    <section className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-lg border border-white/10 bg-[#0D1830] p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">Broadcast notification</h2>
            <p className="text-sm text-white/55">Send one announcement to all active users.</p>
          </div>
          <ActionButton
            type="submit"
            tone="success"
            disabled={!canSend || broadcastMutation.isPending}
          >
            <Send size={16} />
            {broadcastMutation.isPending ? "Sending..." : "Send"}
          </ActionButton>
        </div>

        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          placeholder="Title"
          className="min-h-11 rounded-lg border border-white/10 bg-white/10 px-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-[#1CE0B7]/70"
        />

        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={6}
          maxLength={1000}
          placeholder="Message"
          className="min-h-36 resize-y rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-[#1CE0B7]/70"
        />

        {sentCount !== null && (
          <p className="rounded-lg border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            Announcement sent to {sentCount} users.
          </p>
        )}

        {broadcastMutation.isError && (
          <p className="rounded-lg border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {broadcastMutation.error.message}
          </p>
        )}
      </form>
    </section>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/65">
      <span>
        Page {page + 1} of {Math.max(totalPages, 1)}
      </span>
      <div className="flex gap-2">
        <ActionButton disabled={page <= 0} onClick={() => onPageChange(Math.max(page - 1, 0))}>
          Previous
        </ActionButton>
        <ActionButton disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>
          Next
        </ActionButton>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("users");
  const { data: pendingVerificationRequests = [] } = useQuery({
    queryKey: ["admin-verifications", "PENDING"],
    queryFn: () => fetchAdminVerifications("PENDING"),
    refetchInterval: 15000,
  });

  const pendingVerificationCount = pendingVerificationRequests.length;
  const ActiveSection = useMemo(() => {
    if (activeTab === "verifications") return VerificationsSection;
    if (activeTab === "posts") return PostsSection;
    if (activeTab === "broadcast") return BroadcastSection;
    return UsersSection;
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#071323] text-white">
      <AdminHeader />
      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              count={tab.id === "verifications" ? pendingVerificationCount : 0}
            />
          ))}
        </div>

        <ActiveSection />
      </main>
    </div>
  );
}
