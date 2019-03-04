import { Socket } from 'socket.io';
import { Call, CallRequest } from '../types';
import { socketServer, sql } from '../server';
import { boilMSSQL } from '../utils/mssql';
import uuid from 'uuid';
import { CallResponse } from 'message';

export default (socket: Socket) => async (data: CallResponse) => {
  socket.broadcast.emit('call broadcast', data);
};
