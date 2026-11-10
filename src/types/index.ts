export interface Topic {
  id: number;
  name: string;
}

export interface Room {
  id: number;
  host: number | null;
  topic: number | null;
  host_name: string | null;
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
  user_name: string | null;
  user_avatar: string | null;
  body: string;
  created: string;
  updated: string;
}

export interface User {
  id: number;
  name: string | null;
  username: string;
  bio: string | null;
  avatar: string | null;
}

export interface CurrentUser extends User {
  email: string;
}