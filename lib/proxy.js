'use strict';

const http = require('http');

const pkg = require('../package.json');

const defaults = {
  http: null,
  https: null,
};

const connectHeader = [
  'HTTP/1.1 200 Connection Established',
  `proxy-agent: ${pkg.name}/${pkg.version}`,
  '', '',
].join('\r\n');

module.exports = proxy;

function proxy(options) {
  options = { ...defaults, ...options };

  const server = http.createServer();
  server.on('connect', onConnect(options.https));
  server.on('request', onRequest(options.http));

  return server;
}

function onConnect(server) {
  return function onConnect_(req, res) {
    res.write(connectHeader);
    server.emit('connection', req.socket);
  };
}

function onRequest(server) {
  return function onRequest_(req, res) {
    server.emit('request', req, res);
  };
}
