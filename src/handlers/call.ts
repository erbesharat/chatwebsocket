import { Socket } from 'socket.io';
import { Call, CallRequest } from '../types';
import { socketServer, sql } from '../server';
import { boilMSSQL } from '../utils/mssql';
import uuid from 'uuid';

export default (socket: Socket) => async (data: Call) => {
  const fromUser = await sql.query(
    boilMSSQL(`SELECT * FROM %db.[Users] WHERE Mobile = '${data.from_user}';`),
  );
  let { Id } = fromUser.recordset[0];
  const fromUserID = Id;

  const toUser = await sql.query(
    boilMSSQL(`SELECT * FROM %db.[Users] WHERE Mobile = '${data.to_user}';`),
  );
  const toUserId = toUser.recordset[0].Id;

  const roomID = uuid.v4();
  var result;
  try {
    result = await sql.query(
      boilMSSQL(
        `INSERT INTO %db.[CallLogs] (fromUserId, toUserId, roomNumber)
         VALUES (${fromUserID}, ${toUserId}, '${roomID}')
        `,
      ),
    );
  } catch (error) {
    console.error("\nCouldn't insert the message to database: ", error);
  }
  socket.emit('call response', {
    room: roomID,
    to: toUserId,
  });
};
