import client from "./client";
import type { Message, Paginated } from "../types";

export async function getAllMessages(
  limit: number,
  signal?: AbortSignal,
): Promise<Paginated<Message>> {
  const response = await client.get<Paginated<Message>>("/messages/", {
    params: { limit },
    signal,
  });
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

export async function deleteMessage(id: number): Promise<void> {
  await client.delete(`/messages/${id}/delete/`);
}

