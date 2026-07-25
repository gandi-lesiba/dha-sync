const MODE_KEY = "dha_sync_storage_mode"; // "local" | "session"
const ACCESS_TOKEN_KEY = "dha_sync_access_token";
const REFRESH_TOKEN_KEY = "dha_sync_refresh_token";
const USER_KEY = "user";

function activeStorage() {
  return localStorage.getItem(MODE_KEY) === "session" ? sessionStorage : localStorage;
}

export function getActiveStorage() {
  return activeStorage();
}

export function setRememberMe(remember) {
  localStorage.setItem(MODE_KEY, remember ? "local" : "session");
}

export function getAccessToken() {
  return activeStorage().getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token) {
  activeStorage().setItem(ACCESS_TOKEN_KEY, token);
}

export function getRefreshToken() {
  return activeStorage().getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token) {
  activeStorage().setItem(REFRESH_TOKEN_KEY, token);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(MODE_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}
