import { useQuery } from "@tanstack/react-query";
import { FetchAdoptionPostsForuser } from "../util/http";
export function useGetUserAdoptionPosts(){

    return useQuery({
        queryKey:["user-adoption-post"],
        queryFn: async ()=>{
            const data=await FetchAdoptionPostsForuser()
            return data
        }
    })
}