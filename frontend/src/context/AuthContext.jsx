"use client";

import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(undefined);

const AUTH_STORAGE_KEY = "mts_auth";
const TOKEN_STORAGE_KEY = "mts_token";

export function AuthProvider({ children }) {
  const [state, setState] = useState(() => {
    if (typeof window === "undefined") {
      return { user: null, token: null, isAuthLoading: false };
    }

    try {
      const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
      const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);

      if (storedToken && storedUser) {
        return {
          token: storedToken,
          user: JSON.parse(storedUser),
          isAuthLoading: false,
        };
      }
    } catch (_error) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    return { user: null, token: null, isAuthLoading: false };
  });

  const login = (nextToken, nextUser) => {
    setState({
      token: nextToken,
      user: nextUser,
      isAuthLoading: false,
    });
    window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
  };

  const logout = () => {
    setState({ user: null, token: null, isAuthLoading: false });
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateUser = (nextUser) => {
    setState((prev) => {
      const mergedUser = { ...prev.user, ...nextUser };
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mergedUser));
      return {
        ...prev,
        user: mergedUser,
      };
    });
  };

  const { user, token, isAuthLoading } = state;

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthLoading,
      isAuthenticated: Boolean(token),
      login,
      logout,
      updateUser,
    }),
    [user, token, isAuthLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
