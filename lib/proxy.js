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

function onConnect(options) {
  return (req, res) => {
    if (options.lookupUpstreamCertificate) {
      lookupUpstreamCertificate(req, (error, certificate) => {
        if (error) {
          this.emit('error', error);
        } else {
          options.certificateJar.emit('certificate', [req.url, certificate]);

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

function onRequest(options) {
  return (req, res) => {
    options.http.emit('request', req, res);
  };
}

function lookupUpstreamCertificate(req, done) {
  const [host, port] = req.url.split(':');
  const socket = tls.connect({
    port,
    host,
    servername: host,
  });

  let isDone = false;

  socket.on('secureConnect', () => {
    if (!isDone) {
      done(null, socket.getPeerCertificate());
      socket.end();
      isDone = true;
    }
  });

  socket.on('error', (error) => {
    if (!isDone) {
      done(error);
      isDone = true;
    }
  });
}
