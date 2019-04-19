import { Socket } from 'socket.io';
import { User } from '../types';
import { socketServer, sql } from '../server';
import { boilMSSQL } from '../utils/mssql';
import moment from 'moment-jalaali';

export default (socket: Socket) => async (data: User, perm) => {
  let user;
  let result;
  try {
    user = await sql.query(
      boilMSSQL(`SELECT * FROM %db.[Users] WHERE id = ${data.user_id};`),
    );
  } catch (error) {
    socket.emit('logs response', {
      error: {
        type: 'status',
        message: "Couldn't find the user",
      },
    });
    return;
  }
  perm.user_id = data.user_id;
  if (data.online) {
    try {
      result = await sql.query(
        boilMSSQL(
          `UPDATE %db.[Users] SET IsOnline = 1 WHERE id = ${data.user_id};`,
        ),
      );
      console.log('Status result: \n', result);
    } catch (error) {
      socket.emit('logs response', {
        error: {
          type: 'status',
          message: "Couldn't set status to online",
        },
      });
      console.error(error);
    }
  } else {
    try {
      result = await sql.query(
        boilMSSQL(
          `UPDATE %db.[Users] SET IsOnline = 0, lastSeen = '${moment().format(
            'jYYYY/jM/jD HH:mm',
          )}' WHERE id = ${data.user_id};`,
        ),
      );
      console.log('Status result: \n', result);
    } catch (error) {
      socket.emit('logs response', {
        error: {
          type: 'status',
          message: "Couldn't set status to offline",
        },
      });
      console.error(error);
    }
  }
  socketServer.emit('user response', {
    type: 'status',
    refresh: true,
  });

  socket.emit('logs response', {
    type: 'status',
    user_id: data.user_id,
    online: data.online,
    last_seen: moment().format('jYYYY/jM/jD HH:mm'),
  });
};
