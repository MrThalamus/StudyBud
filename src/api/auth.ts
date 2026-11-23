import client from "./client";
import type { CurrentUser } from "../types";

// What /auth/login/ and /register/ send back
export interface AuthResponse {
  access: string; // short-lived (15 min): sent with every request
  refresh: string; // long-lived (7 days): only used to get a new access token
  user: CurrentUser;
}

export async function login( 
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await client.post<AuthResponse>("/auth/login/", {
    email,
    password,
  });
  return response.data;
}



export async function register(
  name: string,
  username: string,
  email: string,
  password1: string,
  password2: string
): Promise<AuthResponse> {
  const response = await client.post<AuthResponse>("/register/", {
    name,
    username,
    email,
    password1,
    password2,
  });
  return response.data;
}

// The server blacklists this refresh token so nobody can use it again
export async function logout(refresh: string): Promise<void> {
  await client.post("/auth/logout/", { refresh });
}


// The Promise tells your code “a value is coming.” await waits for it to arrive, then gives you the value.
export async function getMe(): Promise<CurrentUser> {
  const response = await client.get<CurrentUser>("/users/me/");
  return response.data;
}