import { RequestJoin } from '../types';
import { Socket } from 'socket.io';

import uuid from 'uuid';
import { boilMSSQL } from '../utils/mssql';
import { sql } from '../server';
import { JoinMessage } from '../types';

export default (socket: Socket) => async (data: RequestJoin) => {
  var result = await sql.query(
    boilMSSQL(
      `SELECT * FROM %db.[rooms] WHERE user_id = ${
        data.user_id
      } AND recipient_id = ${data.recipient_id};`,
    ),
  );

  if (result.rowsAffected[0] === 0) {
    result = await sql.query(
      boilMSSQL(
        `SELECT * FROM %db.[rooms] WHERE recipient_id = ${data.recipient_id};`,
      ),
    );
  }

  if (result.rowsAffected[0] === 0) {
    // Create room
    const roomID = uuid.v4();
    await sql.query(
      boilMSSQL(
        `INSERT INTO %db.[rooms] (title, user_id, recipient_id)
        VALUES ('${roomID}', ${data.user_id}, ${data.recipient_id})
        `,
      ),
    );

    socket.join(roomID);
    socket.emit('logs response', {
      type: 'request',
      success: true,
      room_title: roomID,
    } as JoinMessage);
  } else {
    // Join room
    socket.join(result.recordset[0].title);
    socket.emit('logs response', {
      type: 'request',
      success: true,
      room_title: result.recordset[0].title,
    } as JoinMessage);
  }
};
