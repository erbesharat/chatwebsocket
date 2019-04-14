import { Socket } from 'socket.io';
import { Call, CallRequest, CallResponse } from '../types';
import { socketServer, sql } from '../server';
import { boilMSSQL } from '../utils/mssql';
import uuid from 'uuid';

export default (socket: Socket) => async (data: Call) => {
  const fromUser = await sql.query(
    boilMSSQL(`SELECT * FROM %db.[Users] WHERE Mobile = '${data.from_user}';`),
  );
  let { Id } = fromUser.recordset[0];
  const fromUserID = Id;

  const toUser = await sql.query(
    boilMSSQL(`SELECT * FROM %db.[Users] WHERE Mobile = '${data.to_user}';`),
  );
  const toUserId = toUser.recordset[0].Id;

  try {
    await sql.query(
      boilMSSQL(
        `UPDATE %db.[Users] SET IsBusy = 1, CallStatus = 'Busy' WHERE Id = ${fromUserID};`,
      ),
    );
  } catch (error) {
    console.error("\nCouldn't update from user's status: ", error);
  }
  try {
    await sql.query(
      boilMSSQL(
        `UPDATE %db.[Users] SET IsBusy = 1, CallStatus = 'Busy' WHERE Id = ${toUserId};`,
      ),
    );
  } catch (error) {
    console.error("\nCouldn't update to user's status: ", error);
  }

  socket.emit('call response', {
    room_id: data.room_id,
    status: true,
    type: 'answer',
  } as CallResponse);
};
