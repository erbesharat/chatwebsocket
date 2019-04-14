export interface Message {
  user_id: number;
  room_title: string;
  message: string;
}

export interface RequestJoin {
  user_id: number;
  recipient_id: number;
}

export interface JoinMessage {
  type: string;
  success: boolean;
  room_title: string;
}

export interface CallRequest {
  room_id: string;
  to_user: number;
}

export interface CallResponse {
  room_id: string;
  from_number: string;
  to_number: string;
  from_status: string;
  to_status: string;
  type: string;
  status: boolean;
}
