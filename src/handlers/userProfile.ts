import { Socket } from 'socket.io';
import { Profile } from '../types';
import { boilMSSQL } from '../utils/mssql';
import { socketServer, sql } from '../server';

export default (socket: Socket) => async (data: Profile) => {
  var user;
  try {
    user = await sql.query(boilMSSQL(`SELECT * FROM %db.[UserDetails];`));
  } catch (error) {
    socket.to(socket.id).emit('user response', {
      error: {
        type: 'profile',
        message: "Couldn't find the user",
      },
    });
    console.error(error);
  }
  console.log('\n\x1b[0m\x1b[47m\x1b[30mPROFILE\x1b[0m\t\t', user);
  socketServer.to(socket.id).emit('user response', user.recordset[0]);
};
