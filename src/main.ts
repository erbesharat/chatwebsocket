import { app, socketServer, server, sql } from './server';
import socketHandlers from './handlers';
import { GlobalData } from './types';

require('dotenv').config();

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/static/pages/index.html');
});

function handleWebsocket(socket, permanentData, globalData) {
  console.log(permanentData);
  console.log('Listeners', Object.keys(socketHandlers));
  Object.keys(socketHandlers).forEach(event => {
    socket.on(event, msg => {
      console.log(
        '\x1b[0m\x1b[47m\x1b[30mRECEIVED\x1b[0m\t',
        Date.now(),
        '\n\x1b[0m\x1b[47m\x1b[30mTYPE\x1b[0m\t\t',
        event,
        '\n\x1b[0m\x1b[47m\x1b[30mMESSAGE\x1b[0m\n',
        msg,
        '\n',
      );
      if (event !== 'disconnect' && typeof msg === 'string') {
        msg = JSON.parse(msg);
      }
      return socketHandlers[event](socket, permanentData, globalData)(msg);
    });
    console.log('Regsitered', event);
  });
}

async function startServer() {
  try {
    const globalData: GlobalData = {
      users: {},
    };

    await sql.connect(
      `mssql://${process.env.DB_USER}:${process.env.DB_PASS}@${
        process.env.DB_HOST
      }/${process.env.DB_NAME}`,
    );
    socketServer.on('connection', socket => {
      console.log('connected. ID: ' + socket.id);
      const permanentData = {};
      handleWebsocket(socket, permanentData, globalData);
    });
    server.listen(process.env.PORT, function() {
      console.log(`listening on *:${process.env.PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
}

startServer();
