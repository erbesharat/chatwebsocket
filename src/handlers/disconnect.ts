import { Socket } from 'socket.io';
import { socketServer, sql } from '../server';
import { boilMSSQL } from '../utils/mssql';
import moment from 'moment-jalaali';

export default (socket: Socket, perm) => async data => {
  console.log(
    '\n\n===Disconnect Query===\n\n',
    boilMSSQL(
      `UPDATE %db.[Users] SET IsOnline = 0, lastSeen = '${moment().format(
        'jYYYY/jM/jD HH:mm',
      )}' WHERE id = ${perm.user_id};`,
    ),
  );
  const result = await sql.query(
    boilMSSQL(
      `UPDATE %db.[Users] SET IsOnline = 0, lastSeen = '${moment().format(
        'jYYYY/jM/jD HH:mm',
      )}' WHERE id = ${perm.user_id};`,
    ),
  );
};
