import requestHandler from './request';
import sendHandler from './send';
import updateLastSeenHandler from './update-last-seen';
import statusHandler from './status';

export default {
  request: requestHandler,
  send: sendHandler,
  'update last seen': updateLastSeenHandler,
  status: statusHandler,
};
