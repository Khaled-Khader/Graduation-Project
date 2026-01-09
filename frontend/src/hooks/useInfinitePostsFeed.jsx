    import { useInfiniteQuery } from "@tanstack/react-query";
    import { fetchPostsFeed } from "../api/postApi";

    export function useInfinitePostsFeed(type) {
    return useInfiniteQuery({
        queryKey: ["posts-feed", type], // separate cache per type
        queryFn: ({ pageParam }) =>
        fetchPostsFeed({
            type,
            pageParam,
            size: 10,
        }),
        getNextPageParam: (lastPage) => {
        // lastPage is your Spring Page
        if (lastPage.last) return undefined;
        return lastPage.number + 1;
        },
        staleTime: Infinity, // cache forever for filter switching
        keepPreviousData: true, // do not remove old pages when switching filters
    });
    }
