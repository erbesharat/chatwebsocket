const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
export const sql = require('mssql');

export const app = express();
export const server = new http.Server(app);
export const socketServer = socketIO(server);
