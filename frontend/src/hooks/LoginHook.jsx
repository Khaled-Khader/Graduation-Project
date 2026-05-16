    import { useMutation, useQueryClient } from "@tanstack/react-query";
    import { LoginFetchData, readErrorResponse } from "../util/http";

    export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ email, password }) => {
        const response = await LoginFetchData({ email, password });

        
        if (response.status !== 200) {
            const errorData = await readErrorResponse(response);
            const error = new Error(errorData.message || "Invalid email or password");
            error.status = response.status;
            error.accountStatus = errorData.accountStatus;
            error.reason = errorData.reason;
            throw error;
        }

        const userData = await response.json(); 
        return userData;
        },

        onSuccess: (userData) => {
        queryClient.setQueryData(["user"], userData);
        },
    });
    }
