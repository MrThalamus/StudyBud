import type { ReactNode } from "react";
import { DashboardIcon, RoomsIcon, TopicsIcon, UsersIcon } from "../common/icons";

export interface AdminLink {
  to: string;
  label: string;
  icon: ReactNode;
}

// The admin pages, shared by the Home dropdown and the admin sidebar
export const ADMIN_LINKS: AdminLink[] = [
  { to: "/admin", label: "Dashboard", icon: <DashboardIcon /> },
  { to: "/admin/rooms", label: "Rooms", icon: <RoomsIcon /> },
  { to: "/admin/topics", label: "Topics", icon: <TopicsIcon /> },
  { to: "/admin/users", label: "Users", icon: <UsersIcon /> },
];
