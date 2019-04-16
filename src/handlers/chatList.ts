import { Socket } from 'socket.io';
import { Profile } from '../types';
import { boilMSSQL } from '../utils/mssql';
import { socketServer, sql } from '../server';

export default (socket: Socket) => async (data: Profile) => {
  // Get list of rooms related to the given user
  let rooms;
  try {
    rooms = await sql.query(
      boilMSSQL(
        `SELECT * FROM %db.[rooms] WHERE user_id = ${
          data.user_id
        } OR recipient_id = ${data.user_id};`,
      ),
    );
  } catch (error) {
    socket.to(socket.id).emit('user response', {
      error: {
        type: 'list',
        message: "Couldn't find the user",
      },
    });
    console.error(error);
    return;
  }

  let counter: number = 0;

  // Find status of each room's users
  let result: any[] = [];
  rooms.recordset.forEach(async (room, i, arr) => {
    const oppositeUser =
      room.user_id === data.user_id ? room.recipient_id : data.user_id;
    const user = await sql.query(
      boilMSSQL(`SELECT * FROM %db.[Users] WHERE Id = ${oppositeUser};`),
    );
    const details = await sql.query(
      boilMSSQL(
        `SELECT * FROM %db.[UserDetails] WHERE UserId = ${oppositeUser};`,
      ),
    );

    if (user.recordset[0]) {
      const { IsOnline, lastSeen } = user.recordset;
      room.recipient_status = IsOnline ? 'online' : 'offline';
      room.recipient_lastseen = lastSeen ? lastSeen : null;

      if (details.recordset[0]) {
        const { ImageAddress, FullName } = details.recordset[0];
        room.recipient_avatar = ImageAddress ? ImageAddress : null;
        room.recipient_name = FullName ? FullName : null;
      }
    }

    result.push(room);
    counter++;
    if (counter === arr.length - 1) {
      socketServer.to(socket.id).emit('user response', {
        type: 'list',
        rooms: result,
      });
    }
  });
};
