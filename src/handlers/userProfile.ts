import { Socket } from 'socket.io';
import { Profile } from '../types';
import { boilMSSQL } from '../utils/mssql';
import { socketServer, sql } from '../server';

export default (socket: Socket) => async (data: Profile) => {
  var user;
  try {
    user = await sql.query(
      boilMSSQL(
        `SELECT * FROM %db.[UserDetails] WHERE UserId = ${data.user_id};`,
      ),
    );
  } catch (error) {
    socket.to(socket.id).emit('user response', {
      error: {
        type: 'profile',
        message: "Couldn't find the user",
      },
    });
    console.error(error);
  }
  socketServer.to(socket.id).emit('user response', {
    type: 'profile',
    user: user.recordset[0],
  });
};
