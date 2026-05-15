import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePost } from "../util/http";

export function useDeletePost(onSuccess) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deletePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts-feed"] });
            queryClient.invalidateQueries({ queryKey: ["user-adoption-post"] });
            queryClient.invalidateQueries({ queryKey: ["pets"] });
            onSuccess?.();
        },
    });
}
