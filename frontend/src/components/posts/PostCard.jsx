import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Edit3, MessageCircle, Trash2, X } from "lucide-react";
import { useAuth } from "../../Auth/AuthHook";
import { useDeletePost } from "../../hooks/useDeletePost";
import { useUpdatePost } from "../../hooks/useUpdatePost";
import CommentsDialog from "./dialogs/CommentsDialog";

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
                className="h-11 w-11 rounded-full object-cover ring-2 ring-white/10"
                alt={name}
            />
        );
    }

    return (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1CE0B7]/20 text-sm font-bold text-[#1CE0B7] ring-2 ring-white/10">
            {(name || "U").trim().charAt(0).toUpperCase()}
        </div>
    );
}

export default function PostCard({ post }) {
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [editText, setEditText] = useState(post.content || "");
    const [commentCount, setCommentCount] = useState(post.commentCount || 0);
    const { user } = useAuth();

    const isOwner =
        post.ownedByCurrentUser || String(user?.id) === String(post.ownerId);

    const updatePost = useUpdatePost(() => {
        setIsEditing(false);
    });
    const deletePost = useDeletePost();

    useEffect(() => {
        setEditText(post.content || "");
    }, [post.id, post.content]);

    useEffect(() => {
        setCommentCount(post.commentCount || 0);
    }, [post.id, post.commentCount]);

    function handleSave() {
        const content = editText.trim();
        if (!content) return;

        updatePost.mutate({
            postId: post.id,
            data: {
                content,
                imageUrl: post.imageUrl,
            },
        });
    }

    function handleDelete() {
        deletePost.mutate(post.id);
    }

    return (
        <div className="w-full px-3 sm:px-4">
            <article className="mx-auto w-full max-w-[680px] rounded-xl border border-white/10 bg-[#111936]/95 p-4 text-white shadow-lg transition hover:border-white/20 sm:p-5">
                <header className="mb-4 flex items-start justify-between gap-3">
                    <Link
                        to={`/app/profile/${post.ownerId}`}
                        className="flex min-w-0 items-center gap-3"
                    >
                        <Avatar src={post.userImageUrl} name={post.ownerName} />
                        <div className="min-w-0">
                            <p className="truncate text-base font-semibold sm:text-lg">
                                {post.ownerName}
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
                                aria-label="Edit post"
                            >
                                <Edit3 size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirmDelete((value) => !value)}
                                className="rounded-lg p-2 text-white/65 transition hover:bg-red-500/15 hover:text-red-200"
                                aria-label="Delete post"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    )}
                </header>

                {isEditing ? (
                    <div className="mb-4 space-y-3">
                        <textarea
                            value={editText}
                            onChange={(event) => setEditText(event.target.value)}
                            className="min-h-[120px] w-full resize-none rounded-xl border border-white/10 bg-white/10 p-3 text-sm leading-relaxed text-white outline-none transition focus:border-[#1CE0B7]/70"
                            autoFocus
                        />
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={!editText.trim() || updatePost.isPending}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1CE0B7] px-4 py-2.5 text-sm font-semibold text-[#071323] transition hover:bg-[#39f0c9] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Check size={17} />
                                {updatePost.isPending ? "Saving..." : "Save"}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditText(post.content || "");
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
                    <p className="mb-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-white/90 sm:text-base">
                        {post.content}
                    </p>
                )}

                {post.imageUrl && (
                    <div className="mb-4 aspect-[4/5] w-full overflow-hidden rounded-xl bg-black">
                        <img
                            src={post.imageUrl}
                            alt="post"
                            className="h-full w-full object-cover"
                        />
                    </div>
                )}

                {confirmDelete && (
                    <div className="mb-4 rounded-xl border border-red-300/20 bg-red-500/10 p-3">
                        <p className="mb-3 text-sm text-red-100">
                            Delete this post permanently?
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

                <footer className="flex items-center justify-between border-t border-white/10 pt-3">
                    <button
                        type="button"
                        onClick={() => setCommentsOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                    >
                        <MessageCircle size={19} />
                        <span>{commentCount} comments</span>
                    </button>
                </footer>
            </article>

            <CommentsDialog
                open={commentsOpen}
                onClose={() => setCommentsOpen(false)}
                postId={post.id}
                onCommentAdded={() => setCommentCount((count) => count + 1)}
            />
        </div>
    );
}
