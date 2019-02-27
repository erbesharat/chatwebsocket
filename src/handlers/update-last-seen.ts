import { Socket } from 'socket.io';
import { User } from '../types';

export default (socket: Socket) => async (data: User) => {
  // TODO: Update user's last seen in database
};
