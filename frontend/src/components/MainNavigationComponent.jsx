    import { NavLink, useNavigate } from "react-router-dom";
    import { LogoutFetchData } from "../util/http";
    import { useMutation,useQueryClient } from "@tanstack/react-query";
    import { useAuth } from "../Auth/AuthHook";
    export default function MainNavigation() {
    const {user}=useAuth()
    const navigate = useNavigate();
    const queryClient=useQueryClient()
    const base =
        "flex items-center gap-2 px-3 py-2 rounded-full transition-all text-sm";

    const active =
        "bg-white text-[#0A0F29] shadow-md font-semibold";

    const inactive =
        "text-white/80 hover:text-white hover:bg-white/10";

        const { mutate: logout, isPending } = useMutation({
    mutationFn: LogoutFetchData,

    onSuccess: async () => {
    
    await queryClient.cancelQueries();

    
    queryClient.setQueryData(["user"], null);

    
    queryClient.clear();

    
    await Promise.resolve();

    
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
        <nav
        className="
            sticky top-0 z-50
            w-full
            bg-[#0A0F29]/90
            backdrop-blur-md
            border-b border-white/20
        "
        >
        <div
            className="
            max-w-[1600px]
            mx-auto
            px-4 sm:px-6
            py-3
            flex items-center gap-4
            "
        >
            {/* LEFT — LOGO */}
            <div className="flex items-center gap-2 shrink-0">
            <img
                src="/logo.png"
                alt="PetNexus"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
            />
            <span
                className="text-lg sm:text-xl font-extrabold tracking-wide"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
                PetNexus
            </span>
            </div>

            {/* CENTER — SEARCH BAR (DESKTOP) */}
            <div className="hidden md:flex flex-1 justify-center px-6">
            <input
                type="text"
                placeholder="Search..."
                className="
                w-full max-w-md
                px-4 py-2
                rounded-full
                bg-white/10
                text-white
                placeholder-gray-400
                outline-none
                focus:ring-1 focus:ring-blue-400
                "
            />
            </div>

            {/* RIGHT — NAVIGATION */}
            <div className="flex items-center gap-1 sm:gap-2 ml-auto">
            <NavLink
                to="/app"
                end
                className={({ isActive }) =>
                `${base} ${isActive ? active : inactive}`
                }
            >
                🏠 <span className="hidden sm:inline">Posts</span>
            </NavLink>

            <NavLink
                to="/app/map"
                className={({ isActive }) =>
                `${base} ${isActive ? active : inactive}`
                }
            >
                🗺 <span className="hidden sm:inline">Map</span>
            </NavLink>

            <NavLink
                to="/app/chat"
                className={({ isActive }) =>
                `${base} ${isActive ? active : inactive}`
                }
            >
                💬 <span className="hidden sm:inline">Chat</span>
            </NavLink>

            <NavLink
                to={`/app/profile/${user.id}`}
                className={({ isActive }) =>
                `${base} ${isActive ? active : inactive}`
                }
            >
                👤 <span className="hidden sm:inline">Profile</span>
            </NavLink>

            {/* LOGOUT */}
            <button
                onClick={handleLogout}
                className={`
                ${base}
                text-red-400
                hover:text-red-300
                hover:bg-red-500/10
                `}
            >
                🚪 <span className="hidden sm:inline">Logout</span>
            </button>
            </div>
        </div>

        {/* MOBILE SEARCH */}
        <div className="md:hidden px-4 pb-3">
            <input
            type="text"
            placeholder="Search..."
            className="
                w-full
                px-4 py-2
                rounded-full
                bg-white/10
                text-white
                placeholder-gray-400
                outline-none
                focus:ring-1 focus:ring-blue-400
            "
            />
        </div>
        </nav>
    );
    }
