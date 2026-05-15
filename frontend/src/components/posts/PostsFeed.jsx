import { useEffect, useRef } from "react";
import PostCard from "./PostCard";
import AdoptionPostCard from "../AdoptionPostCard";
import { useInfinitePostsFeed } from "../../hooks/useInfinitePostsFeed";

const FILTER_MAP = {
    all: "all",
    posts: "regular",
    adoption: "adoption",
};

export default function PostsFeed({ filter, sortBy }) {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
    } = useInfinitePostsFeed(FILTER_MAP[filter], sortBy);

    const loadMoreRef = useRef(null);

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

    if (isLoading) {
        return (
            <div className="mt-6 flex flex-col gap-5">
                {[0, 1, 2].map((item) => (
                    <div
                        key={item}
                        className="mx-auto h-64 w-full max-w-[680px] animate-pulse rounded-xl border border-white/10 bg-white/10"
                    />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-red-100">
                {error.message}
            </div>
        );
    }

    if (!data?.pages) {
        return null;
    }

    const posts = data.pages.flatMap((page) => page.content);

    if (posts.length === 0) {
        return (
            <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/70">
                No posts yet.
            </div>
        );
    }

    return (
        <div className="mt-6 flex flex-col gap-6">
            {posts.map((post) => {
                if (post.postType === "ADOPTION") {
                    return <AdoptionPostCard key={post.id} post={post} />;
                }

                return <PostCard key={post.id} post={post} />;
            })}

            <div ref={loadMoreRef} className="h-12 flex justify-center items-center">
                {isFetchingNextPage && <p className="text-white/70">Loading more...</p>}
            </div>
        </div>
    );
}
