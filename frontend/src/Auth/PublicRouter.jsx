import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthHook";

export default function PublicRouter({ children }) {
    const { user, isAuthenticated, isLoading } = useAuth();


    if (isLoading) {
        return (
        <div className="w-full min-h-screen flex items-center justify-center text-white">
            Loading...
        </div>
        );
    }

    
    if (isAuthenticated) {
        return <Navigate to={user?.role === "ADMIN" ? "/admin" : "/app"} replace />;
    }

    return children;
}
