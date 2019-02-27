export const boilMSSQL = query => [
  query.replace(/%db/g, '[WellinnoApiDBTestWebsocket].[dbo]'),
];
