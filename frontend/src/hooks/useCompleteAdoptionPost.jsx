import { useMutation ,useQueryClient } from "@tanstack/react-query";
import { CompleteAdoptionPost } from "../util/http";

export function useCompleteAdoptionPost(){

    const query=useQueryClient()

    return useMutation({
        mutationFn:async (postId)=>{
            const response= await CompleteAdoptionPost(postId)
            return response
        },
        onSuccess:()=>{
            query.invalidateQueries({
                queryKeyqueryKey:["user-adoption-post"]
                
            })
        }
    })
}