    import { useQuery } from "@tanstack/react-query";

    export function useUserProfile(userId) {
    return useQuery({
        queryKey: ["userProfile", userId],  // array key
        queryFn: async () => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/${userId}`, {
            credentials: "include",
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || "Failed to fetch user profile");
        }

        return res.json();
        },
        enabled: !!userId, // only fetch if userId exists
        staleTime: 5 * 60 * 1000, // optional
    });
    }
