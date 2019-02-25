import test from 'ava';
const io = require('socket.io-client');

test('It should test check listener', async t => {
  const request = {
    user_id: 1,
    recipient_id: 1,
  };

  const socket = io.connect('http://localhost:4000');
  socket.emit('request', request);
  await new Promise((resolve, reject) => {
    socket.on('request response', function(msg) {
      console.log(msg);
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
  socket.emit('send', request);
  await new Promise((resolve, reject) => {
    socket.on('receive', function(data) {
      t.log(data);
      resolve();
      t.fail(data);
    });
  });
});
