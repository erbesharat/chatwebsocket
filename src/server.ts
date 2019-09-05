const express = require('express');
const http = require('http');
const https = require('https');
const socketIO = require('socket.io');
const fs = require('fs');
export const sql = require('mssql');

const privateKey = fs.readFileSync(__dirname + '/../private.key');
const certificate = fs.readFileSync(__dirname + '/../cert.crt');

export const app = express();
export const server = new http.Server(app);
export const sslserver = new https.Server(
  { key: privateKey, cert: certificate },
  app,
);
export const socketServer = socketIO(server);
