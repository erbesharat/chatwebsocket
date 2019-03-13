import { app, socketServer, server, sql } from './server';
import socketHandlers from './handlers';

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/static/pages/index.html');
});

function handleWebsocket(socket) {
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
      return socketHandlers[event](socket)(msg);
    });
    console.log('Regsitered', event);
  });
}

async function startServer() {
  try {
    await sql.connect(
      `mssql://${process.env.DB_USER}:${process.env.DB_PASS}@${
        process.env.DB_HOST
      }/${process.env.DB_NAME}`,
    );
    socketServer.on('connection', socket => {
      console.log('connected');
      handleWebsocket(socket);
    });
    server.listen(process.env.PORT, function() {
      console.log(`listening on *:${process.env.PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
}

startServer();
