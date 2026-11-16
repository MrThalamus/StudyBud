import client from "./client";
import type { Room, RoomFormValues, User } from "../types";

export interface RoomFilters {
  q?: string; // free-text search (name, description, topic)
  topic?: string; // exact topic name
}

export async function getRooms(
  filters: RoomFilters,
  signal?: AbortSignal,
): Promise<Room[]> {
  const response = await client.get<Room[]>("/rooms/", {
    params: filters,
    signal,
  });
  return response.data;
}


export async function getRoom(id: number, signal?: AbortSignal): Promise<Room> {
  const response = await client.get<Room>(`/rooms/${id}/`, { signal });
  return response.data;
}

export async function createRoom(values: RoomFormValues): Promise<Room> {
  const response = await client.post<Room>("/rooms/", values);
  return response.data;
}

export async function updateRoom(
  id: number,
  values: RoomFormValues,
): Promise<Room> {
  const response = await client.patch<Room>(`/rooms/${id}/update/`, values);
  return response.data;
}

export async function deleteRoom(id: number): Promise<void> {
  await client.delete(`/rooms/${id}/delete/`);
}

export async function getRoomParticipants(
  id: number,
  signal?: AbortSignal,
): Promise<User[]> {
  const response = await client.get<User[]>(`/rooms/${id}/participants/`, {
    signal,
  });
  return response.data;
}
