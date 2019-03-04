import requestHandler from './request';
import sendHandler from './send';
import updateLastSeenHandler from './update-last-seen';
import statusHandler from './status';
import callHandler from './call';
import callResponseHandler from './callResponse';

export default {
  request: requestHandler,
  send: sendHandler,
  'update last seen': updateLastSeenHandler,
  status: statusHandler,
  call: callHandler,
  'call response': callResponseHandler,
};
