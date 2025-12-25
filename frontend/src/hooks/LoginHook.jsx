    import { useMutation, useQueryClient } from "@tanstack/react-query";
    import { LoginFetchData } from "../util/http";

    export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ email, password }) => {
        const response = await LoginFetchData({ email, password });

        
        if (response.status !== 200) {
            throw new Error("Invalid email or password");
        }

        const userData = await response.json(); 
        return userData;
        },

        onSuccess: (userData) => {
        queryClient.setQueryData(["user"], userData);
        },
    });
    }
