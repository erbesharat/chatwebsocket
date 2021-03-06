export interface Message {
  user_id: number;
  room_title: string;
  message: string;
  type_id: number;
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
  from_id: string;
  to_id: string;
  from_status: string;
  to_status: string;
  type: string;
  status: boolean;
  call_type: string;
  from_avatar: string;
  to_avatar: string;
  from_name: string;
  to_name: string;
}
