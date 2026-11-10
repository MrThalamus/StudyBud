import client from "./client";
import type { CurrentUser } from "../types";

interface LoginResponse {
  token: string;
}

interface RegisterResponse {
  token: string;
}

export async function login(email: string, password: string): Promise<string> {
  const response = await client.post<LoginResponse>("/login/", {
    username: email.toLowerCase(),
    password,
  });
  return response.data.token;
}


export async function register(
  name: string,
  username: string,
  email: string,
  password1: string,
  password2: string
): Promise<string> {
  const response = await client.post<RegisterResponse>("/register/", {
    name,
    username,
    email,
    password1,
    password2,
  });
  return response.data.token;
}

export async function logout(): Promise<void> {
  await client.post("/logout/");
}

// The Promise tells your code “a value is coming.” await waits for it to arrive, then gives you the value.
export async function getMe(): Promise<CurrentUser> {
  const response = await client.get<CurrentUser>("/users/me/");
  return response.data;
}