import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePost } from "../util/http";

export function useUpdatePost(onSuccess) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, data }) => updatePost(postId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["posts-feed"] });
            queryClient.invalidateQueries({ queryKey: ["user-adoption-post"] });
            onSuccess?.(data);
        },
    });
}
