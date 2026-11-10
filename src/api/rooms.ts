import client from "./client";
import type { Room } from "../types";

export async function getRooms(q?: string, signal?: AbortSignal): Promise<Room[]> {
  const response = await client.get<Room[]>("/rooms/", { params: { q }, signal });
  return response.data;
}