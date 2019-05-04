import { Socket } from 'socket.io';
import { socketServer, sql } from '../server';
import { boilMSSQL } from '../utils/mssql';
import moment from 'moment-jalaali';

export default (socket: Socket, perm) => async data => {
  if (perm.user_id != null) {
    const result = await sql.query(
      boilMSSQL(
        `UPDATE %db.[Users] SET IsOnline = 0, lastSeen = '${moment().format(
          'YYYY-MM-DD HH:mm',
        )}' WHERE id = ${perm.user_id};`,
      ),
    );
  }
};
