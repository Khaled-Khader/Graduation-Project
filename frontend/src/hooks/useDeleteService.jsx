// hooks/useDeleteService.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteService } from "../util/http";

export function useDeleteService() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (serviceId) => deleteService(serviceId),

        onSuccess: (_, serviceId) => {
        queryClient.invalidateQueries(["user-profile"]);
        queryClient.setQueryData(["services"], (old) =>
            old ? old.filter((s) => s.id !== serviceId) : []
        );

        },
    });
}
