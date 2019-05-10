import { Socket } from 'socket.io';
import { Call, CallRequest, CallResponse, GlobalData } from '../types';
import { socketServer, sql } from '../server';
import { boilMSSQL } from '../utils/mssql';
import uuid from 'uuid';
import moment from 'moment-jalaali';

export default (socket: Socket, _, global: GlobalData) => async (
  data: Call,
) => {
  const fromUser = await sql.query(
    boilMSSQL(`SELECT * FROM %db.[Users] WHERE Id = '${data.from_user}';`),
  );
  let { Id } = fromUser.recordset[0];
  const fromUserID = Id;

  const toUser = await sql.query(
    boilMSSQL(`SELECT * FROM %db.[Users] WHERE Id = '${data.to_user}';`),
  );
  const toUserId = toUser.recordset[0].Id;

  if (!global.users[data.to_user]) {
    if (
      !(
        fromUser.recordset[0].IsOnline &&
        fromUser.recordset[0].CallStatus == 'Available'
      ) &&
      !(
        toUser.recordset[0].IsOnline &&
        toUser.recordset[0].CallStatus == 'Available'
      )
    ) {
      socket.emit('call response', {
        type: 'error',
        message: 'Users are not available',
      });
      return;
    }
  }

  // Get users deatils
  const fromDetails = await sql.query(
    boilMSSQL(
      `SELECT * FROM %db.[UserDetails] WHERE UserId = ${data.from_user};`,
    ),
  );
  const toDetails = await sql.query(
    boilMSSQL(
      `SELECT * FROM %db.[UserDetails] WHERE UserId = ${data.to_user};`,
    ),
  );

  const roomID = uuid.v4();
  var result;
  try {
    result = await sql.query(
      boilMSSQL(
        `INSERT INTO %db.[CallLogs] (fromUserId, toUserId, roomNumber, modifiedDateTime)
         VALUES (${fromUserID}, ${toUserId}, '${roomID}', '${moment().format(
          'YYYY-MM-DD HH:mm',
        )}')
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
        `UPDATE %db.[Users] SET CallStatus = 'Calling', CallNumber = '${roomID}' WHERE Id = ${
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
        `UPDATE %db.[Users] SET CallStatus = 'Ringing', CallNumber = '${roomID}' WHERE Id = ${
          data.to_user
        };`,
      ),
    );
  } catch (error) {
    console.error("\nCouldn't update to user's call status: ", error);
  }

  socket.emit('call response', {
    room_id: roomID,
    from_id: data.from_user,
    to_id: data.to_user,
    from_status: fromStatus.rowsAffected[0] == 1 ? 'Calling' : 'Available',
    to_status: toStatus.rowsAffected[0] == 1 ? 'Ringing' : 'Available',
    from_avatar: fromDetails.recordset[0].ImageAddress
      ? fromDetails.recordset[0].ImageAddress
      : '#',
    to_avatar: toDetails.recordset[0].ImageAddress
      ? toDetails.recordset[0].ImageAddress
      : '#',
    from_name: fromDetails.recordset[0].FullName
      ? toDetails.recordset[0].FullName
      : '',
    to_name: toDetails.recordset[0].FullName
      ? toDetails.recordset[0].FullName
      : '',
    call_type: data.type,
    type: 'request',
  } as CallResponse);
};

// {
//   error: {
//     message: "sdsadasd",
//   }
// }

// TODO: Check status - Available - isOnline
