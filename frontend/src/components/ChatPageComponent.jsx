import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
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
    sendMessage,
    sendMessageLoading,
  } = useChatOperations();

  const { user } = useAuth();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

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
    <div className="min-h-screen bg-gradient-to-b from-[#0F1538] via-[#1a2452] to-[#0F1538] pt-24 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#E6ECFF] mb-2 flex items-center gap-3">
            <MessageCircle className="w-10 h-10 text-[#6B8CFF]" />
            My Chats
          </h1>
          <p className="text-[#B8C4FF]">
            Communicate directly with veterinarians and clinics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat List */}
          <div className="lg:col-span-1">
            <div className="bg-[#0F1538] rounded-2xl border border-[#6B8CFF]/25 p-6 h-[600px] flex flex-col">
              {/* Search Bar */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1a2452] border border-[#6B8CFF]/25 rounded-xl px-4 py-2 text-[#E6ECFF] placeholder-[#9AA6E8] focus:outline-none focus:border-[#6B8CFF]/50 transition text-sm"
                />
              </div>

              {/* Chats List */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {chatsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-[#9AA6E8]">Loading chats...</p>
                  </div>
                ) : filteredChats.length > 0 ? (
                  filteredChats.map((chat) => (
                    <ChatListItem
                      key={chat.id}
                      chat={chat}
                      isSelected={selectedChat?.id === chat.id}
                      onSelect={() => setSelectedChat(chat)}
                    />
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageCircle className="w-12 h-12 text-[#6B8CFF]/50 mx-auto mb-2" />
                      <p className="text-[#9AA6E8] text-sm">
                        {chats.length === 0
                          ? "No chats yet"
                          : "No matching chats"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2">
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
              <div className="bg-[#0F1538] rounded-2xl border border-[#6B8CFF]/25 p-6 h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-[#6B8CFF]/50 mx-auto mb-4" />
                  <h3 className="text-[#E6ECFF] font-semibold mb-2">
                    No Chat Selected
                  </h3>
                  <p className="text-[#9AA6E8] text-sm">
                    Select a chat to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Note: Chat button on vet/clinic profiles */}
        <div className="mt-8 bg-[#1a2452] border border-[#6B8CFF]/25 rounded-2xl p-6">
          <h3 className="text-[#E6ECFF] font-semibold mb-2">
            💡 Start a New Chat
          </h3>
          <p className="text-[#B8C4FF] text-sm">
            Visit a veterinarian or clinic profile to start a new conversation.
            Look for the Chat button on their profile.
          </p>
        </div>
      </div>
    </div>
  );
}
