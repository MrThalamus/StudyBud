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
  name: string | null;
  username: string;
  bio: string | null;
  avatar: string | null;
}

export interface CurrentUser extends User {
  email: string;
}

export interface RoomFormValues {
  name: string; 
  topic_name: string;
  description: string;
}
