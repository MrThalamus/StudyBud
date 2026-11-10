import client from "./client";
import type { Topic } from "../types";

export async function getTopics(q?: string, signal?: AbortSignal): Promise<Topic[]> {
  const response = await client.get<Topic[]>("/topics/", { params: { q }, signal });
  return response.data;
}