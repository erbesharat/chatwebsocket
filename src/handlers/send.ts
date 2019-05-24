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
  let wellinnoShare = (messagePrice / 100) * 20;
  let medicalTeamShare = messagePrice - wellinnoShare;
  console.log('\n\n\t\t\t\t', messagePrice, '\t', user.recordset[0].charge);

  if (user.recordset[0].charge < messagePrice) {
    socket.emit('logs response', {
      type: 'send',
      error: {
        code: 422,
        message: 'Not enough credit',
      },
    });
    return;
  }

  const { Id, user_id, recipient_id } = result.recordset[0];
  try {
    console.log('\n(SEND MESSAGE) Goest to create the message in DB!\n');
    await sql.query(
      boilMSSQL(
        `INSERT INTO %db.[chat_message] (author_id, room_id, text, created_at, messagetypeid)
         VALUES ('${data.user_id}', ${Id}, N'${
          data.message
        }', '${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}', ${data.type_id})`,
      ),
    );
  } catch (error) {
    console.error("\nCouldn't insert the message to database: ", error);
  }

  if (user_id != data.user_id && recipient_id != data.user_id) {
    console.log('\n(SEND MESSAGE) Something is wrong with ids!\n');
    console.log(
      '\n(SEND MESSAGE) IDs: !\n' + Id + ',' + user_id + ',' + recipient_id,
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

  if (user.recordset[0].RoleId == 1) {
    // Create the transaction
    try {
      await sql.query(
        boilMSSQL(
          `INSERT INTO %db.[CalculatedBalances] (fromUserId, toUserId, UserUsedPrice, MedicalPercentPrice, WellinnoPercentPrice, logDateTime, messagetypeid)
          VALUES ('${
            data.user_id
          }', ${recipient_id}, ${messagePrice}, ${medicalTeamShare}, ${wellinnoShare}, '${moment().format(
            'YYYY-MM-DD HH:mm:ss.SSS',
          )}', ${data.type_id})`,
        ),
      );
      console.log('Create the transaction for message');
    } catch (error) {
      socketServer.emit('logs response', {
        type: 'error',
        message: `Couldn't create the transaction for user with Id ${
          data.user_id
        }`,
      });
    }
    // Decrease the credit
    try {
      await sql.query(
        boilMSSQL(
          `UPDATE %db.[Users] SET charge = ${user.recordset[0].charge -
            messagePrice} WHERE Id = ${data.user_id};`,
        ),
      );
      await sql.query(
        boilMSSQL(
          `UPDATE %db.[Users] SET charge = ${user.recordset[0].charge +
            medicalTeamShare} WHERE Id = ${recipient_id};`,
        ),
      );
    } catch (error) {
      console.error(`Couldn't charge the user with Id ${data.user_id}`);
      socket.emit('logs response', {
        type: 'error',
        message: `Couldn't charge the user with Id ${data.user_id}`,
      });
    }
  }

  // TODO: Get user data from permenanatData object and send response only to them

  socketServer.emit('receive', data);
};
