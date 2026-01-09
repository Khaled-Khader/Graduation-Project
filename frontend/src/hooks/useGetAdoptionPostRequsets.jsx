import { useInfiniteQuery } from "@tanstack/react-query";
import { FetchRequsetOnAdoptionPost } from "../util/http";
export function useInfiniteAdoptionRequests(postId) {
    return useInfiniteQuery({
        queryKey: ["adoptionRequests", postId],
        queryFn: ({ pageParam = 0 }) =>
        FetchRequsetOnAdoptionPost(postId, pageParam),

        getNextPageParam: (lastPage) => {
        if (lastPage.last) return undefined; // no more pages
        return lastPage.number + 1; // next page
        },
    });
}
