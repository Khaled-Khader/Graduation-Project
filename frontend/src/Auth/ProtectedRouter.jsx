    import { Navigate } from "react-router-dom";
    import { useAuth } from "./AuthHook";

    export default function ProtectedRouter({ children }) {
    const { user, isLoading } = useAuth();

    
    if (isLoading) {
        return (
        <div className="w-full min-h-screen flex items-center justify-center text-white">
            Loading...
        </div>
        );
    }


    if (!user) {
        return <Navigate to="/sign-in" replace />;
    }


    return children;
    }
