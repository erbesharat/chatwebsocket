import { Socket } from 'socket.io';
import { Profile } from '../types';
import { boilMSSQL } from '../utils/mssql';
import { socketServer, sql } from '../server';

export default (socket: Socket) => async (data: Profile) => {
  // Get list of rooms related to the given user
  var rooms;
  var result: any[] = [];
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
  }

  var counter: number = rooms.recordset.length;

  // Find status of each room's users
  rooms.recordset.forEach(async room => {
    const user = await sql.query(
      boilMSSQL(`SELECT * FROM %db.[Users] WHERE Id = ${room.recipient_id};`),
    );
    const details = await sql.query(
      boilMSSQL(
        `SELECT * FROM %db.[UserDetails] WHERE UserId = ${room.recipient_id};`,
      ),
    );
    if (user.recordset[0]) {
      room.recipient_status = user.recordset[0].IsOnline ? 'online' : 'offline';
      room.recipient_lastseen = user.recordset[0].lastSeen
        ? user.recordset[0].lastSeen
        : null;
      if (details.recordset[0]) {
        room.recipient_avatar = details.recordset[0].ImageAddress
          ? details.recordset[0].ImageAddress
          : null;
        room.recipient_name = details.recordset[0].FullName
          ? details.recordset[0].FullName
          : null;
      }
    }
    result.push(room);
    counter -= 1;
    if (counter === 0) {
      socketServer.to(socket.id).emit('user response', {
        type: 'list',
        rooms: result,
      });
    }
  });
};
