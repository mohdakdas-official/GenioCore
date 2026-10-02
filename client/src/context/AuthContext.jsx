import { createContext, useContext, useEffect, useState } from "react";
import { setAccessToken, clearAccessToken } from "../services/api";

import {
  getCurrentUser,
  refreshAccessToken as refreshAccessTokenRequest,
  logoutUser,
} from "../services/auth.service";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const updateUser = (updatedUser) => {
    if (!updatedUser) {
      return;
    }

    setUser((currentUser) => {
      if (!currentUser) {
        return updatedUser;
      }

      return {
        ...currentUser,
        ...updatedUser,
      };
    });
  };

  const fetchCurrentUser = async () => {
    const response = await getCurrentUser();

    const currentUser = response.data;

    setUser(currentUser);

    return currentUser;
  };

  const refreshAccessToken = async () => {
    const response = await refreshAccessTokenRequest();

    const newAccessToken = response.data.accessToken;

    setAccessToken(newAccessToken);

    return newAccessToken;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshAccessToken();
        await fetchCurrentUser();
      } catch (error) {
        clearAccessToken();
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      clearAccessToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        updateUser,
        isAuthLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
