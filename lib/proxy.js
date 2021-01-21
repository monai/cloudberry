'use strict';

const tls = require('tls');
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
  server.on('connect', onConnect(options));
  server.on('request', onRequest(options));

  return server;
}

function onConnect({ https, certificateJar }) {
  return function onConnect_(req, res) {
    const [host, port] = req.url.split(':');
    const socket = tls.connect({
      port,
      host,
      servername: host,
    });

    socket.on('secureConnect', () => {
      certificateJar.emit('certificate', socket.getPeerCertificate());
      socket.end();

      res.write(connectHeader);
      https.emit('connection', req.socket);
    });

    socket.on('error', (error) => this.emit('error', error));
  };
}

function onRequest({ http: http_ }) {
  return function onRequest_(req, res) {
    http_.emit('request', req, res);
  };
}
