import { Socket } from 'socket.io';
import { User } from '../types';
import { socketServer, sql } from '../server';
import { boilMSSQL } from '../utils/mssql';

export default (socket: Socket) => async (data: User) => {
  let user;
  let result;
  try {
    user = await sql.query(
      boilMSSQL(`SELECT * FROM %db.[Users] WHERE id = ${data.user_id};`),
    );
  } catch (error) {
    socket.emit('status response', {
      error: {
        message: "Couldn't find the user",
      },
    });
  }
  if (data.online) {
    try {
      result = await sql.query(
        boilMSSQL(`
        UPDATE Users
        SET IsOnline = true
        WHERE Id = ${data.user_id};
        `),
      );
      console.log('Status result: \n', result);
    } catch (error) {
      socket.emit('status response', {
        error: {
          message: "Couldn't set status to online",
        },
      });
      console.error(error);
    }
  } else {
    try {
      result = await sql.query(
        boilMSSQL(`
        UPDATE Users
        SET IsOnline = false
        WHERE Id = ${data.user_id};
        `),
      );
      console.log('Status result: \n', result);
    } catch (error) {
      socket.emit('status response', {
        error: {
          message: "Couldn't set status to offline",
        },
      });
      console.error(error);
    }
  }
  socket.emit('status response', {
    user_id: data.user_id,
    online: data.online,
  });
};
