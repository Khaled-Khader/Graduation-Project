import {
  useCallback,
  useEffect,
} from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Client } from "@stomp/stompjs";
import {
  fetchNotifications,
  fetchUnreadNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  normalizeNotification,
} from "../api/notificationApi";

function getWebSocketUrl() {
  const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
  return `${apiUrl.replace(/^http/, "ws")}/ws`;
}

function byNewestCreatedAt(first, second) {
  const firstTime = new Date(first.createdAt || 0).getTime();
  const secondTime = new Date(second.createdAt || 0).getTime();
  return secondTime - firstTime;
}

function mergeNotifications(...groups) {
  const byId = new Map();

  groups.flat().forEach((notification) => {
    if (!notification) {
      return;
    }

    const key = notification.id ?? `${notification.type}-${notification.createdAt}`;
    byId.set(key, notification);
  });

  return Array.from(byId.values()).sort(byNewestCreatedAt);
}

export function useNotifications() {
  const queryClient = useQueryClient();

  const notificationsQuery = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam = 0 }) => fetchNotifications(pageParam),
    initialPageParam: 0,
    refetchInterval: 10000,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.last) {
        return undefined;
      }

      return (lastPage.number ?? 0) + 1;
    },
  });

  const unreadQuery = useQuery({
    queryKey: ["unreadNotifications"],
    queryFn: fetchUnreadNotifications,
    refetchInterval: 10000,
  });

  const unreadCountQuery = useQuery({
    queryKey: ["notificationUnreadCount"],
    queryFn: getUnreadNotificationCount,
    refetchInterval: 10000,
  });

  const refreshNotifications = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
    queryClient.invalidateQueries({ queryKey: ["notificationUnreadCount"] });
  }, [queryClient]);

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: refreshNotifications,
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: refreshNotifications,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: refreshNotifications,
  });

  const notifications =
    notificationsQuery.data?.pages.flatMap((page) => page.content || []) || [];
  const unreadNotifications = unreadQuery.data || [];
  const mergedNotifications = mergeNotifications(unreadNotifications, notifications);
  const queryError =
    notificationsQuery.error ||
    unreadQuery.error ||
    unreadCountQuery.error;

  return {
    notifications: mergedNotifications,
    unreadNotifications,
    unreadCount: unreadCountQuery.data || 0,
    loading:
      notificationsQuery.isLoading ||
      unreadQuery.isLoading ||
      unreadCountQuery.isLoading,
    error:
      (mergedNotifications.length === 0 ? queryError : null) ||
      markReadMutation.error ||
      markAllReadMutation.error ||
      deleteMutation.error,
    hasMore: notificationsQuery.hasNextPage,
    loadNotifications: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    loadUnreadNotifications: () =>
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] }),
    loadUnreadCount: () =>
      queryClient.invalidateQueries({ queryKey: ["notificationUnreadCount"] }),
    handleMarkAsRead: (notificationId) => markReadMutation.mutate(notificationId),
    handleMarkAllAsRead: () => markAllReadMutation.mutate(),
    handleDeleteNotification: (notificationId) => deleteMutation.mutate(notificationId),
    loadMore: () => notificationsQuery.fetchNextPage(),
  };
}

export function useNotificationSocket(userId) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    const client = new Client({
      brokerURL: getWebSocketUrl(),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        client.subscribe(`/topic/users/${userId}/notifications`, (message) => {
          const notification = normalizeNotification(JSON.parse(message.body));

          queryClient.setQueryData(["notificationUnreadCount"], (count = 0) => Number(count) + 1);
          queryClient.setQueryData(["unreadNotifications"], (current = []) => [
            notification,
            ...current.filter((item) => item.id !== notification.id),
          ]);
          queryClient.setQueryData(["notifications"], (current) => {
            if (!current?.pages?.length) {
              return current;
            }

            const [firstPage, ...remainingPages] = current.pages;

            return {
              ...current,
              pages: [
                {
                  ...firstPage,
                  content: [
                    notification,
                    ...(firstPage.content || []).filter((item) => item.id !== notification.id),
                  ],
                },
                ...remainingPages,
              ],
            };
          });
        });
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [queryClient, userId]);
}
