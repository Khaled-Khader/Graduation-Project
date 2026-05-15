import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Edit3, MapPin, PawPrint, Trash2, X } from "lucide-react";
import { useAuth } from "../Auth/AuthHook";
import { useDeletePost } from "../hooks/useDeletePost";
import { useUpdatePost } from "../hooks/useUpdatePost";
import { formatAge } from "../util/AgeFormatter";
import AdoptionRequestDialog from "./posts/dialogs/AdoptionRequestDialog";

function getRelativeTime(createdAt) {
    const postDate = new Date(createdAt);
    const now = new Date();
    const diffMs = now - postDate;

    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);

    if (months >= 1) return `${months}mo`;
    if (weeks >= 1) return `${weeks}w`;
    if (days >= 1) return `${days}d`;
    if (hours >= 1) return `${hours}h`;
    if (minutes >= 1) return `${minutes}m`;

    return "now";
}

function wasEdited(createdAt, updatedAt) {
    if (!createdAt || !updatedAt) return false;
    return new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 1000;
}

function Avatar({ src, name }) {
    if (src) {
        return (
            <img
                src={src}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10"
                alt={name}
            />
        );
    }

    return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFB84D]/20 text-sm font-bold text-[#FFB84D] ring-2 ring-white/10">
            {(name || "U").trim().charAt(0).toUpperCase()}
        </div>
    );
}

export default function AdoptionPostCard({ post }) {
    const [requestDialogOpen, setRequestDialogOpen] = useState(false);
    const [hasRequested, setHasRequested] = useState(Boolean(post.requestedByCurrentUser));
    const [isEditing, setIsEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [editText, setEditText] = useState(post.content || "");
    const [editCity, setEditCity] = useState(post.city || "");
    const { user } = useAuth();

    const ownerId = post.ownerId ?? post.userId;
    const isOwner = post.ownedByCurrentUser || String(user?.id) === String(ownerId);
    const isReserved = post.adoptionStatus === "RESERVED";
    const requestDisabled = isReserved || hasRequested;
    const updatePost = useUpdatePost(() => setIsEditing(false));
    const deletePost = useDeletePost();

    useEffect(() => {
        setHasRequested(Boolean(post.requestedByCurrentUser));
    }, [post.id, post.requestedByCurrentUser]);

    useEffect(() => {
        setEditText(post.content || "");
        setEditCity(post.city || "");
    }, [post.id, post.content, post.city]);

    const genderLabel =
        post.petDTO.gender === "MALE"
            ? "Male"
            : post.petDTO.gender === "FEMALE"
              ? "Female"
              : "Unknown";

    function getRequestButtonText() {
        if (isReserved) return "Reserved";
        if (hasRequested) return "Request sent";
        return "Request adoption";
    }

    function handleSave() {
        const content = editText.trim();
        const city = editCity.trim();
        if (!content || !city) return;

        updatePost.mutate({
            postId: post.id,
            data: {
                content,
                city,
                imageUrl: post.imageUrl,
            },
        });
    }

    function handleDelete() {
        deletePost.mutate(post.id);
    }

    return (
        <div className="w-full px-3 sm:px-4">
            <article className="mx-auto w-full max-w-[680px] overflow-hidden rounded-xl border border-[#1CE0B7]/20 bg-[#102033] text-white shadow-lg transition hover:border-[#1CE0B7]/40">
                <div className="grid gap-0 md:grid-cols-[0.95fr_1.2fr]">
                    <div className="relative min-h-[260px] bg-[#071323]">
                        {post.petDTO.photoUrl ? (
                            <img
                                src={post.petDTO.photoUrl}
                                alt={post.petDTO.name}
                                className="h-full min-h-[260px] w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full min-h-[260px] items-center justify-center text-white/40">
                                <PawPrint size={42} />
                            </div>
                        )}

                        <div className="absolute left-3 top-3 rounded-lg bg-[#FF6B6B] px-3 py-1 text-xs font-bold text-white">
                            Adoption
                        </div>
                        <div
                            className={`absolute right-3 top-3 rounded-lg px-3 py-1 text-xs font-bold ${
                                isReserved
                                    ? "bg-[#FFB84D] text-[#1d1302]"
                                    : "bg-[#1CE0B7] text-[#071323]"
                            }`}
                        >
                            {post.adoptionStatus}
                        </div>
                    </div>

                    <div className="flex flex-col p-4 sm:p-5">
                        <header className="mb-4 flex items-start justify-between gap-3">
                            <Link
                                to={`/app/profile/${ownerId}`}
                                className="flex min-w-0 items-center gap-3"
                            >
                                <Avatar src={post.userImageUrl} name={post.ownerName} />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold">
                                        {post.ownerName || "Pet owner"}
                                    </p>
                                    <p className="text-xs text-white/50">
                                        {getRelativeTime(post.createdAt)}
                                        {wasEdited(post.createdAt, post.updatedAt) && " - Edited"}
                                    </p>
                                </div>
                            </Link>

                            {isOwner && !isEditing && (
                                <div className="flex shrink-0 items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(true);
                                            setConfirmDelete(false);
                                        }}
                                        className="rounded-lg p-2 text-white/65 transition hover:bg-white/10 hover:text-white"
                                        aria-label="Edit adoption post"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setConfirmDelete((value) => !value)}
                                        className="rounded-lg p-2 text-white/65 transition hover:bg-red-500/15 hover:text-red-200"
                                        aria-label="Delete adoption post"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )}
                        </header>

                        <div className="mb-3">
                            <h3 className="break-words text-xl font-bold">{post.petDTO.name}</h3>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/70">
                                <span className="rounded-lg bg-white/10 px-2 py-1">
                                    {post.petDTO.species}
                                </span>
                                <span className="rounded-lg bg-white/10 px-2 py-1">
                                    {genderLabel}
                                </span>
                                <span className="rounded-lg bg-white/10 px-2 py-1">
                                    {formatAge(Number(post.petDTO.age))}
                                </span>
                            </div>
                        </div>

                        {isEditing ? (
                            <div className="mb-4 space-y-3">
                                <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm focus-within:border-[#1CE0B7]/70">
                                    <MapPin size={17} className="shrink-0 text-[#1CE0B7]" />
                                    <input
                                        value={editCity}
                                        onChange={(event) => setEditCity(event.target.value)}
                                        className="min-w-0 flex-1 bg-transparent outline-none"
                                        placeholder="City"
                                    />
                                </label>
                                <textarea
                                    value={editText}
                                    onChange={(event) => setEditText(event.target.value)}
                                    className="min-h-[110px] w-full resize-none rounded-xl border border-white/10 bg-white/10 p-3 text-sm leading-relaxed outline-none transition focus:border-[#1CE0B7]/70"
                                    autoFocus
                                />
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={!editText.trim() || !editCity.trim() || updatePost.isPending}
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1CE0B7] px-4 py-2.5 text-sm font-semibold text-[#071323] transition hover:bg-[#39f0c9] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Check size={17} />
                                        {updatePost.isPending ? "Saving..." : "Save"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditText(post.content || "");
                                            setEditCity(post.city || "");
                                            setIsEditing(false);
                                        }}
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/15"
                                    >
                                        <X size={17} />
                                        Cancel
                                    </button>
                                </div>
                                {updatePost.isError && (
                                    <p className="text-sm text-red-300">{updatePost.error.message}</p>
                                )}
                            </div>
                        ) : (
                            <>
                                <p className="mb-2 flex items-center gap-2 text-sm text-white/70">
                                    <MapPin size={16} className="text-[#1CE0B7]" />
                                    <span className="break-words">{post.city}</span>
                                </p>
                                <p className="mb-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-white/90">
                                    {post.content}
                                </p>
                            </>
                        )}

                        {confirmDelete && (
                            <div className="mb-4 rounded-xl border border-red-300/20 bg-red-500/10 p-3">
                                <p className="mb-3 text-sm text-red-100">
                                    Delete this adoption post permanently?
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={deletePost.isPending}
                                        className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold transition hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {deletePost.isPending ? "Deleting..." : "Delete"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setConfirmDelete(false)}
                                        className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold transition hover:bg-white/15"
                                    >
                                        Cancel
                                    </button>
                                </div>
                                {deletePost.isError && (
                                    <p className="mt-2 text-sm text-red-300">
                                        {deletePost.error.message}
                                    </p>
                                )}
                            </div>
                        )}

                        {!isOwner && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (!requestDisabled) setRequestDialogOpen(true);
                                }}
                                disabled={requestDisabled}
                                className={`mt-auto w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                    requestDisabled
                                        ? "cursor-not-allowed bg-white/10 text-white/55"
                                        : "bg-[#FF6B6B] text-white hover:bg-[#ff7b7b]"
                                }`}
                            >
                                {getRequestButtonText()}
                            </button>
                        )}
                    </div>
                </div>
            </article>

            <AdoptionRequestDialog
                open={requestDialogOpen}
                onClose={() => setRequestDialogOpen(false)}
                post={post}
                onSuccess={() => setHasRequested(true)}
            />
        </div>
    );
}
