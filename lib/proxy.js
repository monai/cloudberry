'use strict';

const net = require('net');
const tls = require('tls');
const url = require('url');
const http = require('http');
const https = require('https');

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
proxy.request = request;

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

function request(ca) {
  return (req, res) => {
    const reqUrl = new url.URL(req.url);
    reqUrl.method = req.method;
    reqUrl.host = req.headers.host;
    const { request: request_ } = req.client.ssl ? https : http;

    const ctx = tls.createSecureContext();
    ctx.context.addRootCerts();
    ctx.context.addCACert(ca.cert);
    reqUrl.secureContext = ctx;

    const tReq = request_(reqUrl, (tRes) => {
      res.writeHead(tRes.statusCode, tRes.statusMessage, tRes.headers);
      tRes.pipe(res);
    });

    Object.keys(req.headers).forEach((h) => {
      tReq.setHeader(h, req.headers[h]);
    });

    req.pipe(tReq);

    return tReq;
  };
}
