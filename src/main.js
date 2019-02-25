const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const sql = require('mssql');
const uuid = require('uuid');

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/static/pages/index.html');
});

const boilMSSQL = query => [
  query.replace(/%db/g, '[WellinnoApiDBTestWebsocket]'),
];

function handleWebsocket(socket) {
  //
  // ─── SOCKET EVENTS ──────────────────────────
  //

  // ********** Request Model **********
  //  {
  //    "user_id": int,
  //    "recipient_id": int,
  //  }
  // ***********************************
  socket.on('request', async function(data) {
    const result = await sql.query(
      boilMSSQL(
        `SELECT * FROM %db.[dbo].[rooms] WHERE user_id = ${
          data.user_id
        } AND recipient_id = ${data.recipient_id};`,
      ),
    );
    if (result.rowsAffected < 1) {
      const roomID = uuid.v4();
      const insertResult = await sql.query(
        boilMSSQL(
          `INSERT INTO %db.[dbo].[rooms] (title, user_id, recipient_id)
          VALUES ('${roomID}', ${data.user_id}, ${data.recipient_id})
          `,
        ),
      );
      socket.join(roomID);
      socket.emit('request response', 'joined to ' + roomID);
    } else {
      socket.join(result.recordset[0].title);
      socket.emit('request response', 'joined to ' + result.recordset[0].title);
    }
  });
}

async function startServer() {
  await sql.connect(
    'mssql://Erfan:34uxwp7Mco7@185.211.57.185/WellinnoApiDBTestWebsocket',
  );
  io.on('connection', handleWebsocket);
  http.listen(4000, function() {
    console.log('listening on *:4000');
  });
}

startServer();
