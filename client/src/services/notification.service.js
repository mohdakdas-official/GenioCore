import api from "./api";

export const getNotifications = async ({
  filter = "ALL",
  limit = 20,
  cursor,
} = {}) => {
  const params = {
    filter,
    limit,
  };

  if (cursor) {
    params.cursor = cursor;
  }

  const response = await api.get("/notifications", {
    params,
  });

  return response.data;
};

export const markNotificationRead = async (notificationId) => {
  const response = await api.patch(`/notifications/${notificationId}/read`);

  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await api.patch("/notifications/read-all");

  return response.data;
};

export const dismissNotification = async (notificationId) => {
  const response = await api.delete(`/notifications/${notificationId}`);

  return response.data;
};
