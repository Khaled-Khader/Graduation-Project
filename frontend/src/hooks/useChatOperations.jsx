import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../Auth/AuthHook";
import { fetchMyVerificationStatus, http } from "../util/http";

/**
 * Custom hook for managing chat operations
 * Handles starting chats, sending messages, and fetching chat data
 */
export function useChatOperations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const isProvider = user?.role === "VET" || user?.role === "CLINIC";

  const { data: verificationStatus } = useQuery({
    queryKey: ["verification-status", user?.id],
    queryFn: fetchMyVerificationStatus,
    enabled: isProvider,
    retry: false,
  });

  const canUseChat = !isProvider || verificationStatus?.verified === true;

  // Fetch user's chats
  const {
    data: chatsData,
    isLoading: chatsLoading,
    error: chatsError,
    refetch: refetchChats,
  } = useQuery({
    queryKey: ["userChats"],
    queryFn: async () => {
      return http("/chat/my-chats?page=0&size=20");
    },
    enabled: !!user && canUseChat,
  });

  // Fetch specific chat with messages
  const {
    data: chatData,
    isLoading: chatLoading,
    error: chatError,
    refetch: refetchChat,
  } = useQuery({
    queryKey: ["chat", selectedChat?.id],
    queryFn: async () => {
      if (!selectedChat?.id) return null;
      return http(`/chat/${selectedChat.id}?page=0&size=50`);
    },
    enabled: !!selectedChat?.id && canUseChat,
  });

  // Start new chat mutation
  const startChatMutation = useMutation({
    mutationFn: async (providerId) => {
      return http("/chat/start", {
        method: "POST",
        body: JSON.stringify({
          providerId: providerId,
        }),
      });
    },
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      setSelectedChat(newChat);
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (payload) => {
      const messagePayload =
        typeof payload === "string" ? { content: payload } : payload;

      return http("/chat/message/send", {
        method: "POST",
        body: JSON.stringify({
          chatId: selectedChat.id,
          content: messagePayload?.content ?? null,
          imageUrl: messagePayload?.imageUrl ?? null,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", selectedChat?.id] });
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      refetchChat();
    },
  });

  // Close chat mutation
  const closeChatMutation = useMutation({
    mutationFn: async (chatId) => {
      await http(`/chat/${chatId}/close`, {
        method: "PUT",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      setSelectedChat(null);
    },
  });

  useEffect(() => {
    if (chatData?.id) {
      queryClient.setQueryData(["userChats"], (previousChats) => {
        if (!previousChats?.content) {
          return previousChats;
        }

        return {
          ...previousChats,
          content: previousChats.content.map((chat) =>
            chat.id === chatData.id
              ? {
                  ...chat,
                  unreadCount: chatData.unreadCount ?? 0,
                  lastMessageAt: chatData.lastMessageAt ?? chat.lastMessageAt,
                }
              : chat
          ),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["chatUnreadCount"] });
    }
  }, [
    chatData?.id,
    chatData?.lastMessageAt,
    chatData?.messages?.length,
    chatData?.unreadCount,
    queryClient,
  ]);

  return {
    chats: chatsData?.content || [],
    chatsLoading,
    chatsError,
    refetchChats,
    selectedChat,
    setSelectedChat,
    currentChat: chatData,
    chatLoading,
    chatError,
    refetchChat,
    chatAccessRestricted: isProvider && verificationStatus && !verificationStatus.verified,
    startChat: startChatMutation.mutate,
    startChatLoading: startChatMutation.isPending,
    sendMessage: sendMessageMutation.mutate,
    sendMessageLoading: sendMessageMutation.isPending,
    closeChat: closeChatMutation.mutate,
    closeChatLoading: closeChatMutation.isPending,
  };
}
