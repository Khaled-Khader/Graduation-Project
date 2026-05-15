    import { useInfiniteQuery } from "@tanstack/react-query";
    import { fetchPostsFeed } from "../api/postApi";

    export function useInfinitePostsFeed(type, sortBy = "latest") {
    return useInfiniteQuery({
        queryKey: ["posts-feed", type, sortBy],
        queryFn: ({ pageParam }) =>
        fetchPostsFeed({
            type,
            pageParam,
            size: 10,
            sortBy,
        }),
        getNextPageParam: (lastPage) => {
        // lastPage is your Spring Page
        if (lastPage.last) return undefined;
        return lastPage.number + 1;
        },
        staleTime: 5000,
        refetchInterval: 10000,
        refetchIntervalInBackground: false,
        keepPreviousData: true,
    });
    }
