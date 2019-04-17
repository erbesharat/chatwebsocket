import { RequestJoin } from '../types';
import { Socket } from 'socket.io';

import uuid from 'uuid';
import { boilMSSQL } from '../utils/mssql';
import { sql } from '../server';
import { JoinMessage } from '../types';

export default (socket: Socket) => async (data: RequestJoin) => {
  try {
    const user = await sql.query(
      boilMSSQL(`SELECT * FROM %db.[Users] WHERE Id = ${data.user_id};`),
    );
    const recipient = await sql.query(
      boilMSSQL(`SELECT * FROM %db.[Users] WHERE Id = ${data.recipient_id};`),
    );

    if (user.rowsAffected[0] === 0 || recipient.rowsAffected[0] === 0) {
      socket.emit('logs response', {
        type: 'error',
        message: 'User not found',
      });
      return;
    }
  } catch (err) {
    socket.emit('logs response', {
      type: 'error',
      message: 'Database is down',
    });
    return;
  }

  let room;
  try {
    room = await sql.query(
      boilMSSQL(
        `SELECT * FROM %db.[rooms] WHERE user_id = ${
          data.user_id
        } AND recipient_id = ${data.recipient_id};`,
      ),
    );

    if (room.rowsAffected[0] === 0) {
      room = await sql.query(
        boilMSSQL(
          `SELECT * FROM %db.[rooms] WHERE user_id = ${
            data.recipient_id
          } AND recipient_id = ${data.user_id};`,
        ),
      );
    }
  } catch (err) {
    // TODO: Send error: database error
  }

  if (room.rowsAffected[0] === 0) {
    // Create room
    const roomID = uuid.v4();
    await sql.query(
      boilMSSQL(
        `INSERT INTO %db.[rooms] (title, user_id, recipient_id)
        VALUES ('${roomID}', ${data.user_id}, ${data.recipient_id})`,
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
    socket.join(room.recordset[0].title);
    socket.emit('logs response', {
      type: 'request',
      success: true,
      room_title: room.recordset[0].title,
    } as JoinMessage);
  }
};
