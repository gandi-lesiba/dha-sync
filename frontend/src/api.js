import axios from "axios";
import { clearTokens, getAccessToken, getRefreshToken, setAccessToken } from "./utils/tokenStore";

// ✅ Changed to match backend (port 5000, no /v1)
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: BASE_URL });

// Attach the access token to every outgoing request.
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On a 401, try exactly one silent refresh before giving up and forcing a
// re-login — avoids infinite retry loops if the refresh token itself is dead.
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    if (response?.status !== 401 || config._retried || config.url?.includes("/auth/")) {
      return Promise.reject(error);
    }
    config._retried = true;
    const refresh = getRefreshToken();
    if (!refresh) {
      clearTokens();
      window.location.assign("/login");
      return Promise.reject(error);
    }
    try {
      refreshPromise ||= axios
        .post(`${BASE_URL}/auth/refresh/`, { refresh })
        .then((r) => r.data.access)
        .finally(() => {
          refreshPromise = null;
        });
      const newAccess = await refreshPromise;
      setAccessToken(newAccess);
      config.headers.Authorization = `Bearer ${newAccess}`;
      return api(config);
    } catch (refreshError) {
      clearTokens();
      window.location.assign("/login");
      return Promise.reject(refreshError);
    }
  }
);

export default api;