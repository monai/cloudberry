'use strict';

const http = require('http');

const pkg = require('../package.json');

const connectHeader = [
  'HTTP/1.1 200 Connection Established',
  `proxy-agent: ${pkg.name}/${pkg.version}`,
  '', '',
].join('\r\n');

module.exports = proxy;

function proxy(options) {
  const server = http.createServer();
  server.on('connect', onConnect(server, options));
  server.on('request', onRequest(server, options));

  return server;
}

function onConnect(server, options) {
  return (req, res) => {
    if (options.beforeConnectionCallback) {
      options.beforeConnectionCallback.call(server, req, res, (error) => {
        if (error) {
          server.emit('error', error);
        } else {
          res.write(connectHeader);
          options.https.emit('connection', req.socket);
        }
      });
    } else {
      res.write(connectHeader);
      options.https.emit('connection', req.socket);
    }
  };
}

function onRequest(server, options) {
  return (req, res) => {
    options.http.emit('request', req, res);
  };
}
