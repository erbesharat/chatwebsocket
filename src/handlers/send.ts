import { Socket } from 'socket.io';
import { Message } from '../types';
import { boilMSSQL } from '../utils/mssql';
import { socketServer, sql } from '../server';

export default (socket: Socket) => async (data: Message) => {
  const result = await sql.query(
    boilMSSQL(`SELECT * FROM %db.[rooms] WHERE title = '${data.room_title}';`),
  );

  if (result.rowsAffected[0] === 0) {
    socket.emit(
      'send response',
      `[error]: room ${data.room_title} doesn't exist`,
    );
    return false;
  }

  const { user_id, recipient_id } = result.recordset[0];
  if (user_id !== data.user_id || recipient_id !== data.user_id) {
    socket.emit(
      'send response',
      `[error]: user doesn't belong to room ${data.room_title}`,
    );
    return false;
  }

  // TODO: Save the message to DB
  socketServer.sockets.in(data.room_title).emit('send message to room', data);
  console.log('hola hola hola hola hola');
};
