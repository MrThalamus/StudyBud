import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "./token";


// Lets the auth context hear about expired or invalid tokens.
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

const baseURL = import.meta.env.VITE_API_URL;

// Create the instance
const client = axios.create({ baseURL }); 
 
// Request interceptor: attach the access token to every request
client.interceptors.request.use((config) => {
  const access = getAccessToken();
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});
// ---------- Refreshing the access token ----------

interface TokenPair {
  access: string;
  refresh: string;
}

// The refresh that is running right now (null = none running).
// Every request that gets a 401 waits for this SAME promise,
// so only one refresh call is ever made at a time.
let refreshPromise: Promise<string> | null = null;

async function requestNewTokens(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("No refresh token");

  // Plain axios (not client), so this call skips our interceptors
  const response = await axios.post<TokenPair>(`${baseURL}/auth/refresh/`, {
    refresh,
  });
  // Rotation: the server sends a NEW refresh token too, save both
  setTokens(response.data.access, response.data.refresh);
  return response.data.access;
}

function getNewAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = requestNewTokens().finally(() => {
      refreshPromise = null; // done (success or fail): allow the next refresh
    });
  }
  return refreshPromise;
}

// A request config with a flag so we retry each request only once
interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Response interceptor: on 401, refresh once and retry the request
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;

    // Not a 401, already retried, or not logged in: nothing to fix here
    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      !getRefreshToken()
    ) {
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      const access = await getNewAccessToken();
      original.headers.Authorization = `Bearer ${access}`;
      return client(original); // send the same request again
    } catch {
      // Refresh token expired or blacklisted: log out
      clearTokens();
      onUnauthorized?.();
      // Try once more as a guest, so public pages (rooms, topics) still load
      original.headers.delete("Authorization");
      return client(original);
    }
  },
);


export default client;