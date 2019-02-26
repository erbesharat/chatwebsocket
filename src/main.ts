import { Message, RequestJoin } from './types/message';

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const sql = require('mssql');
const uuid = require('uuid');

const app = express();
const server = new http.Server(app);
const socketServer = socketIO(server);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/static/pages/index.html');
});

const boilMSSQL = query => [
  query.replace(/%db/g, '[WellinnoApiDBTestWebsocket].[dbo]'),
];

function handleWebsocket(socket) {
  socket.on('request', async (data: RequestJoin) => {
    const result = await sql.query(
      boilMSSQL(
        `SELECT * FROM %db.[rooms] WHERE user_id = ${
          data.user_id
        } AND recipient_id = ${data.recipient_id};`,
      ),
    );

    if (!result.rowsAffected) {
      // Create room
      const roomID = uuid.v4();
      await sql.query(
        boilMSSQL(
          `INSERT INTO %db.[rooms] (title, user_id, recipient_id)
          VALUES ('${roomID}', ${data.user_id}, ${data.recipient_id})
          `,
        ),
      );

      socket.join(roomID);
      socket.emit('request response', 'joined to ' + roomID);
    } else {
      // Join room
      socket.join(result.recordset[0].title);
      socket.emit('request response', 'joined to ' + result.recordset[0].title);
    }
  });

  socket.on('send', async (data: Message) => {
    const result = await sql.query(
      boilMSSQL(
        `SELECT * FROM %db.[rooms] WHERE title = '${data.room_title}';`,
      ),
    );

    if (!result.rowsAffected) {
      socket.emit(
        'send response',
        `[error]: room ${data.room_title} doesn't exist`,
      );
      return false;
    } else if (
      result.recordset[0].user_id !== data.user_id ||
      result.recordset[0].recipient_id !== data.user_id
    ) {
      socket.emit(
        'send response',
        `[error]: user doesn't belong to room ${data.room_title}`,
      );
      return false;
    }

    // TODO: Save the message to DB
    socketServer.sockets.in(data.room_title).emit('send message to room', data);
    console.log('hola hola hola hola hola');
  });
}

async function startServer() {
  try {
    await sql.connect(
      'mssql://Erfan:34uxwp7Mco7@185.211.57.185/WellinnoApiDBTestWebsocket',
    );
    socketServer.on('connection', handleWebsocket);
    server.listen(4000, function() {
      console.log('listening on *:4000');
    });
  } catch (err) {
    console.error(err);
  }
}

startServer();
