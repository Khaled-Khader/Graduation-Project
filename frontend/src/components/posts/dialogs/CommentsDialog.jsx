        import { useState, useRef, useEffect } from "react";
        import Dialog from "./Dialog";
        import { useInfiniteComments } from "../../../hooks/useInfiniteComments";
        import { useAddComment } from "../../../hooks/useAddComment";

        /* ------------------------------------
        Time Ago Formatter (FB / Insta style)
        ------------------------------------ */
        function getRelativeTime(createdAt) {
            const postDate = new Date(createdAt); // ISO UTC
            const now = new Date();

            const diffMs = now - postDate;

            const minutes = Math.floor(diffMs / (1000 * 60));
            const hours   = Math.floor(minutes / 60);
            const days    = Math.floor(hours / 24);
            const weeks   = Math.floor(days / 7);
            const months  = Math.floor(days / 30);

            if (months >= 1) return `${months}mo`;
            if (weeks >= 1)  return `${weeks}w`;
            if (days >= 1)   return `${days}d`;
            if (hours >= 1)  return `${hours}h`;
            if (minutes >= 1) return `${minutes}m`;

            return "now";
            }

        export default function CommentsDialog({ open, onClose, postId }) {
        const [newComment, setNewComment] = useState("");

        // -----------------------------
        // Infinite comments query
        // -----------------------------
        const {
            data,
            fetchNextPage,
            hasNextPage,
            isFetchingNextPage,
            status,
            error,
            refetch,
        } = useInfiniteComments(postId, 10, { enabled: open });

        // -----------------------------
        // Add comment mutation
        // -----------------------------
        const { mutate: addCommentMutate, isLoading: isAdding } = useAddComment(
            postId,
            () => {
            setNewComment("");
            refetch();
            }
        );

        const loadMoreRef = useRef(null);
        const scrollRef = useRef(null);

        // -----------------------------
        // Infinite scroll observer
        // -----------------------------
        useEffect(() => {
            if (!hasNextPage) return;

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
        }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

        // -----------------------------
        // Reset when dialog opens/closes
        // -----------------------------
        useEffect(() => {
            if (!open) {
            setNewComment("");
            } else {
            refetch();
            setTimeout(() => {
                if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            }, 200);
            }
        }, [open, refetch]);

        function handleAddComment(e) {
            e.preventDefault();
            if (!newComment.trim()) return;
            addCommentMutate(newComment);
        }

        return (
            <Dialog open={open} onClose={onClose}>
            <div className="flex flex-col h-[70vh] max-h-[500px]">
                {/* TITLE */}
                <h2 className="text-xl font-bold mb-4 shrink-0">Comments</h2>

                {/* COMMENTS LIST */}
                <div
                ref={scrollRef}
                className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1"
                >
                {status === "loading" && (
                    <p className="text-white">Loading comments...</p>
                )}

                {status === "error" && (
                    <p className="text-red-500">{error.message}</p>
                )}

                {data?.pages.map((page) =>
                    page.content.map((comment) => (
                    <div
                        key={comment.id}
                        className="bg-white/10 p-3 rounded-lg"
                    >
                        <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold">
                            {comment.userName}
                        </p>
                        <span className="text-xs text-white/50">
                            {getRelativeTime(comment.createdAt)}
                        </span>
                        </div>

                        <p className="text-sm text-white/90">
                        {comment.content}
                        </p>
                    </div>
                    ))
                )}

                <div
                    ref={loadMoreRef}
                    className="h-8 flex justify-center items-center"
                >
                    {isFetchingNextPage && (
                    <p className="text-white">Loading more...</p>
                    )}
                </div>
                </div>

                {/* INPUT AREA */}
                <form
                onSubmit={handleAddComment}
                className="flex gap-2 mt-4 shrink-0"
                >
                <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 rounded-lg px-3 py-2 bg-white/10 outline-none"
                    placeholder="Write a comment..."
                    disabled={isAdding}
                />
                <button
                    type="submit"
                    className="bg-[#0A39E0] px-4 rounded-lg font-semibold disabled:opacity-50"
                    disabled={isAdding}
                >
                    {isAdding ? "Sending..." : "Send"}
                </button>
                </form>
            </div>
            </Dialog>
        );
        }
