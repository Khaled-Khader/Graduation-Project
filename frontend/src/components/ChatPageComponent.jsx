import { useEffect, useState } from "react";
import { MessageCircle, Search, ShieldCheck } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useChatOperations } from "../hooks/useChatOperations";
import { useAuth } from "../Auth/AuthHook";
import ChatListItem from "./ChatListItem";
import ChatWindow from "./ChatWindow";

export default function ChatPageComponent() {
  const {
    chats,
    chatsLoading,
    selectedChat,
    setSelectedChat,
    currentChat,
    chatLoading,
    chatAccessRestricted,
    sendMessage,
    sendMessageLoading,
  } = useChatOperations();

  const { user } = useAuth();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const isConversationOpen = Boolean(selectedChat);

  useEffect(() => {
    const chatId = location.state?.chatId;
    if (!chatId || selectedChat?.id === chatId) {
      return;
    }

    const chatFromRoute = chats.find((chat) => chat.id === chatId);
    if (chatFromRoute) {
      setSelectedChat(chatFromRoute);
    }
  }, [chats, location.state, selectedChat?.id, setSelectedChat]);

  const filteredChats = chats.filter((chat) => {
    const otherUserName =
      user?.role === "OWNER" ? chat.providerName : chat.ownerName;
    return (otherUserName || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full">
      {chatAccessRestricted ? (
        <div className="rounded-2xl border border-amber-300/30 bg-amber-400/10 p-6 text-amber-100">
          <h1 className="text-xl font-bold">Verification required</h1>
          <p className="mt-2 text-sm text-amber-50/80">
            Chat unlocks after an admin approves your provider verification.
          </p>
        </div>
      ) : (
      <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-[#E6ECFF] sm:text-3xl">
            <MessageCircle className="h-7 w-7 text-[#6B8CFF]" />
            My Chats
          </h1>
          <p className="mt-1 text-sm text-[#B8C4FF]">
            Private conversations with veterinarians and clinics.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
          <ShieldCheck className="h-4 w-4" />
          End-to-end encrypted
        </div>
      </div>

      <div className="grid h-[calc(100dvh-11rem)] min-h-[560px] grid-cols-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside
          className={`min-h-0 flex-col rounded-2xl border border-[#6B8CFF]/25 bg-[#0F1538] ${
            isConversationOpen ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="border-b border-[#6B8CFF]/20 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9AA6E8]" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-xl border border-[#6B8CFF]/25 bg-[#1a2452] py-2.5 pl-10 pr-4 text-sm text-[#E6ECFF] placeholder-[#9AA6E8] outline-none transition focus:border-[#6B8CFF]/60"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {chatsLoading ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-[#9AA6E8]">Loading chats...</p>
              </div>
            ) : filteredChats.length > 0 ? (
              <div className="space-y-2">
                {filteredChats.map((chat) => (
                  <ChatListItem
                    key={chat.id}
                    chat={chat}
                    isSelected={selectedChat?.id === chat.id}
                    onSelect={() => setSelectedChat(chat)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center px-6">
                <div className="text-center">
                  <MessageCircle className="mx-auto mb-3 h-12 w-12 text-[#6B8CFF]/50" />
                  <p className="text-sm text-[#9AA6E8]">
                    {chats.length === 0 ? "No chats yet" : "No matching chats"}
                  </p>
                  {chats.length === 0 && (
                    <p className="mt-2 text-xs text-[#7F8FE0]">
                      Visit a veterinarian or clinic profile to start a private
                      chat.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>

        <section
          className={`min-h-0 ${
            isConversationOpen ? "block" : "hidden lg:block"
          }`}
        >
          {selectedChat ? (
            <ChatWindow
              chat={selectedChat}
              currentChat={currentChat}
              chatLoading={chatLoading}
              sendMessage={sendMessage}
              sendMessageLoading={sendMessageLoading}
              onClose={() => setSelectedChat(null)}
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-[#6B8CFF]/25 bg-[#0F1538] p-6">
              <div className="text-center">
                <MessageCircle className="mx-auto mb-4 h-16 w-16 text-[#6B8CFF]/50" />
                <h3 className="mb-2 font-semibold text-[#E6ECFF]">
                  No Chat Selected
                </h3>
                <p className="text-sm text-[#9AA6E8]">
                  Select a chat to start messaging.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
      </>
      )}
    </div>
  );
}
