import client from "./client";
import type { AdminRoom, AdminTopic, AdminUser, Paginated } from "../types";

// How many rows the backend sends per page
export const ADMIN_PAGE_SIZE = 10;

export async function getAdminRooms(
  page: number,
  signal?: AbortSignal,
): Promise<Paginated<AdminRoom>> {
  const response = await client.get<Paginated<AdminRoom>>("/admin/rooms/", {
    params: { page, page_size: ADMIN_PAGE_SIZE },
    signal,
  });
  return response.data;
}


export async function getAdminTopics(
  page: number,
  signal?: AbortSignal,
): Promise<Paginated<AdminTopic>> {
  const response = await client.get<Paginated<AdminTopic>>("/admin/topics/", {
    params: { page, page_size: ADMIN_PAGE_SIZE },
    signal,
  });
  return response.data;
}


export async function getAdminUsers(
  page: number,
  signal?: AbortSignal,
): Promise<Paginated<AdminUser>> {
  const response = await client.get<Paginated<AdminUser>>("/admin/users/", {
    params: { page, page_size: ADMIN_PAGE_SIZE },
    signal,
  });
  return response.data;
}
