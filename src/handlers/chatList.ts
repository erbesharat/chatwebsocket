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
    console.log('\n\n===\nRooms: \n', rooms, '\n===\n');
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

  let counter: number = rooms.recordset.length;

  // Find status of each room's users
  let result: any[] = [];
  rooms.recordset.forEach(async (room, i, arr) => {
    const oppositeUser =
      room.user_id == data.user_id ? room.recipient_id : room.user_id;
    console.log('\n\n---------> ', oppositeUser);
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
      room.recipient_id = oppositeUser;
      room.recipient_status = IsOnline ? 'online' : 'offline';
      room.recipient_lastseen = lastSeen ? lastSeen : null;

      if (details.recordset[0]) {
        const { ImageAddress, FullName } = details.recordset[0];
        room.recipient_avatar = ImageAddress ? ImageAddress : null;
        room.recipient_name = FullName ? FullName : null;
      }
    }

    result.push(room);
    counter -= 1;
    if (counter === 0) {
      console.log('\n\n===\nResult: \n', result, '\n===\n');
      socketServer.to(socket.id).emit('user response', {
        type: 'list',
        rooms: result,
      });
    }
  });
};
