import client from "./client";
import type { Message } from "../types";

export async function getAllMessages(signal?: AbortSignal): Promise<Message[]> {
  const response = await client.get<Message[]>("/messages/", { signal });
  return response.data;
}
