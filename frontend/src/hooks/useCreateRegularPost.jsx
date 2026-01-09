import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRegularPost } from "..//util/http";

export function useCreateRegularPost(onSuccess) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createRegularPost,
        onSuccess: () => {
        
        queryClient.invalidateQueries({ queryKey: ["posts-feed"] });
        onSuccess?.();
        },
    });
}
