export interface Message {
  user_id: number;
  room_title: string;
  message: string;
}

export interface RequestJoin {
  user_id: number;
  recipient_id: number;
}
