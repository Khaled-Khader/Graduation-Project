import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  LockKeyhole,
  MessageCircle,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import { useAuth } from "../Auth/AuthHook";
import { decryptChatMessage, encryptChatMessage } from "../util/chatCrypto";
import { uploadChatImage } from "../util/http";
import VerificationBadge from "./VerificationBadge";

export default function ChatWindow({
  chat,
  currentChat,
  chatLoading,
  sendMessage,
  sendMessageLoading,
  onClose,
}) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [messageInput, setMessageInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [visibleMessages, setVisibleMessages] = useState([]);
  const [sendError, setSendError] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const activeChat = currentChat || chat;
  const isSending = sendMessageLoading || isUploadingImage;

  useEffect(() => {
    let cancelled = false;

    async function decryptMessages() {
      const messages = activeChat?.messages || [];
      const decryptedMessages = await Promise.all(
        messages.map(async (message) => ({
          ...message,
          decryptedContent: message.content
            ? await decryptChatMessage(activeChat, message.content)
            : "",
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

  useEffect(() => {
    if (!selectedImage) {
      setImagePreviewUrl("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(selectedImage);
    setImagePreviewUrl(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedImage]);

  const otherUser = useMemo(
    () =>
      user?.role === "OWNER"
        ? {
            id: activeChat?.providerId,
            name: activeChat?.providerName,
            image: activeChat?.providerProfileImage,
            role: activeChat?.providerRole,
            verified: activeChat?.providerVerified,
          }
        : {
            id: activeChat?.ownerId,
            name: activeChat?.ownerName,
            image: activeChat?.ownerProfileImage,
            role: "Pet Owner",
          },
    [activeChat, user?.role]
  );

  function clearSelectedImage() {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSelectImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSendError("Please choose an image file.");
      clearSelectedImage();
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setSendError("Image must be smaller than 8MB.");
      clearSelectedImage();
      return;
    }

    setSendError("");
    setSelectedImage(file);
  }

  const handleSendMessage = async (event) => {
    event.preventDefault();

    const trimmedMessage = messageInput.trim();
    if ((!trimmedMessage && !selectedImage) || !activeChat?.isActive) {
      return;
    }

    try {
      setSendError("");
      const payload = {};

      if (trimmedMessage) {
        payload.content = await encryptChatMessage(activeChat, trimmedMessage);
      }

      if (selectedImage) {
        setIsUploadingImage(true);
        const uploadResult = await uploadChatImage(activeChat.id, selectedImage);
        payload.imageUrl = uploadResult.imageUrl;
      }

      sendMessage(payload, {
        onSuccess: () => {
          setMessageInput("");
          clearSelectedImage();
        },
        onError: (error) =>
          setSendError(error?.message || "Failed to send message"),
      });
    } catch (error) {
      setSendError(error?.message || "Could not send this message");
    } finally {
      setIsUploadingImage(false);
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
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="truncate font-semibold text-[#E6ECFF]">
                {otherUser?.name || "Chat"}
              </h3>
              {otherUser?.verified && <VerificationBadge compact />}
            </div>
            <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-2">
              <span className="text-xs text-[#9AA6E8]">{otherUser?.role}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-200">
                <LockKeyhole className="h-3 w-3" />
                Text encrypted
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
          Text is encrypted on this device before sending.
        </div>

        {visibleMessages.length > 0 ? (
          <div className="space-y-3">
            {visibleMessages.map((message) => {
              const isMine = message.senderId === user?.id;
              const hasImage = Boolean(message.imageUrl);
              const hasText = Boolean(message.decryptedContent);

              return (
                <div
                  key={message.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[86%] rounded-2xl p-2 shadow-sm sm:max-w-[70%] ${
                      isMine
                        ? "rounded-br-md bg-[#6B8CFF] text-white"
                        : "rounded-bl-md border border-[#6B8CFF]/25 bg-[#1a2452] text-[#E6ECFF]"
                    }`}
                  >
                    {hasImage && (
                      <a
                        href={message.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block overflow-hidden rounded-xl bg-black/20"
                      >
                        <img
                          src={message.imageUrl}
                          alt="Chat attachment"
                          loading="lazy"
                          className="max-h-[360px] w-full min-w-[180px] max-w-[360px] rounded-xl object-contain"
                        />
                      </a>
                    )}

                    {hasText && (
                      <p
                        className={`whitespace-pre-wrap break-words text-sm leading-relaxed ${
                          hasImage ? "px-2 pt-2" : "px-2 py-0.5"
                        }`}
                      >
                        {message.decryptedContent}
                      </p>
                    )}

                    <p
                      className={`px-2 pb-0.5 pt-1 text-right text-[11px] ${
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

        {imagePreviewUrl && (
          <div className="mb-3 inline-flex max-w-full items-start gap-2 rounded-xl border border-[#6B8CFF]/25 bg-[#1a2452] p-2">
            <img
              src={imagePreviewUrl}
              alt="Selected attachment"
              className="h-20 w-20 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#E6ECFF]">
                {selectedImage?.name}
              </p>
              <p className="text-xs text-[#9AA6E8]">
                {selectedImage ? `${Math.ceil(selectedImage.size / 1024)} KB` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={clearSelectedImage}
              disabled={isSending}
              className="rounded-lg p-1.5 text-[#B8C4FF] transition hover:bg-white/10"
              aria-label="Remove selected image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleSelectImage}
            disabled={isSending || !activeChat?.isActive}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending || !activeChat?.isActive}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#6B8CFF]/25 bg-[#1a2452] text-[#B8C4FF] transition hover:border-[#6B8CFF]/50 hover:bg-[#22306b] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Attach image"
          >
            <ImagePlus className="h-5 w-5" />
          </button>

          <textarea
            rows={1}
            value={messageInput}
            onChange={(event) => setMessageInput(event.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder={selectedImage ? "Add a caption..." : "Type a message..."}
            className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-[#6B8CFF]/25 bg-[#1a2452] px-4 py-2.5 text-sm text-[#E6ECFF] placeholder-[#9AA6E8] outline-none transition focus:border-[#6B8CFF]/60"
            disabled={isSending || !activeChat?.isActive}
          />
          <button
            type="submit"
            disabled={
              isSending ||
              (!messageInput.trim() && !selectedImage) ||
              !activeChat?.isActive
            }
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6B8CFF] text-white transition hover:bg-[#6B8CFF]/80 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
