import client from "./client";
import type { AdminRoom, Paginated } from "../types";

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
