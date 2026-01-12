    import { useMutation, useQueryClient } from "@tanstack/react-query";
    import { createAdoptionPost } from "../util/http";

    export function useCreateAdoptionPost({ onSuccess, onError }) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createAdoptionPost,
        onSuccess: (data, variables, context) => {
        // Refresh adoption & all feeds
        queryClient.invalidateQueries({ queryKey: ["posts-feed", "adoption"] });
        queryClient.invalidateQueries({ queryKey: ["posts-feed", "all"] });

        // Call the callback if provided
        onSuccess?.(data, variables, context);
        },
        onError: (err, variables, context) => {
        // Call the error callback if provided
        onError?.(err, variables, context);
        },
    });
    }
