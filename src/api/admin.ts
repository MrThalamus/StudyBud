import client from "./client";
import type { AdminRoom, AdminTopic, AdminUser, AdminStats, Paginated, Message } from "../types";

// Rows-per-page choices in the admin tables (backend allows up to 100)
export const ADMIN_PAGE_SIZES = [10, 20, 50, 100];

// The default: the first choice
export const ADMIN_PAGE_SIZE = ADMIN_PAGE_SIZES[0];


export async function getAdminRooms(
  page: number,
  pageSize: number, 
  signal?: AbortSignal,
): Promise<Paginated<AdminRoom>> {
  const response = await client.get<Paginated<AdminRoom>>("/admin/rooms/", {
    params: { page, page_size: pageSize },
    signal,
  });
  return response.data;
}

export async function getAdminTopics(
  page: number,
  pageSize: number,
  signal?: AbortSignal,
): Promise<Paginated<AdminTopic>> {
  const response = await client.get<Paginated<AdminTopic>>("/admin/topics/", {
    params: { page, page_size: pageSize },
    signal,
  });
  return response.data;
}


export async function getAdminUsers(
  page: number,
  pageSize: number,
  signal?: AbortSignal,
): Promise<Paginated<AdminUser>> {
  const response = await client.get<Paginated<AdminUser>>("/admin/users/", {
    params: { page, page_size: pageSize },
    signal,
  });
  return response.data;
}


// Dashboard numbers. Not paginated: it's one small object
export async function getAdminStats(signal?: AbortSignal): Promise<AdminStats> {
  const response = await client.get<AdminStats>("/admin/stats/", { signal });
  return response.data;
}

export async function getAdminMessages(
  page: number,
  pageSize: number,
  signal?: AbortSignal,
): Promise<Paginated<Message>> {
  const response = await client.get<Paginated<Message>>("/admin/messages/", {
    params: { page, page_size: pageSize },
    signal,
  });
  return response.data;
}

export async function deleteAdminMessage(id: number): Promise<void> {
  await client.delete(`/admin/messages/${id}/`);
}
