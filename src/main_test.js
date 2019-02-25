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
