    import { useMutation } from "@tanstack/react-query";

    export function useRegister() {
    return useMutation({
        mutationFn: async (dto) => {
        const res = await fetch("http://localhost:8080/users/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto),
            credentials: "include", // store JWT cookie
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || "Registration failed");
        }

        // Return user info from backend (id, email, role)
        return res.json();
        },
    });
    }
