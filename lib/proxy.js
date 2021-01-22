'use strict';

const http = require('http');

const lookupCertificate = require('./lookupCertificate');
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
      lookupCertificate(req, (error, certificate) => {
        if (error) {
          this.emit('error', error);
        } else {
          options.proxyCA.emit('certificate', certificate, req.url, req.socket);

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
