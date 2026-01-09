    import { Link, NavLink, useNavigate } from "react-router-dom";
    import { LogoutFetchData } from "../util/http";
    import { useMutation, useQueryClient } from "@tanstack/react-query";
    import { useAuth } from "../Auth/AuthHook";

    export default function MainNavigation() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const base =
        "flex items-center gap-2 px-3 py-2 rounded-full transition-all text-sm transform duration-150 ease-out active:scale-95 whitespace-nowrap";
    const active = "bg-white text-[#0A0F29] shadow-md font-semibold";
    const inactive = "text-white/80 hover:text-white hover:bg-white/10";

    const { mutate: logout } = useMutation({
        mutationFn: LogoutFetchData,
        onSuccess: async () => {
        await queryClient.cancelQueries();
        queryClient.setQueryData(["user"], null);
        queryClient.clear();
        navigate("/sign-in", { replace: true });
        },
        onError: (error) => {
        console.error("Logout error:", error);
        },
    });

    function handleLogout() {
        logout();
    }

    return (
        <nav className="sticky top-0 z-50 w-full bg-[#0A0F29]/90 backdrop-blur-md border-b border-white/20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-2 sm:gap-4">
            {/* LEFT — LOGO */}
            <Link to="/app" className="flex items-center gap-2 shrink-0">
            <img
                src="https://res.cloudinary.com/di1xpud7d/image/upload/v1767196413/logo_ldoeab.png"
                alt="PetNexus"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
            />
            <span
                className="text-lg sm:text-xl font-extrabold tracking-wide"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
                PetNexus
            </span>
            </Link>

            {/* SEARCH BAR */}
            <div className="flex-1 flex justify-center px-2 w-full md:w-auto order-3 md:order-2">
            {/* Desktop search */}
            <input
                type="text"
                placeholder="Search..."
                className="hidden md:block w-full max-w-md px-4 py-2 rounded-full bg-white/10 text-white placeholder-gray-400 outline-none focus:ring-1 focus:ring-blue-400 transition-colors duration-200"
            />
            {/* Mobile search */}
            <input
                type="text"
                placeholder="Search..."
                className="md:hidden w-full px-4 py-2 rounded-full bg-white/10 text-white placeholder-gray-400 outline-none focus:ring-1 focus:ring-blue-400 transition-colors duration-200"
            />
            </div>

            {/* RIGHT — NAVIGATION */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 ml-auto order-2 md:order-3 w-full md:w-auto justify-center md:justify-end">
            <NavLink
                to="/app"
                end
                className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
            >
                🏠 <span className="hidden sm:inline">Posts</span>
            </NavLink>

            <NavLink
                to="/app/my-adoptions"
                className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
            >
                🐾 <span className="hidden sm:inline">My Adoptions</span>
            </NavLink>

            <NavLink
                to="/app/map"
                className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
            >
                🗺 <span className="hidden sm:inline">Map</span>
            </NavLink>

            <NavLink
                to="/app/chat"
                className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
            >
                💬 <span className="hidden sm:inline">Chat</span>
            </NavLink>

            <NavLink
                to={`/app/profile/${user.id}`}
                className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
            >
                👤 <span className="hidden sm:inline">Profile</span>
            </NavLink>

            <button
                onClick={handleLogout}
                className={`${base} text-red-400 hover:text-red-300 hover:bg-red-500/10`}
            >
                🚪 <span className="hidden sm:inline">Logout</span>
            </button>
            </div>
        </div>
        </nav>
    );
    }
