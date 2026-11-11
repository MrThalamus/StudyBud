import client from "./client";
import type { Message } from "../types";

export async function getAllMessages(signal?: AbortSignal): Promise<Message[]> {
  const response = await client.get<Message[]>("/messages/", { signal });
  return response.data;
}

export async function getRoomMessages(
  roomId: number,
  signal?: AbortSignal,
): Promise<Message[]> {
  const response = await client.get<Message[]>(`/rooms/${roomId}/messages/`, {
    signal,
  });
  return response.data;
}

export async function createMessage(
  roomId: number,
  body: string,
): Promise<Message> {
  const response = await client.post<Message>(`/rooms/${roomId}/messages/`, {
    body,
  });
  return response.data;
}

