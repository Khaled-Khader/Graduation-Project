import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAdoptionRequest } from "../util/http";

export function useCreateAdoptionRequest(onSuccess) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createAdoptionRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts-feed"] });
            onSuccess?.();
        },
    });
}
