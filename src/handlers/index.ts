import requestHandler from './request';
import sendHandler from './send';
import updateLastSeenHandler from './update-last-seen';
import statusHandler from './status';
import callHandler from './call';

export default {
  request: requestHandler,
  send: sendHandler,
  'update last seen': updateLastSeenHandler,
  status: statusHandler,
  call: callHandler,
};
