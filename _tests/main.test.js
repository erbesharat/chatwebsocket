import test from 'ava';
const io = require('socket.io-client');

test('It should test request listener', async t => {
  const request = {
    user_id: 1,
    recipient_id: 1,
  };

  const socket = io.connect('http://localhost:4000');
  socket.emit('request', request);
  await new Promise((resolve, reject) => {
    socket.on('request response', function(msg) {
      if (msg.includes('joined to')) {
        resolve();
        t.pass();
      } else {
        reject();
        t.fail("couldn't join to any rooms");
      }
    });
  });
});

test('It should send a message to a room', async t => {
  const request = {
    user_id: 1,
    recipient_id: 1,
    room_title: '44287328-7bc4-4db8-ac15-82df061e4f58',
    message: 'Testing Message!',
  };

  const socket = io.connect('http://localhost:4000');
  socket.emit('request', request);
  await new Promise((resolve, reject) => {
    socket.on('request response', function(msg) {
      if (msg.includes('joined to')) {
        resolve();
      } else {
        reject();
        t.fail("couldn't join to any rooms");
      }
    });
  });

  socket.emit('send', request);
  await new Promise(resolve => {
    socket.on('send message to room', function(data) {
      t.pass();
      resolve();
    });
  });
});
