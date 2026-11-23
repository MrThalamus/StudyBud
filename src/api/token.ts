// Where the two JWT tokens live in the browser
const ACCESS_KEY = "access";
const REFRESH_KEY = "refresh";
const OLD_TOKEN_KEY = "token"; // left over from the old DRF token system

export const getAccessToken = () => localStorage.getItem(ACCESS_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

// Login, register and refresh always give us a new pair, so save both together
export function setTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(OLD_TOKEN_KEY);
}
