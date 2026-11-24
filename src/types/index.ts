export interface Topic {
  id: number;
  name: string;
  room_count: number;
}

export interface Room {
  id: number;
  host: number | null;
  topic: number | null;
  host_name: string | null;
  host_avatar: string | null;
  topic_name: string | null;
  name: string;
  description: string | null;
  participants: number[];
  created: string;
  updated: string;
}

export interface Message {
  id: number;
  user: number;
  room: number;
  room_name: string;
  user_name: string | null;
  user_avatar: string | null;
  body: string;
  created: string;
  updated: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  bio: string | null;
  avatar: string | null;
}

export interface CurrentUser extends User {
  is_superuser: boolean;
  email: string;
}

export interface RoomFormValues {
  name: string;
  topic_name: string; 
  description: string;
}


// ---------- Admin panel ----------

// Admin list endpoints return one page at a time, wrapped like this
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AdminRoom {
  id: number;
  name: string;
  description: string | null;
  topic: number | null;
  topic_name: string | null;
  host: number | null;
  host_name: string | null;
  participants: number[];
  participant_names: string[];
  message_count: number;
  created: string;
  updated: string;
}


export interface AdminTopic {
  id: number;
  name: string;
  room_count: number;
  host_names: string[];
}
// What we SEND to create or edit a room (ids, not names)
export interface AdminRoomInput {
  name: string;
  description: string;
  topic: number;
  host: number;
}

// What we SEND to create or rename a topic (AdminTopic is what we receive)
export interface AdminTopicInput {
  name: string;
}

// What we SEND to create or edit a user. password: leave it out to keep the old one
export interface AdminUserInput {
  name: string;
  username: string;
  email: string;
  bio: string;
  is_superuser: boolean;
  is_staff: boolean;
  is_active: boolean;
  password?: string;
}

export interface AdminUser {
  id: number;
  name: string;
  username: string;
  email: string;
  bio: string | null;
  avatar: string | null;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string | null;
}

// Edit answer: the user, plus a fresh token pair when you changed YOUR OWN password
export interface AdminUserUpdateResponse extends AdminUser {
  access?: string;
  refresh?: string;
}

// What /api/admin/stats/ sends back: one number per item
export interface AdminStats {
  users: number;
  active_users: number;
  admins: number;
  rooms: number;
  topics: number;
  messages: number;
}

