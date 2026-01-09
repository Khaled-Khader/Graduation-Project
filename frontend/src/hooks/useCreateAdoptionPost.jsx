import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAdoptionPost } from "../util/http";

export function useCreateAdoptionPost(onSuccess) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createAdoptionPost,
        onSuccess: () => {
        // Refresh adoption & all feeds
        queryClient.invalidateQueries({ queryKey: ["posts-feed", "adoption"] });
        queryClient.invalidateQueries({ queryKey: ["posts-feed", "all"] });

        onSuccess?.();
        },
    });
}
