import { useMutation } from "@tanstack/react-query";
import { createAdoptionRequest } from "../util/http";

export function useCreateAdoptionRequest(onSuccess) {
    return useMutation({
        mutationFn: createAdoptionRequest,
        onSuccess: () => {
        onSuccess?.();
        },
    });
}
