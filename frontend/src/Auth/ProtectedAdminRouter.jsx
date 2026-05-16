import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthHook";

export default function ProtectedAdminRouter({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#0A0F29] text-white">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/app" replace />;
  }

  return children;
}
