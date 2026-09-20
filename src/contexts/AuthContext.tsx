"use client";

import axios, { AxiosError } from "axios";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

// API base URL — now relative since API routes are part of the same Next.js app
const API_BASE_URL = "";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean;
  created_at: string;
  last_login: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const noopAuth: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshAccessToken: async () => {},
  error: null,
  clearError: () => {},
};

const AuthContext = createContext<AuthContextType>(noopAuth);

const TOKEN_KEYS = {
  ACCESS: "auth_access_token",
  REFRESH: "auth_refresh_token",
} as const;

const getStoredToken = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
};

const setStoredToken = (key: string, token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, token);
};

const removeStoredToken = (key: string): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
};

const clearAllTokens = (): void => {
  removeStoredToken(TOKEN_KEYS.ACCESS);
  removeStoredToken(TOKEN_KEYS.REFRESH);
};

// Axios interceptors
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  failedQueue = [];
};

if (typeof window !== "undefined") {
  api.interceptors.request.use(
    (config) => {
      const token = getStoredToken(TOKEN_KEYS.ACCESS);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const originalRequest = error.config as any;
      const requestUrl = originalRequest?.url || "";

      // Do NOT intercept auth endpoints (login, register, refresh, logout) - let their errors bubble to caller!
      const isAuthEndpoint =
        requestUrl.includes("/api/auth/login") ||
        requestUrl.includes("/api/auth/register") ||
        requestUrl.includes("/api/auth/refresh") ||
        requestUrl.includes("/api/auth/logout");

      if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = getStoredToken(TOKEN_KEYS.REFRESH);
        if (!refreshToken) {
          clearAllTokens();
          if (typeof window !== "undefined" && window.location.pathname !== "/login" && window.location.pathname !== "/register") {
            const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search);
            window.location.href = `/login?redirect=${redirectUrl}`;
          }
          return Promise.reject(error);
        }

        try {
          const response = await axios.post(
            `/api/auth/refresh`,
            {},
            { headers: { Authorization: `Bearer ${refreshToken}` } }
          );

          const { access_token } = response.data;
          setStoredToken(TOKEN_KEYS.ACCESS, access_token);
          processQueue(null, access_token);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError as Error, null);
          clearAllTokens();
          if (typeof window !== "undefined" && window.location.pathname !== "/login" && window.location.pathname !== "/register") {
            const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search);
            window.location.href = `/login?redirect=${redirectUrl}`;
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = user !== null;

  useEffect(() => {
    const loadUser = async () => {
      const accessToken = getStoredToken(TOKEN_KEYS.ACCESS);
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get("/api/auth/me");
        setUser(response.data.user);
      } catch {
        const refreshToken = getStoredToken(TOKEN_KEYS.REFRESH);
        if (refreshToken) {
          try {
            await refreshAccessToken();
            const response = await api.get("/api/auth/me");
            setUser(response.data.user);
          } catch {
            clearAllTokens();
          }
        } else {
          clearAllTokens();
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await api.post("/api/auth/login", credentials);
      const { access_token, refresh_token, user: userData } = response.data;
      setStoredToken(TOKEN_KEYS.ACCESS, access_token);
      setStoredToken(TOKEN_KEYS.REFRESH, refresh_token);
      setUser(userData);
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? err.response?.data?.error || "Login failed"
          : "An unexpected error occurred";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await api.post("/api/auth/register", data);
      const { access_token, refresh_token, user: userData } = response.data;
      if (access_token && refresh_token) {
        setStoredToken(TOKEN_KEYS.ACCESS, access_token);
        setStoredToken(TOKEN_KEYS.REFRESH, refresh_token);
        setUser(userData);
      } else {
        await login({ email: data.email, password: data.password });
      }
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? err.response?.data?.error || "Registration failed"
          : "An unexpected error occurred";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    const accessToken = getStoredToken(TOKEN_KEYS.ACCESS);
    const refreshToken = getStoredToken(TOKEN_KEYS.REFRESH);
    if (accessToken || refreshToken) {
      axios
        .post(
          "/api/auth/logout",
          { refresh_token: refreshToken },
          { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined }
        )
        .catch(() => {});
    }
    setUser(null);
    clearAllTokens();
  };

  const refreshAccessToken = async () => {
    const refreshToken = getStoredToken(TOKEN_KEYS.REFRESH);
    if (!refreshToken) throw new Error("No refresh token available");

    try {
      const response = await axios.post(
        `/api/auth/refresh`,
        {},
        { headers: { Authorization: `Bearer ${refreshToken}` } }
      );
      const { access_token } = response.data;
      setStoredToken(TOKEN_KEYS.ACCESS, access_token);
    } catch (err) {
      clearAllTokens();
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshAccessToken,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { api };
