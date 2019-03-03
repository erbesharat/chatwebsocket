import { Socket } from 'socket.io';
import { User } from '../types';

export default (socket: Socket) => async (data: User) => {
  // NOTE: this is how you compare status => data.status === Status.Busy
  // TODO: Update user's status in database
};
