import { Socket } from 'socket.io';
import { Message } from '../types';
import { boilMSSQL } from '../utils/mssql';
import { socketServer, sql } from '../server';

export default (socket: Socket) => async (data: Message) => {
  const result = await sql.query(
    boilMSSQL(`SELECT * FROM %db.[rooms] WHERE title = '${data.room_title}';`),
  );
  console.log('\n(SEND MESSAGE) Room Object: \n' + result);

  if (result.rowsAffected[0] === 0) {
    console.log('\n(SEND MESSAGE) Room does not exist');
    socket.emit(
      'logs response',
      `[error]: room ${data.room_title} doesn't exist`,
    );
    return false;
  }

  console.log('\n\nResult:\n', result);

  const { id, user_id, recipient_id } = result.recordset[0];
  if (user_id != data.user_id || recipient_id != data.user_id) {
    console.log('\n(SEND MESSAGE) Something is wrong with ids!\n');
    console.log(
      '\n(SEND MESSAGE) IDs: !\n' + id + ',' + user_id + ',' + recipient_id,
    );
    console.log(
      `\nExpected: [${user_id},${recipient_id}],
      Got: [${data.user_id}]\n`,
    );
    socket.emit(
      'logs response',
      `[error]: user doesn't belong to room ${data.room_title}`,
    );
    return false;
  }

  try {
    console.log('\n(SEND MESSAGE) Goest to create the message in DB!\n');
    await sql.query(
      boilMSSQL(
        `INSERT INTO %db.[chat_messages] (author_id, room_id, text, created_at)
         VALUES ('${data.user_id}', ${id}, '${
          data.message
        }', '${new Date().toISOString()}')
        `,
      ),
    );
  } catch (error) {
    console.error("\nCouldn't insert the message to database: ", error);
  }

  socketServer.sockets.in(data.room_title).emit('receive', data);
};
