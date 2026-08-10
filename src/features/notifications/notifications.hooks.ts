import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { userApi } from "../../api/user.api";
import type {
  NotificationsParams,
  NotificationsResponse,
  UnreadCountResponse,
} from "../../api/user.api";

export const useNotifications = (params?: NotificationsParams) => {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () =>
      userApi.getNotifications(params).then((response) => response.data),
  });
};

export const useUnreadNotifications = (
  params?: NotificationsParams,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["notifications", "unread", params],
    queryFn: () =>
      userApi
        .getUnreadNotifications(params)
        .then((response) => response.data),
    enabled,
  });
};

export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () =>
      userApi
        .getUnreadNotificationCount()
        .then((response) => response.data.data),
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userApi.markAllNotificationsAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueriesData<
        NotificationsResponse | UnreadCountResponse
      >({ queryKey: ["notifications"] });

      queryClient.setQueriesData(
        { queryKey: ["notifications"] },
        (old) => {
          if (old === undefined) return old;
          if (typeof old === "number") return 0;
          if (typeof old === "object" && old !== null && "unread" in old) {
            return { ...old, unread: 0 };
          }
          const response = old as NotificationsResponse;
          if (!Array.isArray(response.data)) return old;
          return {
            ...response,
            data: response.data.map((notification) =>
              notification.isRead
                ? notification
                : {
                    ...notification,
                    isRead: true,
                    readAt: new Date().toISOString(),
                  },
            ),
          };
        },
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      context?.previous.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.deleteNotification,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueriesData<
        NotificationsResponse | UnreadCountResponse
      >({ queryKey: ["notifications"] });

      const wasUnread = previous.some(([, value]) => {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
          return false;
        }
        const data = (value as NotificationsResponse).data;
        return (
          Array.isArray(data) &&
          data.some((notification) => notification.id === id && !notification.isRead)
        );
      });

      queryClient.setQueriesData(
        { queryKey: ["notifications"] },
        (old) => {
          if (old === undefined) return old;
          if (typeof old === "number") return old;
          if (typeof old === "object" && old !== null && "unread" in old) {
            return {
              ...old,
              unread: Math.max(
                0,
                (old as { unread: number }).unread - (wasUnread ? 1 : 0),
              ),
            };
          }
          const response = old as NotificationsResponse;
          if (!Array.isArray(response.data)) return old;
          return {
            ...response,
            data: response.data.filter(
              (notification) => notification.id !== id,
            ),
            meta: response.meta
              ? { ...response.meta, total: Math.max(0, response.meta.total - 1) }
              : response.meta,
          };
        },
      );

      return { previous };
    },
    onError: (_error, _id, context) => {
      context?.previous.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useNotification = (id: string | undefined) => {
  return useQuery({
    queryKey: ["notifications", id],
    queryFn: () =>
      userApi
        .getNotificationById(id as string)
        .then((response) => response.data),
    enabled: Boolean(id),
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.markNotificationAsRead,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueriesData<
        NotificationsResponse | UnreadCountResponse
      >({ queryKey: ["notifications"] });

      queryClient.setQueriesData(
        { queryKey: ["notifications"] },
        (old) => {
          if (old === undefined) return old;
          if (typeof old === "number") return Math.max(0, old - 1);
          if (typeof old === "object" && old !== null && "unread" in old) {
            return {
              ...old,
              unread: Math.max(0, (old as { unread: number }).unread - 1),
            };
          }
          const response = old as NotificationsResponse;
          if (!Array.isArray(response.data)) return old;
          return {
            ...response,
            data: response.data.map((notification) =>
              notification.id === id
                ? {
                    ...notification,
                    isRead: true,
                    readAt: new Date().toISOString(),
                  }
                : notification,
            ),
          };
        },
      );

      return { previous };
    },
    onError: (_error, _id, context) => {
      context?.previous.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
