import { Socket } from 'socket.io';
import { socketServer, sql } from '../server';
import { boilMSSQL } from '../utils/mssql';
import moment from 'moment-jalaali';
import { GlobalData } from '../types';

export default (socket: Socket, perm, global: GlobalData) => async (data: {
  call_status: boolean;
  user_id: number;
}) => {
  global.users[data.user_id] = {
    socketId: socket.id,
    available: data.call_status,
  };
};
