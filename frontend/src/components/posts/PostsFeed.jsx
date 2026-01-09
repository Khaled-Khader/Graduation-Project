
    import { useEffect, useRef } from "react";
    import PostCard from "./PostCard";
    import AdoptionPostCard from "../AdoptionPostCard";
    import { useInfinitePostsFeed } from "../../hooks/useInfinitePostsFeed";

    const FILTER_MAP = {
    all: "all",
    posts: "regular",
    adoption: "adoption",
    };

    export default function PostsFeed({ filter }) {
    // Fetch posts based on current filter (cached per type)
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
    } = useInfinitePostsFeed(FILTER_MAP[filter]);

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

    // ✅ LOADING (first fetch)
    if (isLoading) {
        return <p className="text-white">Loading...</p>;
    }

    // ✅ ERROR
    if (isError) {
        return <p className="text-red-500">{error.message}</p>;
    }

    // ✅ SAFETY GUARD
    if (!data || !data.pages) {
        return null;
    }

    // Flatten pages for display
    const posts = data.pages.flatMap((page) => page.content);

    return (
        <div className="mt-6 flex flex-col gap-10">
        {posts.map((post) => {
            if (post.postType === "ADOPTION") {
            return <AdoptionPostCard key={post.id} post={post} />;
            }
            return <PostCard key={post.id} post={post} />;
        })}

        {/* Load more */}
        <div ref={loadMoreRef} className="h-12 flex justify-center items-center">
            {isFetchingNextPage && <p className="text-white">Loading more...</p>}
        </div>
        </div>
    );
    }
