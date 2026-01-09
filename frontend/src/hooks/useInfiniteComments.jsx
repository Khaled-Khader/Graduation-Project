import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchComments } from "../util/http";

export function useInfiniteComments(postId, size = 10) {
    return useInfiniteQuery({
        queryKey: ["comments", postId],
        queryFn: ({ pageParam = 0 }) => fetchComments(postId, { pageParam, size }),
        getNextPageParam: (lastPage) => {
        if (lastPage.number + 1 < lastPage.totalPages) {
            return lastPage.number + 1;
        }
        return undefined; // no more pages
        },
    });
}