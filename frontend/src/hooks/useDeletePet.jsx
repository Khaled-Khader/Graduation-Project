// hooks/useDeletePet.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePet } from "../util/http";

export function useDeletePet() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (petId) => deletePet(petId),

        onSuccess: (_, petId) => {
        // invalidate pets list
        queryClient.invalidateQueries(["pets"]);

        // OR optimistic update (optional)
        queryClient.setQueryData(["pets"], (old) =>
            old?.filter((p) => p.id !== petId)
        );
        },
    });
}
