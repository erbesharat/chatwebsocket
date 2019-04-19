export const boilMSSQL = query => [
  query
    .replace(/%db/g, `[${process.env.DB_NAME}].[dbo]`)
    .replace(/%table/g, 'dbo'),
];
