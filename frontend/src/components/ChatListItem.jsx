import { MessageCircle } from "lucide-react";
import { useAuth } from "../Auth/AuthHook";

export default function ChatListItem({ chat, isSelected, onSelect }) {
  const { user } = useAuth();
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
      className={`w-full rounded-xl border p-3 text-left transition ${
        isSelected
          ? "bg-[#6B8CFF]/20 border-[#6B8CFF]/50"
          : "bg-[#1a2452] border-[#6B8CFF]/25 hover:bg-[#1a2452]/80 hover:border-[#6B8CFF]/40"
      }`}
    >
      <div className="flex items-center gap-3">
        {otherUser?.image ? (
          <img
            src={otherUser.image}
            alt={otherUser.name}
            className="w-11 h-11 rounded-full object-cover"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-[#6B8CFF]/30 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-6 h-6 text-[#6B8CFF]" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="text-sm text-[#E6ECFF] font-semibold truncate">
              {otherUser?.name}
            </h3>
            {chat.lastMessageAt && (
              <span className="text-xs text-[#9AA6E8] flex-shrink-0 ml-2">
                {new Date(chat.lastMessageAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <p className="text-xs text-[#9AA6E8] mt-1">{otherUser?.role}</p>
        </div>
      </div>
    </button>
  );
}
