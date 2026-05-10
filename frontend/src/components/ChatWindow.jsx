import { useEffect, useMemo, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useAuth } from "../Auth/AuthHook";
import { decryptChatMessage, encryptChatMessage } from "../util/chatCrypto";

export default function ChatWindow({
  chat,
  currentChat,
  chatLoading,
  sendMessage,
  sendMessageLoading,
  onClose,
}) {
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState("");
  const [visibleMessages, setVisibleMessages] = useState([]);
  const [sendError, setSendError] = useState("");

  const activeChat = currentChat || chat;

  useEffect(() => {
    let cancelled = false;

    async function decryptMessages() {
      const messages = activeChat?.messages || [];
      const decryptedMessages = await Promise.all(
        messages.map(async (message) => ({
          ...message,
          decryptedContent: await decryptChatMessage(activeChat, message.content),
        }))
      );

      if (!cancelled) {
        setVisibleMessages(decryptedMessages);
      }
    }

    decryptMessages();

    return () => {
      cancelled = true;
    };
  }, [activeChat]);

  const otherUser = useMemo(
    () =>
      user?.role === "OWNER"
        ? {
            id: activeChat?.providerId,
            name: activeChat?.providerName,
            image: activeChat?.providerProfileImage,
            role: activeChat?.providerRole,
          }
        : {
            id: activeChat?.ownerId,
            name: activeChat?.ownerName,
            image: activeChat?.ownerProfileImage,
            role: "Pet Owner",
          },
    [activeChat, user?.role]
  );

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmedMessage = messageInput.trim();
    if (!trimmedMessage || !activeChat?.isActive) {
      return;
    }

    try {
      setSendError("");
      const encryptedMessage = await encryptChatMessage(activeChat, trimmedMessage);
      sendMessage(encryptedMessage, {
        onSuccess: () => setMessageInput(""),
        onError: (error) =>
          setSendError(error?.message || "Failed to send message"),
      });
    } catch {
      setSendError("Could not encrypt this message");
    }
  };

  if (chatLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#B8C4FF]">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0F1538] rounded-2xl border border-[#6B8CFF]/25">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#6B8CFF]/25">
        <div className="flex items-center gap-3">
          {otherUser?.image ? (
            <img
              src={otherUser.image}
              alt={otherUser.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#6B8CFF]/30 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-[#6B8CFF]" />
            </div>
          )}
          <div>
            <h3 className="text-[#E6ECFF] font-semibold">{otherUser?.name}</h3>
            <p className="text-xs text-[#9AA6E8]">
              {otherUser?.role}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-[#6B8CFF]/10 rounded-lg transition"
        >
          <X className="w-5 h-5 text-[#B8C4FF]" />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {visibleMessages.length > 0 ? (
          visibleMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === user?.id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${
                  message.senderId === user?.id
                    ? "bg-[#6B8CFF] text-white"
                    : "bg-[#1a2452] text-[#E6ECFF] border border-[#6B8CFF]/25"
                }`}
              >
                <p className="break-words">{message.decryptedContent}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.senderId === user?.id
                      ? "text-blue-200"
                      : "text-[#9AA6E8]"
                  }`}
                >
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#9AA6E8] text-sm">No messages yet</p>
          </div>
        )}
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-[#6B8CFF]/25"
      >
        {!activeChat?.isActive && (
          <p className="text-sm text-[#9AA6E8] mb-3">
            This chat is closed.
          </p>
        )}
        {sendError && (
          <p className="text-sm text-red-300 mb-3">{sendError}</p>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[#1a2452] border border-[#6B8CFF]/25 rounded-xl px-4 py-2 text-[#E6ECFF] placeholder-[#9AA6E8] focus:outline-none focus:border-[#6B8CFF]/50 transition"
            disabled={sendMessageLoading || !activeChat?.isActive}
          />
          <button
            type="submit"
            disabled={
              sendMessageLoading || !messageInput.trim() || !activeChat?.isActive
            }
            className="bg-[#6B8CFF] hover:bg-[#6B8CFF]/80 text-white rounded-xl p-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
