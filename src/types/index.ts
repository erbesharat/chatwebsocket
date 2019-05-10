export {
  Message,
  RequestJoin,
  JoinMessage,
  CallRequest,
  CallResponse,
} from './message';
export { default as User } from './user';
export { Call } from './call';
export { Profile } from './profile';

export interface GlobalData {
  users: { [userId: string]: { socketId: string; available: boolean } };
}
