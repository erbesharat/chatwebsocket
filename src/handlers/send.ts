import { Socket } from 'socket.io';
import { Message, User } from '../types';
import { boilMSSQL } from '../utils/mssql';
import { socketServer, sql } from '../server';
import { O_SYMLINK } from 'constants';
import moment from 'moment-jalaali';

export default (socket: Socket) => async (data: Message) => {
  const result = await sql.query(
    boilMSSQL(`SELECT * FROM %db.[rooms] WHERE title = '${data.room_title}';`),
  );
  console.log('\n(SEND MESSAGE) Room Object: \n' + result);

  if (result.rowsAffected[0] === 0) {
    console.log('\n(SEND MESSAGE) Room does not exist');
    socket.emit(
      'logs response',
      `[error]: room ${data.room_title} doesn't exist`,
    );
    return false;
  }

  console.log('\n\nResult:\n', result);

  let user;
  // Charge user
  try {
    user = await sql.query(
      boilMSSQL(`SELECT * FROM %db.[Users] WHERE id = ${data.user_id};`),
    );
  } catch (error) {
    socket.emit('logs response', {
      type: 'send',
      error: {
        message: "Couldn't find the user",
      },
    });
    return;
  }

  let messagePrice = data.message.length * parseFloat(process.env.TEXT_RATE);

  if (user.recordset[0].charge! >= messagePrice) {
    socket.emit('logs response', {
      type: 'send',
      error: {
        code: 422,
        message: 'Not enough credit',
      },
    });
    return;
  }

  const { id, user_id, recipient_id } = result.recordset[0];
  if (user_id != data.user_id && recipient_id != data.user_id) {
    console.log('\n(SEND MESSAGE) Something is wrong with ids!\n');
    console.log(
      '\n(SEND MESSAGE) IDs: !\n' + id + ',' + user_id + ',' + recipient_id,
    );
    console.log(
      `\nExpected: [${user_id},${recipient_id}] - ${user_id != data.user_id},
      Got: [${data.user_id}]\n - ${recipient_id != data.user_id}`,
    );
    socket.emit(
      'logs response',
      `[error]: user doesn't belong to room ${data.room_title}`,
    );
    return false;
  }

  try {
    console.log('\n(SEND MESSAGE) Goest to create the message in DB!\n');
    await sql.query(
      boilMSSQL(
        `INSERT INTO %db.[chat_messages] (author_id, room_id, text, created_at)
         VALUES ('${data.user_id}', ${id}, '${
          data.message
        }', '${moment().format('jYYYY/jM/jD HH:mm')}')
        `,
      ),
    );
  } catch (error) {
    console.error("\nCouldn't insert the message to database: ", error);
  }

  try {
    await sql.query(
      boilMSSQL(
        `UPDATE %db.[Users] SET charge = ${user.recordset[0].charge -
          messagePrice} WHERE Id = ${data.user_id};`,
      ),
    );
  } catch (error) {
    console.error(`Couldn't charge the user with Id ${data.user_id}`);
    socket.emit('logs response', {
      type: 'send',
      error: {
        code: 522,
        message: `Couldn't charge the user with Id ${data.user_id}`,
      },
    });
  }

  socketServer.emit('receive', data);
};
