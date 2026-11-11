import client from "./client";
import type { Room, RoomFormValues } from "../types";

export async function getRooms(q?: string, signal?: AbortSignal): Promise<Room[]> {
  const response = await client.get<Room[]>("/rooms/", { params: { q }, signal });
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
