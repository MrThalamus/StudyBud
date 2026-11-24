import client from "./client";
import type {
  AdminRoom,
  AdminTopic,
  AdminTopicInput,
  AdminRoomInput,
  AdminUser,
  AdminUserInput,
  AdminUserUpdateResponse,
  AdminStats,
  Paginated,
  Message,
} from "../types";

// Rows-per-page choices in the admin tables (backend allows up to 100)
export const ADMIN_PAGE_SIZES = [10, 20, 25, 50, 100];

// The default: the first choice
export const ADMIN_PAGE_SIZE = ADMIN_PAGE_SIZES[0];


export async function getAdminRooms(
  page: number,
  pageSize: number, 
  signal?: AbortSignal,
): Promise<Paginated<AdminRoom>> {
  const response = await client.get<Paginated<AdminRoom>>("/admin/rooms/", {
    params: { page, page_size: pageSize, ordering: "-id" },
    signal,
  });
  return response.data;
}
// The server answers 201 with the new room
export async function createAdminRoom(data: AdminRoomInput): Promise<AdminRoom> {
  const response = await client.post<AdminRoom>("/admin/rooms/", data);
  return response.data;
}

// PATCH = change only the fields we send
export async function updateAdminRoom(
  id: number,
  data: AdminRoomInput,
): Promise<AdminRoom> {
  const response = await client.patch<AdminRoom>(`/admin/rooms/${id}/`, data);
  return response.data;
}

export async function deleteAdminRoom(id: number): Promise<void> {
  await client.delete(`/admin/rooms/${id}/`);
}

export async function getAdminTopics(
  page: number,
  pageSize: number,
  signal?: AbortSignal,
): Promise<Paginated<AdminTopic>> {
  const response = await client.get<Paginated<AdminTopic>>("/admin/topics/", {
    params: { page, page_size: pageSize, ordering: "-id" },
    signal,
  });
  return response.data;
}

// The server answers 201 with the new topic (room_count 0, no hosts yet)
export async function createAdminTopic(data: AdminTopicInput): Promise<AdminTopic> {
  const response = await client.post<AdminTopic>("/admin/topics/", data);
  return response.data;
}

// PATCH = change only the fields we send (here just the name)
export async function updateAdminTopic(
  id: number,
  data: AdminTopicInput,
): Promise<AdminTopic> {
  const response = await client.patch<AdminTopic>(`/admin/topics/${id}/`, data);
  return response.data;
}

export async function deleteAdminTopic(id: number): Promise<void> {
  await client.delete(`/admin/topics/${id}/`);
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

// The server answers 201 with the new user (never the password)
export async function createAdminUser(data: AdminUserInput): Promise<AdminUser> {
  const response = await client.post<AdminUser>("/admin/users/", data);
  return response.data;
}

// PATCH = change only the fields we send (no password = keep the old one)
export async function updateAdminUser(
  id: number,
  data: AdminUserInput,
): Promise<AdminUserUpdateResponse> {
  const response = await client.patch<AdminUserUpdateResponse>(
    `/admin/users/${id}/`,
    data,
  );
  return response.data;
}

export async function deleteAdminUser(id: number): Promise<void> {
  await client.delete(`/admin/users/${id}/`);
}

// Dashboard numbers. Not paginated: it's one small object
export async function getAdminStats(signal?: AbortSignal): Promise<AdminStats> {
  const response = await client.get<AdminStats>("/admin/stats/", { signal });
  return response.data;
}

// roomId = only that room's messages (?room=<id>); leave it out for all messages
export async function getAdminMessages(
  page: number,
  pageSize: number,
  roomId?: number,
  signal?: AbortSignal,
): Promise<Paginated<Message>> {
  const response = await client.get<Paginated<Message>>("/admin/messages/", {
    params: { page, page_size: pageSize, room: roomId }, // axios leaves out undefined
    signal,
  });
  return response.data;
}

export async function deleteAdminMessage(id: number): Promise<void> {
  await client.delete(`/admin/messages/${id}/`);
}
