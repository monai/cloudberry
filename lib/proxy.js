'use strict';

const pkg = require('../package.json');

const connectHeader = [
  'HTTP/1.1 200 Connection Established',
  `proxy-agent: ${pkg.name}/${pkg.version}`,
  '', '',
].join('\r\n');

module.exports = proxy;

function proxy(options) {
  const { server, secureServer } = options;

  server.on('connect', onConnect(server, secureServer, options));
  secureServer.on('request', (req, res) => server.emit('request', req, res));

  return server;
}

function onConnect(server, secureServer, options) {
  return (req, res) => {
    if (options.beforeConnectionCallback) {
      options.beforeConnectionCallback.call(server, req, res, (error) => {
        if (error) {
          server.emit('error', error);
        } else {
          res.write(connectHeader);
          secureServer.emit('connection', req.socket);
        }
      });
    } else {
      res.write(connectHeader);
      secureServer.emit('connection', req.socket);
    }
  };
}
