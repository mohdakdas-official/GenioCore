import { useEffect, useState } from "react";

import { checkUsernameAvailability } from "../services/user.service";

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

export const useUsernameAvailability = ({
  username,
  currentUsername,
  delay = 500,
}) => {
  const [status, setStatus] = useState("IDLE");

  const [message, setMessage] = useState("");

  useEffect(() => {
    const normalized = username?.trim().toLowerCase() ?? "";

    const current = currentUsername?.trim().toLowerCase() ?? "";

    if (!normalized) {
      setStatus("IDLE");
      setMessage("");
      return;
    }

    if (normalized === current) {
      setStatus("CURRENT");
      setMessage("");
      return;
    }

    if (normalized.length < 5) {
      setStatus("INVALID");
      setMessage("Username must be at least 5 characters.");
      return;
    }

    if (normalized.length > 30) {
      setStatus("INVALID");
      setMessage("Username must be at most 30 characters.");
      return;
    }

    if (!USERNAME_REGEX.test(normalized)) {
      setStatus("INVALID");
      setMessage("Only letters, numbers and underscores are allowed.");
      return;
    }

    let cancelled = false;

    setStatus("CHECKING");
    setMessage("Checking availability...");

    const timeout = setTimeout(async () => {
      try {
        const response = await checkUsernameAvailability(normalized);

        if (cancelled) return;

        const result = response?.data;

        if (result?.available) {
          setStatus("AVAILABLE");
          setMessage("Username is available.");
        } else {
          setStatus("TAKEN");
          setMessage("Username is already taken.");
        }
      } catch (error) {
        if (cancelled) return;

        setStatus("ERROR");

        setMessage(
          error?.response?.data?.message || "Unable to check username.",
        );
      }
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [username, currentUsername, delay]);

  return {
    status,
    message,

    isChecking: status === "CHECKING",

    isAvailable: status === "AVAILABLE",

    isCurrent: status === "CURRENT",

    canUseUsername: status === "AVAILABLE" || status === "CURRENT",
  };
};
