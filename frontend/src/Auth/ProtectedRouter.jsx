import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthHook";

export default function ProtectedRouter({ children }) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
        <div className="w-full min-h-screen flex items-center justify-center bg-[#0A0F29] text-white">
            Loading...
        </div>
        );
    }


    if (!user) {
        return <Navigate to="/sign-in" replace />;
    }

    if (user.role === "ADMIN") {
        return <Navigate to="/admin" replace />;
    }

    return children;
}
