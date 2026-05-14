import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  LockKeyhole,
  MessageCircle,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
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
  const messagesEndRef = useRef(null);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: visibleMessages.length > 1 ? "smooth" : "auto",
      block: "end",
    });
  }, [visibleMessages.length, activeChat?.id]);

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

  const handleSendMessage = async (event) => {
    event.preventDefault();
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

  function handleComposerKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  if (chatLoading) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-[#6B8CFF]/25 bg-[#0F1538]">
        <div className="text-sm text-[#B8C4FF]">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[#6B8CFF]/25 bg-[#0F1538]">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#6B8CFF]/25 px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#B8C4FF] transition hover:bg-[#6B8CFF]/10 lg:hidden"
            aria-label="Back to chats"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {otherUser?.image ? (
            <img
              src={otherUser.image}
              alt={otherUser.name}
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6B8CFF]/30">
              <MessageCircle className="h-6 w-6 text-[#6B8CFF]" />
            </div>
          )}

          <div className="min-w-0">
            <h3 className="truncate font-semibold text-[#E6ECFF]">
              {otherUser?.name || "Chat"}
            </h3>
            <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-2">
              <span className="text-xs text-[#9AA6E8]">{otherUser?.role}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-200">
                <LockKeyhole className="h-3 w-3" />
                E2E encrypted
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="hidden rounded-lg p-2 text-[#B8C4FF] transition hover:bg-[#6B8CFF]/10 lg:block"
          aria-label="Close chat"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5">
        <div className="mx-auto mb-5 flex max-w-md items-center justify-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-center text-xs text-emerald-100">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          Messages are encrypted on this device before sending.
        </div>

        {visibleMessages.length > 0 ? (
          <div className="space-y-3">
            {visibleMessages.map((message) => {
              const isMine = message.senderId === user?.id;

              return (
                <div
                  key={message.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-2.5 shadow-sm sm:max-w-[68%] ${
                      isMine
                        ? "rounded-br-md bg-[#6B8CFF] text-white"
                        : "rounded-bl-md border border-[#6B8CFF]/25 bg-[#1a2452] text-[#E6ECFF]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                      {message.decryptedContent}
                    </p>
                    <p
                      className={`mt-1 text-right text-[11px] ${
                        isMine ? "text-blue-100" : "text-[#9AA6E8]"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex h-[60%] items-center justify-center">
            <div className="text-center">
              <MessageCircle className="mx-auto mb-3 h-12 w-12 text-[#6B8CFF]/45" />
              <p className="text-sm text-[#9AA6E8]">No messages yet</p>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSendMessage}
        className="shrink-0 border-t border-[#6B8CFF]/25 bg-[#0F1538] p-3 sm:p-4"
      >
        {!activeChat?.isActive && (
          <p className="mb-3 text-sm text-[#9AA6E8]">This chat is closed.</p>
        )}
        {sendError && <p className="mb-3 text-sm text-red-300">{sendError}</p>}

        <div className="flex items-end gap-2">
          <textarea
            rows={1}
            value={messageInput}
            onChange={(event) => setMessageInput(event.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder="Type a message..."
            className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-[#6B8CFF]/25 bg-[#1a2452] px-4 py-2.5 text-sm text-[#E6ECFF] placeholder-[#9AA6E8] outline-none transition focus:border-[#6B8CFF]/60"
            disabled={sendMessageLoading || !activeChat?.isActive}
          />
          <button
            type="submit"
            disabled={
              sendMessageLoading || !messageInput.trim() || !activeChat?.isActive
            }
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6B8CFF] text-white transition hover:bg-[#6B8CFF]/80 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
