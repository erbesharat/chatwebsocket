import { Socket } from 'socket.io';
import { socketServer, sql } from '../server';
import { boilMSSQL } from '../utils/mssql';

import requestHandler from './request';
import sendHandler from './send';
import updateLastSeenHandler from './update-last-seen';
import statusHandler from './status';
import callHandler from './call';
import callResponseHandler from './callResponse';
import userProfileHandler from './userProfile';
import userChatListHandler from './chatList';
import callAnswerHandler from './callAnswer';
import disconnectHandler from './disconnect';

let UserID;

export default {
  request: requestHandler,
  send: sendHandler,
  'update last seen': updateLastSeenHandler,
  status: statusHandler,
  call: callHandler,
  'call response': callResponseHandler,
  'user profile': userProfileHandler,
  'user list': userChatListHandler,
  'call answer': callAnswerHandler,
  disconnect: disconnectHandler,
  refresh: (socket: Socket) => async data => {
    socketServer.to(data.room_title).emit('user response', {
      type: 'status',
      refresh: true,
    });
  },
};
