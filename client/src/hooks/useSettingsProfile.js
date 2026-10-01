import { useCallback, useEffect, useState } from "react";

import { getUserProfile, updateUserProfile } from "../services/user.service";

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong.";

export const useSettingsProfile = () => {
  const [profile, setProfile] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await getUserProfile();

      setProfile(response?.data ?? null);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const saveProfile = useCallback(async (payload) => {
    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      const response = await updateUserProfile(payload);

      const updatedProfile = response?.data ?? null;

      setProfile(updatedProfile);

      setSuccess("Profile updated successfully.");

      return updatedProfile;
    } catch (error) {
      const message = getErrorMessage(error);

      setError(message);

      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  return {
    profile,
    user: profile?.user ?? null,
    preferences: profile?.preferences ?? null,

    isLoading,
    isSaving,

    error,
    success,

    saveProfile,
    refreshProfile: loadProfile,
    clearMessages,
  };
};
