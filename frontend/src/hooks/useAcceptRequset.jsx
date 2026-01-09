import { useMutation,useQueryClient } from "@tanstack/react-query";
import { AcceptRequsetForAdoptionPost } from "../util/http";

export function useAcceptRequset(onClose){

    const query=useQueryClient()

    return useMutation({
        mutationKey:["user-adoption-post"],
        mutationFn: async (requsetId)=>{
            const response = await AcceptRequsetForAdoptionPost(requsetId)
        },
        onSuccess:()=>{
            onClose()
            query.invalidateQueries({
                queryKey:["user-adoption-post"]
            })
        }
    })
}