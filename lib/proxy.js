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
  server.on('connect', onConnect(server, options));
  server.on('request', onRequest(server, options));

  return server;
}

function onConnect(server, options) {
  return (req, res) => {
    if (options.lookupUpstreamCertificate) {
      // TODO: what if req.url (authority) and req.headers.host are different?
      lookupCertificate(req.url, (error, certificate) => {
        if (error) {
          server.emit('error', error);
        } else {
          options.proxyAgent.emit('certificate', certificate, req.url, req.headers, req.socket);

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
