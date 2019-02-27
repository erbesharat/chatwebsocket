import { app, socketServer, server, sql } from './server';
import socketHandlers from './handlers';

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/static/pages/index.html');
});

function handleWebsocket(socket) {
  Object.keys(socketHandlers).forEach(event =>
    socket.on(event, socketHandlers[event](socket)),
  );
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
