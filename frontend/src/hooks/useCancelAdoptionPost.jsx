import { useMutation,useQueryClient } from "@tanstack/react-query";
import { cancelAdoptionPost } from "../util/http";

export function useCancelAdoptionPost(onSuccessCallback){

    const queryClient=useQueryClient()


    return(
        useMutation({
            mutationKey:["posts-feed", "adoption"],
            mutationFn: async(postId)=>{
                const response=await cancelAdoptionPost(postId)

                if(!response.ok){
                    throw new Error("Some thing gone wrong")
                }

                return true
            },
            onSuccess: () => {
                onSuccessCallback();
                queryClient.invalidateQueries({ queryKey: ["posts-feed"] });
                queryClient.invalidateQueries({queryKey:["user-adoption-post"]})
    },
        })
    )
}