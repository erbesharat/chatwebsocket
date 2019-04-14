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

  const roomID = uuid.v4();
  var result;
  try {
    result = await sql.query(
      boilMSSQL(
        `INSERT INTO %db.[CallLogs] (fromUserId, toUserId, roomNumber)
         VALUES (${fromUserID}, ${toUserId}, '${roomID}')
        `,
      ),
    );
  } catch (error) {
    console.error("\nCouldn't insert the message to database: ", error);
  }

  let fromStatus,
    toStatus = null;

  try {
    fromStatus = await sql.query(
      boilMSSQL(
        `UPDATE %db.[Users] SET CallStatus = 'Calling', CallNumber = '${roomID}' WHERE Mobile = ${
          data.from_user
        };`,
      ),
    );
  } catch (error) {
    console.error("\nCouldn't update from user's call status: ", error);
  }
  try {
    toStatus = await sql.query(
      boilMSSQL(
        `UPDATE %db.[Users] SET CallStatus = 'Ringing', CallNumber = '${roomID}' WHERE Mobile = ${
          data.to_user
        };`,
      ),
    );
  } catch (error) {
    console.error("\nCouldn't update to user's call status: ", error);
  }

  socket.emit('call response', {
    room_id: roomID,
    from_number: data.from_user,
    to_number: data.to_user,
    from_status: fromStatus.rowsAffected[0] == 1 ? 'Calling' : 'Available',
    to_status: toStatus.rowsAffected[0] == 1 ? 'Ringing' : 'Available',
    type: 'request',
  } as CallResponse);
};
