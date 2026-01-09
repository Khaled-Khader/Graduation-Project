import { useQueryClient,useMutation } from "@tanstack/react-query";
import { addComment } from "../util/http";

export function useAddComment(postId, onSuccess) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (content) => addComment(postId, content),
        onSuccess: () => {
        
        queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        onSuccess?.();
        },
    });
}