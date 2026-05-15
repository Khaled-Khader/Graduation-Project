import { MessageCircle } from "lucide-react";
import { useAuth } from "../Auth/AuthHook";

export default function ChatListItem({ chat, isSelected, onSelect }) {
  const { user } = useAuth();
  const unreadCount = Number(chat.unreadCount || 0);
  const hasUnread = unreadCount > 0;
  const otherUser =
    user?.role === "OWNER"
      ? {
          name: chat.providerName,
          image: chat.providerProfileImage,
          role: chat.providerRole,
        }
      : {
          name: chat.ownerName,
          image: chat.ownerProfileImage,
        };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative w-full rounded-xl border p-3 text-left transition ${
        isSelected
          ? "bg-[#6B8CFF]/20 border-[#6B8CFF]/50"
          : hasUnread
            ? "bg-[#241f4a] border-red-400/40 hover:bg-[#2b2557] hover:border-red-400/60"
            : "bg-[#1a2452] border-[#6B8CFF]/25 hover:bg-[#1a2452]/80 hover:border-[#6B8CFF]/40"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          {otherUser?.image ? (
            <img
              src={otherUser.image}
              alt={otherUser.name}
              className="w-11 h-11 rounded-full object-cover"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-[#6B8CFF]/30 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-[#6B8CFF]" />
            </div>
          )}

          {hasUnread && (
            <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#0F1538] bg-red-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h3
              className={`text-sm font-semibold truncate ${
                hasUnread ? "text-white" : "text-[#E6ECFF]"
              }`}
            >
              {otherUser?.name}
            </h3>
            <div className="flex shrink-0 items-center gap-2">
              {hasUnread && (
                <span className="min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[11px] font-bold leading-none text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
              {chat.lastMessageAt && (
                <span className="text-xs text-[#9AA6E8]">
                  {new Date(chat.lastMessageAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <p className={`text-xs mt-1 ${hasUnread ? "text-red-100" : "text-[#9AA6E8]"}`}>
            {hasUnread ? "New messages" : otherUser?.role}
          </p>
        </div>
      </div>
    </button>
  );
}
