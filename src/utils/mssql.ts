export const boilMSSQL = query => [
  query
    .replace(/%db/g, '[WellinnoApiDBTestWebsocket].[dbo]')
    .replace(/%table/g, 'dbo'),
];
