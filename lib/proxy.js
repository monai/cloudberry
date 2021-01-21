'use strict';

const net = require('net');

const pkg = require('../package.json');

const defaults = {
  http: null,
  https: null,
};

const CONNECT = Buffer.from('CONNECT');
const connectHeader = [
  'HTTP/1.1 200 Connection Established',
  `proxy-agent: ${pkg.name}/${pkg.version}`,
  '', '',
].join('\r\n');

module.exports = proxy;

function proxy(options) {
  options = { ...defaults, ...options };

  const server = net.createServer();
  server.on('connection', onConnection(server));
  server.http = options.http;
  server.https = options.https;

  return server;
}

function onConnection(server) {
  return function onConnection_(client) {
    client.once('readable', onReadable);

    function onReadable() {
      const buff = client.read(7);
      if (buff && buff.equals(CONNECT)) {
        while (client.read());
        client.write(connectHeader);
        server.https.emit('connection', client);
      } else {
        client.unshift(buff);
        server.http.emit('connection', client);
      }
    }
  };
}
