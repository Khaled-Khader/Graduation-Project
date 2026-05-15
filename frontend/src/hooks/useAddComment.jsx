import { useQueryClient,useMutation } from "@tanstack/react-query";
import { addComment } from "../util/http";

export function useAddComment(postId, onSuccess) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (content) => addComment(postId, content),
        onSuccess: (data) => {
        
        queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        queryClient.invalidateQueries({ queryKey: ["posts-feed"] });
        onSuccess?.(data);
        },
    });
}
