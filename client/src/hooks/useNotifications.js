import { useCallback, useEffect, useMemo, useState } from "react";

import {
  dismissNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notification.service";

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Unable to load notifications.";

export const useNotifications = ({ filter = "ALL", limit = 20 } = {}) => {
  const [notifications, setNotifications] = useState([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [pagination, setPagination] = useState({
    hasNextPage: false,
    nextCursor: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);

  const [error, setError] = useState("");

  const loadNotifications = useCallback(
    async ({ reset = true, cursor = null } = {}) => {
      if (reset) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      setError("");

      try {
        const response = await getNotifications({
          filter,
          limit,
          cursor,
        });

        const data = response?.data;

        const newNotifications = data?.notifications ?? [];

        setNotifications((current) =>
          reset ? newNotifications : [...current, ...newNotifications],
        );

        setUnreadCount(data?.unreadCount ?? 0);

        setPagination(
          data?.pagination ?? {
            hasNextPage: false,
            nextCursor: null,
          },
        );
      } catch (error) {
        setError(getErrorMessage(error));

        if (reset) {
          setNotifications([]);
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [filter, limit],
  );

  useEffect(() => {
    loadNotifications({
      reset: true,
    });
  }, [loadNotifications]);

  const markAsRead = useCallback(async (notificationId) => {
    if (!notificationId) {
      return;
    }

    try {
      setIsUpdating(true);

      const response = await markNotificationRead(notificationId);

      const updated = response?.data;

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId
            ? (updated ?? {
                ...notification,
                isRead: true,
                readAt: new Date().toISOString(),
              })
            : notification,
        ),
      );

      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      setIsUpdating(true);
      setError("");

      await markAllNotificationsRead();

      const readAt = new Date().toISOString();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: notification.readAt ?? readAt,
        })),
      );

      setUnreadCount(0);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const dismiss = useCallback(
    async (notificationId) => {
      if (!notificationId) {
        return;
      }

      const existing = notifications.find(
        (notification) => notification._id === notificationId,
      );

      try {
        setIsUpdating(true);
        setError("");

        await dismissNotification(notificationId);

        setNotifications((current) =>
          current.filter((notification) => notification._id !== notificationId),
        );

        if (existing && !existing.isRead) {
          setUnreadCount((current) => Math.max(0, current - 1));
        }
      } catch (error) {
        setError(getErrorMessage(error));
      } finally {
        setIsUpdating(false);
      }
    },
    [notifications],
  );

  const unreadNotifications = useMemo(() => {
    return notifications.filter((notification) => !notification.isRead);
  }, [notifications]);

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    pagination,
    isLoading,
    isLoadingMore,
    isUpdating,
    error,

    markAsRead,
    markAllAsRead,
    dismiss,

    loadMore: () => {
      if (pagination.hasNextPage && pagination.nextCursor) {
        return loadNotifications({
          reset: false,
          cursor: pagination.nextCursor,
        });
      }

      return Promise.resolve();
    },

    refresh: () =>
      loadNotifications({
        reset: true,
      }),
  };
};
