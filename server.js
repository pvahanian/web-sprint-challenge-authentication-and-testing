const express = require('express');
const projectRouter = require('./auth/auth-router');
const server = express();

server.use(express.json());
server.use('/users', projectRouter);

module.exports = server;