import { Socket } from 'socket.io';
import moment from 'moment-jalaali';
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
    socketServer.to(socket.id).emit('user response', {
      type: 'error',
      message: "Couldn't find the user",
    });
    console.error(error);
    return;
  }

  let counter: number = rooms.recordset.length;
  if (rooms.recordset.length < 1) {
    console.log('\n\nNot FOund\n\n');
    socketServer.to(socket.id).emit('user response', {
      type: 'error',
      message: 'No room found',
    });
  }
  // Find status of each room's users
  let result: any[] = [];
  rooms.recordset.forEach(async (room, i, arr) => {
    try {
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
      const recipientUser = await sql.query(
        boilMSSQL(`SELECT * FROM %db.[Users] WHERE Id = ${oppositeUser};`),
      );

      const lastMessage = await sql.query(
        boilMSSQL(
          `SELECT TOP 1 * FROM %db.[chat_message] where room_id = ${
            room.Id
          } ORDER BY ID DESC;`,
        ),
      );
      console.log('\n\n\n++++\n', lastMessage, '\n\n++++');

      if (user.recordset[0]) {
        const { IsOnline, lastSeen } = user.recordset[0];
        console.log('\n\n====', IsOnline, lastSeen);

        if (lastMessage.recordset[0]) {
          room.last_message = lastMessage.recordset[0].text;
          room.last_message_date = moment(
            lastMessage.recordset[0].created_at,
          ).format('jYYYY-jMM-jDD HH:mm');
          room.last_message_type_id = lastMessage.recordset[0].messagetypeid;
        } else {
          room.last_message = '';
          room.last_message_date = '';
          room.last_message_type_id = 0;
        }

        room.recipient_id = oppositeUser;
        room.recipient_status = IsOnline ? 'online' : 'offline';
        room.recipient_lastseen = lastSeen ? lastSeen : null;

        if (details.recordset[0]) {
          const { ImageAddress, FullName, visitCost } = details.recordset[0];
          room.recipient_avatar = ImageAddress ? ImageAddress : null;
          room.recipient_name = FullName ? FullName : null;
          room.recipient_visit_cost =
            recipientUser.recordset[0].RoleId != 1 ? visitCost : 'user';
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
    } catch (err) {
      socketServer.to(socket.id).emit('user response', {
        type: 'error',
        message: 'Datebase error',
      });
      console.log('==================', 'REQUEST PARAMS:', room);
      console.error(err);
    }
  });
};
