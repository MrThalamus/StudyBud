import client from "./client";
import type { CurrentUser, Message, Room, User } from "../types";

export async function getUser(id: number, signal?: AbortSignal): Promise<User> {
  const response = await client.get<User>(`/users/${id}/`, { signal });
  return response.data;
}

export async function getUserRooms(
  id: number,
  signal?: AbortSignal,
): Promise<Room[]> {
  const response = await client.get<Room[]>(`/users/${id}/rooms/`, { signal });
  return response.data;
}

export async function getUserMessages(
  id: number,
  signal?: AbortSignal,
): Promise<Message[]> {
  const response = await client.get<Message[]>(`/users/${id}/messages/`, {
    signal,
  });
  return response.data;
}

export async function updateProfile(data: FormData): Promise<CurrentUser> {
  const response = await client.patch<CurrentUser>("/users/update/", data);
  return response.data;
}
