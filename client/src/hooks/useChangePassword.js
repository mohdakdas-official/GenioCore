import { useCallback, useState } from "react";

import { changeUserPassword } from "../services/user.service";

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Unable to change password.";

export const useChangePassword = () => {
  const [isChanging, setIsChanging] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const changePassword = useCallback(async (payload) => {
    try {
      setIsChanging(true);
      setError("");
      setSuccess("");

      const response = await changeUserPassword(payload);

      setSuccess(response?.message || "Password changed successfully.");

      return response;
    } catch (error) {
      const message = getErrorMessage(error);

      setError(message);

      throw error;
    } finally {
      setIsChanging(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  return {
    isChanging,
    error,
    success,
    changePassword,
    clearMessages,
  };
};
