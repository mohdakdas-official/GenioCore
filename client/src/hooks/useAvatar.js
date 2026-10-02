import { useEffect, useState } from "react";

import { removeUserAvatar, uploadUserAvatar } from "../services/user.service";

const MAX_AVATAR_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong.";

export const useAvatar = ({ currentAvatar, onUserUpdated }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const [previewUrl, setPreviewUrl] = useState("");

  const [savedAvatar, setSavedAvatar] = useState(currentAvatar ?? null);

  const [isUploading, setIsUploading] = useState(false);

  const [isRemoving, setIsRemoving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /*
   * Keep server avatar in sync
   * when profile loads/refetches.
   */
  useEffect(() => {
    setSavedAvatar(currentAvatar ?? null);
  }, [currentAvatar]);

  /*
   * Local image preview.
   */
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);

    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const selectAvatar = (file) => {
    clearMessages();

    if (!file) {
      return;
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      setError("Avatar must be a JPG, PNG, or WEBP image.");

      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setError("Avatar image must be smaller than 10 MB.");

      return;
    }

    setSelectedFile(file);
  };

  const cancelSelection = () => {
    setSelectedFile(null);
    clearMessages();
  };

  const uploadAvatar = async () => {
    if (!selectedFile) {
      setError("Select an image first.");

      return null;
    }

    try {
      setIsUploading(true);
      clearMessages();

      const response = await uploadUserAvatar(selectedFile);

      const updatedUser = response?.data;

      if (!updatedUser) {
        throw new Error("Invalid avatar response.");
      }

      setSavedAvatar(updatedUser.avatar ?? null);

      setSelectedFile(null);

      onUserUpdated?.(updatedUser);

      setSuccess("Profile photo updated successfully.");

      return updatedUser;
    } catch (error) {
      setError(getErrorMessage(error));

      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const removeAvatar = async () => {
    try {
      setIsRemoving(true);
      clearMessages();

      const response = await removeUserAvatar();

      const updatedUser = response?.data;

      if (!updatedUser) {
        throw new Error("Invalid avatar response.");
      }

      setSavedAvatar(null);
      setSelectedFile(null);

      onUserUpdated?.(updatedUser);

      setSuccess("Profile photo removed successfully.");

      return updatedUser;
    } catch (error) {
      setError(getErrorMessage(error));

      throw error;
    } finally {
      setIsRemoving(false);
    }
  };

  const displayAvatar = previewUrl || savedAvatar || null;

  return {
    selectedFile,
    displayAvatar,

    isUploading,
    isRemoving,

    error,
    success,

    selectAvatar,
    uploadAvatar,
    removeAvatar,
    cancelSelection,
    clearMessages,
  };
};
