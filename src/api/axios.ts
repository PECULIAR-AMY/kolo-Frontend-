// If TypeScript can't find axios types in this environment, provide a minimal
// ambient declaration to avoid the "Cannot find module 'axios'" error.
// Remove this declaration once @types/axios or axios' built-in types are available.
declare module "axios";
import axios from "axios";

let tokenInMemory: string | null = null;

export const setAccessToken = (token: string | null) => {
  tokenInMemory = token;
};

export const getAccessToken = () => {
  return tokenInMemory;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor to add Authorization header
api.interceptors.request.use(
  (config: any) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response Interceptor to handle automatic token refresh
api.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;
    // Avoid infinite loop if refresh token request itself fails with 401
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      originalRequest._retry = true;

      try {
        // Hit the refresh token endpoint
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (response.data.success && response.data.accessToken) {
          const newAccessToken = response.data.accessToken;
          setAccessToken(newAccessToken);

          // Update header and retry original request
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear session and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("kolo_current_user");
          setAccessToken(null);
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;