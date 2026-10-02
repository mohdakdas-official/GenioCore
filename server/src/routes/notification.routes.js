import { Router } from "express";

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  dismissNotification,
} from "../controllers/notification.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const notificationRouter = Router();

notificationRouter.use(authMiddleware);

notificationRouter.get("/", getNotifications);

notificationRouter.patch("/read-all", markAllNotificationsRead);

notificationRouter.patch("/:notificationId/read", markNotificationRead);

notificationRouter.delete("/:notificationId", dismissNotification);

export default notificationRouter;
