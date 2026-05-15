import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Send } from "lucide-react";
import Dialog from "./Dialog";
import { useAddComment } from "../../../hooks/useAddComment";
import { useInfiniteComments } from "../../../hooks/useInfiniteComments";

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

function CommentAvatar({ src, name }) {
    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10"
            />
        );
    }

    return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/75">
            {(name || "U").trim().charAt(0).toUpperCase()}
        </div>
    );
}

export default function CommentsDialog({ open, onClose, postId, onCommentAdded }) {
    const [newComment, setNewComment] = useState("");
    const loadMoreRef = useRef(null);
    const scrollRef = useRef(null);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        error,
        refetch,
    } = useInfiniteComments(postId, 10, {
        enabled: open,
        refetchInterval: open ? 5000 : false,
    });

    const addComment = useAddComment(postId, () => {
        setNewComment("");
        onCommentAdded?.();
        refetch();
    });

    const comments = data?.pages.flatMap((page) => page.content) ?? [];
    const totalComments = data?.pages?.[0]?.totalElements ?? comments.length;
    const isAdding = addComment.isPending;

    useEffect(() => {
        if (!open || !hasNextPage) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 1 }
        );

        if (loadMoreRef.current) observer.observe(loadMoreRef.current);

        return () => observer.disconnect();
    }, [fetchNextPage, hasNextPage, isFetchingNextPage, open]);

    useEffect(() => {
        if (!open) {
            setNewComment("");
            return;
        }

        refetch();
        window.setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }, 150);
    }, [open, refetch]);

    function handleAddComment(event) {
        event.preventDefault();
        const content = newComment.trim();
        if (!content) return;
        addComment.mutate(content);
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <div className="flex h-[70vh] max-h-[560px] flex-col">
                <div className="mb-4 shrink-0">
                    <h2 className="text-xl font-bold">Comments</h2>
                    <p className="text-sm text-white/50">{totalComments} total</p>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto pr-1">
                    {status === "pending" && (
                        <p className="text-sm text-white/70">Loading comments...</p>
                    )}

                    {status === "error" && (
                        <p className="text-sm text-red-300">{error.message}</p>
                    )}

                    {status === "success" && comments.length === 0 && (
                        <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-center text-sm text-white/60">
                            No comments yet.
                        </p>
                    )}

                    <div className="flex flex-col gap-3">
                        {comments.map((comment) => (
                            <div key={comment.id} className="rounded-xl bg-white/10 p-3">
                                <div className="mb-2 flex items-start justify-between gap-3">
                                    <Link
                                        to={`/app/profile/${comment.userId}`}
                                        onClick={onClose}
                                        className="flex min-w-0 items-center gap-2"
                                    >
                                        <CommentAvatar
                                            src={comment.userImageUrl}
                                            name={comment.userName}
                                        />
                                        <span className="truncate text-sm font-semibold hover:text-[#1CE0B7]">
                                            {comment.userName}
                                        </span>
                                    </Link>
                                    <span className="shrink-0 text-xs text-white/50">
                                        {getRelativeTime(comment.createdAt)}
                                    </span>
                                </div>

                                <p className="whitespace-pre-wrap break-words pl-11 text-sm text-white/90">
                                    {comment.content}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div ref={loadMoreRef} className="flex h-9 items-center justify-center">
                        {isFetchingNextPage && (
                            <p className="text-sm text-white/60">Loading more...</p>
                        )}
                    </div>
                </div>

                <form onSubmit={handleAddComment} className="mt-4 flex shrink-0 gap-2">
                    <input
                        value={newComment}
                        onChange={(event) => setNewComment(event.target.value)}
                        className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm outline-none transition focus:border-[#1CE0B7]/70"
                        placeholder="Write a comment..."
                        disabled={isAdding}
                    />
                    <button
                        type="submit"
                        className="inline-flex h-10 w-11 items-center justify-center rounded-xl bg-[#1CE0B7] text-[#071323] transition hover:bg-[#39f0c9] disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isAdding || !newComment.trim()}
                        aria-label="Send comment"
                    >
                        <Send size={18} />
                    </button>
                </form>

                {addComment.isError && (
                    <p className="mt-2 text-sm text-red-300">{addComment.error.message}</p>
                )}
            </div>
        </Dialog>
    );
}
