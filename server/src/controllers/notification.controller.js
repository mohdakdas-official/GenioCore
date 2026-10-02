import mongoose from "mongoose";

import { Notification } from "../models/notification.model.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;

  const { filter = "ALL", limit = 20, cursor } = req.query;

  const safeLimit = Math.min(Number(limit) || 20, 50);

  const query = {
    ownerId,
    dismissedAt: null,
  };

  if (filter === "UNREAD") {
    query.isRead = false;
  }

  if (cursor) {
    if (!mongoose.Types.ObjectId.isValid(cursor)) {
      throw new ApiError(400, "Invalid notification cursor.");
    }

    query._id = {
      $lt: cursor,
    };
  }

  const notifications = await Notification.find(query)
    .sort({
      _id: -1,
    })
    .limit(safeLimit + 1)
    .lean();

  const hasNextPage = notifications.length > safeLimit;

  if (hasNextPage) {
    notifications.pop();
  }

  const nextCursor =
    hasNextPage && notifications.length > 0
      ? notifications[notifications.length - 1]._id
      : null;

  const unreadCount = await Notification.countDocuments({
    ownerId,
    dismissedAt: null,
    isRead: false,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        unreadCount,

        pagination: {
          limit: safeLimit,
          hasNextPage,
          nextCursor,
        },
      },
      "Notifications retrieved successfully.",
    ),
  );
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      ownerId: req.user.id,
      dismissedAt: null,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
    {
      returnDocument: "after",
    },
  );

  if (!notification) {
    throw new ApiError(404, "Notification not found.");
  }

  res
    .status(200)
    .json(new ApiResponse(200, notification, "Notification marked as read."));
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const now = new Date();

  const result = await Notification.updateMany(
    {
      ownerId: req.user.id,
      dismissedAt: null,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: now,
      },
    },
  );

  res.status(200).json(
    new ApiResponse(
      200,
      {
        modifiedCount: result.modifiedCount,
      },
      "Notifications marked as read.",
    ),
  );
});

export const dismissNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    ownerId: req.user.id,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found.");
  }

  res
    .status(200)
    .json(new ApiResponse(200, null, "Notification deleted successfully."));
});
