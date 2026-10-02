import { Notification } from "../models/notification.model.js";

export const createNotification = async ({
  ownerId,
  type,
  title,
  message,
  severity = "NORMAL",
  projectId = null,
  reviewId = null,
  dedupeKey,
}) => {
  return Notification.findOneAndUpdate(
    {
      ownerId,
      dedupeKey,
    },
    {
      $setOnInsert: {
        ownerId,
        type,
        title,
        message,
        severity,
        projectId,
        reviewId,
        dedupeKey,
      },
    },
    {
      upsert: true,
      returnDocument: "after",
    },
  );
};
