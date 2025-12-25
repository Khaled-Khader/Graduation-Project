    import { AuthContext } from "./AuthContext";
    import { useQuery } from "@tanstack/react-query";
    import { CheckIfTokenValidOrExist } from "../util/http";

    export function AuthProvider({ children }) {
    const { data, isLoading, isError } = useQuery({
    queryKey: ["user"],
    queryFn: CheckIfTokenValidOrExist,
    staleTime: Infinity,           
    cacheTime: Infinity,           
    refetchOnMount: false,         
    refetchOnWindowFocus: false,   
    retry: false,
    enabled:true
});


    const value = {
        user: data ?? null,
        isLoading,
        isAuthenticated: !!data,
    };

    return (
        <AuthContext.Provider value={value}>
        {children}
        </AuthContext.Provider>
    );
    }
