import test from 'ava';
import socketIO from 'socket.io-client';
import { RequestJoin, Message, JoinMessage } from '../src/types';
import delay from '../src/utils/delay';

const handleJoin = (t, socket): Promise<JoinMessage> =>
  new Promise((resolve, reject) => {
    socket.on('request response', msg => {
      if (msg.success) {
        resolve(msg);
      } else {
        reject();
        t.fail("couldn't join to any rooms");
      }
    });
  });

const receiveHandler = (t, socket) =>
  new Promise(resolve => {
    socket.on('receive', (msg: Message) => {
      resolve();
    });
  });

test('It should join room', async t => {
  const socket = socketIO.connect('https://wellinnochat.herokuapp.com');
  const request: RequestJoin = {
    user_id: 1,
    recipient_id: 1,
  };

  socket.emit('request', request);
  await handleJoin(t, socket);

  t.pass();
  socket.close();
});

test('It should send a message to a new room', async t => {
  const socket = socketIO.connect('http://wellinnochat.herokuapp.com');
  const request: RequestJoin = {
    user_id: 1,
    recipient_id: 1,
  };

  socket.emit('request', request);
  const { room_title } = await handleJoin(t, socket);

  const message: Message = {
    user_id: request.user_id,
    room_title,
    message: 'Testing Message!',
  };

  socket.emit('send', message);
  await receiveHandler(t, socket);

  t.pass();
  socket.close();
});

test('It should send a message to the active room', async t => {
  const socket = socketIO.connect('http://wellinnochat.herokuapp.com');
  const request: RequestJoin = {
    user_id: 1,
    recipient_id: 1,
  };

  socket.emit('request', request);
  const { room_title } = await handleJoin(t, socket);

  const message: Message = {
    user_id: request.user_id,
    room_title,
    message: 'Testing Message!',
  };

  socket.emit('send', message);
  await receiveHandler(t, socket);
  t.pass();
  socket.close();
});

test('It should receive message in the active room', async t => {
  const user = socketIO.connect('http://wellinnochat.herokuapp.com');
  const recipient = socketIO.connect('http://wellinnochat.herokuapp.com');
  const request: RequestJoin = {
    user_id: 1,
    recipient_id: 2,
  };

  user.emit('request', request);
  recipient.emit('request', request);
  const [{ room_title }] = await Promise.all([
    handleJoin(t, user),
    handleJoin(t, recipient),
  ]);

  const message: Message = {
    user_id: request.user_id,
    room_title,
    message: 'Testing Message!',
  };

  user.emit('send', message);
  await receiveHandler(t, recipient);

  t.pass();
  user.close();
  recipient.close();
});

test('It should not receive message in other rooms', async t => {
  const user = socketIO.connect('http://wellinnochat.herokuapp.com');
  const recipient = socketIO.connect('http://wellinnochat.herokuapp.com');
  const notReceiver = socketIO.connect('http://wellinnochat.herokuapp.com');
  const request: RequestJoin = {
    user_id: 1,
    recipient_id: 1,
  };
  const alternativeReqeust: RequestJoin = {
    user_id: 1,
    recipient_id: 2,
  };

  user.emit('request', request);
  recipient.emit('request', request);
  notReceiver.emit('request', alternativeReqeust);
  const [{ room_title }] = await Promise.all([
    handleJoin(t, user),
    handleJoin(t, recipient),
    handleJoin(t, notReceiver),
  ]);

  const message: Message = {
    user_id: request.user_id,
    room_title,
    message: 'Testing Message!',
  };

  user.emit('send', message);
  notReceiver.on('receive', () => {
    t.fail("Received message that doesn't belong to the room");
  });

  await delay(2000);
  t.pass();

  user.close();
  recipient.close();
  notReceiver.close();
});
