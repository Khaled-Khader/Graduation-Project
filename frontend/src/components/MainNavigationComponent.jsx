import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { fetchMyVerificationStatus, http } from "../util/http";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../Auth/AuthHook";
import { useChatSocket } from "../hooks/useChatSocket";
import { useLogout } from "../hooks/useLogout";
import {
  HouseHeart,
  PawPrint,
  MapPinned,
  MessagesSquare,
  CircleUser,
  LogOut,
  Search,
  Stethoscope,
  Building2,
} from "lucide-react";
import LogoutDialog from "../components/posts/dialogs/LogoutDialog"; // <-- import the dialog
import NotificationBell from "./NotificationBell";
import VerificationBadge from "./VerificationBadge";
import VerificationPromptButton from "./VerificationPromptButton";

export default function MainNavigation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { logout, isPending: isLoggingOut } = useLogout();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [providerSearch, setProviderSearch] = useState("");
  const isProvider = user?.role === "VET" || user?.role === "CLINIC";

  const { data: verificationStatus } = useQuery({
    queryKey: ["verification-status", user?.id],
    queryFn: fetchMyVerificationStatus,
    enabled: isProvider,
    retry: false,
  });

  const providerVerified = !isProvider || verificationStatus?.verified === true;
  const needsProviderVerification = isProvider && verificationStatus && !verificationStatus.verified;

  useChatSocket(providerVerified ? user : null);

  const base =
    "flex items-center gap-2 px-3 py-2 rounded-full transition-all text-sm transform duration-150 ease-out active:scale-95 whitespace-nowrap";
  const active = "bg-white text-[#0A0F29] shadow-md font-semibold";
  const inactive = "text-white/80 hover:text-white hover:bg-white/10";

  const { data: unreadChatCount = 0 } = useQuery({
    queryKey: ["chatUnreadCount"],
    queryFn: () => http("/chat/unread-total"),
    enabled: !!user && providerVerified,
  });

  const trimmedProviderSearch = providerSearch.trim();
  const { data: providerResults, isFetching: isSearchingProviders } = useQuery({
    queryKey: ["providerSearch", trimmedProviderSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        query: trimmedProviderSearch,
        page: "0",
        size: "8",
      });
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/user-profile/providers/search?${params.toString()}`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to search providers");
      }

      return res.json();
    },
    enabled: trimmedProviderSearch.length > 0 && !!user,
  });

  const providers = providerResults?.content || [];

  function openProviderProfile(providerId) {
    setProviderSearch("");
    navigate(`/app/profile/${providerId}`);
  }

  function handleSearchKeyDown(event) {
    if (event.key === "Enter" && providers[0]) {
      openProviderProfile(providers[0].id);
    }
  }

  function handleLogoutClick() {
    setShowLogoutDialog(true);
  }

  function handleConfirmLogout() {
    setShowLogoutDialog(false);
    logout();
  }

  return (
    <>
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
          <div className="relative flex-1 flex justify-center px-2 w-full md:w-auto order-3 md:order-2">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Search vets and clinics..."
                value={providerSearch}
                onChange={(event) => setProviderSearch(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-white/10 text-white placeholder-gray-400 outline-none focus:ring-1 focus:ring-blue-400 transition-colors duration-200"
              />

              {trimmedProviderSearch && (
                <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-xl border border-white/15 bg-[#0A0F29] shadow-2xl">
                  {isSearchingProviders ? (
                    <div className="px-4 py-3 text-sm text-white/70">
                      Searching...
                    </div>
                  ) : providers.length > 0 ? (
                    providers.map((provider) => {
                      const name = `${provider.firstName || ""} ${
                        provider.lastName || ""
                      }`.trim();
                      const isClinic = provider.role === "CLINIC";

                      return (
                        <button
                          key={provider.id}
                          type="button"
                          onClick={() => openProviderProfile(provider.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 transition"
                        >
                          {provider.photoUrl ? (
                            <img
                              src={provider.photoUrl}
                              alt={name || provider.role}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                              {isClinic ? (
                                <Building2 className="w-5 h-5 text-green-300" />
                              ) : (
                                <Stethoscope className="w-5 h-5 text-blue-300" />
                              )}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex min-w-0 items-center gap-2">
                              <p className="truncate text-sm font-semibold text-white">
                                {name || (isClinic ? "Clinic" : "Veterinarian")}
                              </p>
                              {provider.verified && <VerificationBadge compact />}
                            </div>
                            <p className="text-xs text-white/60 truncate">
                              {isClinic
                                ? provider.city || "Clinic"
                                : provider.specialty || "Veterinarian"}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-4 py-3 text-sm text-white/70">
                      No vets or clinics found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — NAVIGATION */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 ml-auto order-2 md:order-3 w-full md:w-auto justify-center md:justify-end">
            <NavLink
              to="/app"
              end
              className={({ isActive }) =>
                `${base} ${isActive ? active : inactive}`
              }
            >
              <HouseHeart />
              <span className="hidden sm:inline">Posts</span>
            </NavLink>

            <NavLink
              to="/app/my-adoptions"
              className={({ isActive }) =>
                `${base} ${isActive ? active : inactive}`
              }
            >
              <PawPrint />{" "}
              <span className="hidden sm:inline">My Adoptions</span>
            </NavLink>

            {user?.role === "CLINIC" && providerVerified ? (
              <NavLink
                to="/app/map"
                className={({ isActive }) =>
                  `${base} ${isActive ? active : inactive}`
                }
              >
                <MapPinned />{" "}
                <span className="hidden sm:inline">Set Clinic Location</span>
              </NavLink>
            ) : (
              <NavLink
                to="/app/nearby-clinics"
                className={({ isActive }) =>
                  `${base} ${isActive ? active : inactive}`
                }
              >
                <MapPinned />{" "}
                <span className="hidden sm:inline">Nearby Clinics</span>
              </NavLink>
            )}

            {providerVerified && (
              <NavLink
                to="/app/chat"
                className={({ isActive }) =>
                  `${base} ${isActive ? active : inactive}`
                }
              >
                <span className="relative inline-flex">
                  <MessagesSquare />
                  {unreadChatCount > 0 && (
                    <span className="absolute -right-2 -top-2 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] leading-5 text-center font-bold shadow-md">
                      {unreadChatCount > 99 ? "99+" : unreadChatCount}
                    </span>
                  )}
                </span>
                <span className="hidden sm:inline">Chat</span>
              </NavLink>
            )}

            {needsProviderVerification && (
              <VerificationPromptButton compact />
            )}

            <NotificationBell userId={user?.id} />

            <NavLink
              to={`/app/profile/${user.id}`}
              className={({ isActive }) =>
                `${base} ${isActive ? active : inactive}`
              }
            >
              <CircleUser /> <span className="hidden sm:inline">Profile</span>
            </NavLink>

            <button
              onClick={handleLogoutClick}
              className={`${base} text-red-400 hover:text-red-300 hover:bg-red-500/10`}
            >
              <LogOut />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* LOGOUT CONFIRMATION DIALOG */}
      <LogoutDialog
        open={showLogoutDialog}
        onCancel={() => setShowLogoutDialog(false)}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
      />
    </>
  );
}
