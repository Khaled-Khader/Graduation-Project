import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import { useQueryClient } from "@tanstack/react-query";

function getWebSocketUrl() {
  return `${import.meta.env.VITE_API_URL.replace(/^http/, "ws")}/ws`;
}

export function useChatSocket(user) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    const client = new Client({
      brokerURL: getWebSocketUrl(),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        client.subscribe(`/topic/users/${user.id}/chats`, (message) => {
          const event = JSON.parse(message.body);

          if (typeof event.unreadCount === "number") {
            queryClient.setQueryData(["chatUnreadCount"], event.unreadCount);
          }

          if (event.type === "MESSAGE" || event.type === "CHAT_STARTED") {
            queryClient.invalidateQueries({ queryKey: ["userChats"] });
          }

          if (event.chatId) {
            queryClient.invalidateQueries({
              queryKey: ["chat", event.chatId],
              exact: true,
            });
          }
        });
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [queryClient, user?.id]);
}
