'use strict';

const net = require('net');
const url = require('url');
const http = require('http');
const https = require('https');

const ca = require('./ca');
const keychain = require('./keychain');
const server = require('./server');
const util = require('./util');
const pkg = require('../package.json');

const defaults = {
  http: null,
  https: null
};

const CONNECT = new Buffer('CONNECT');
const connectHeader = [
  'HTTP/1.1 200 Connection Established',
  `proxy-agent: ${pkg.name}/${pkg.version}`,
  '', ''
].join('\r\n');

module.exports = proxy;
proxy.request = request;
proxy.ca = ca;
proxy.keychain = keychain;
proxy.createServer = server;

function proxy(options) {
  options = Object.assign({}, defaults, options);

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
      var buff = client.read(7);
      if (buff && buff.equals(CONNECT)) {
        /* jshint -W116 */
        while (client.read());
        /* jshint +W116 */
        client.write(connectHeader);
        server.https.emit('connection', client);
      } else {
        client.unshift(buff);
        server.http.emit('connection', client);
      }
    }
  };
}

function request(req, res) {
  const reqUrl = url.parse(req.url);
  reqUrl.method = req.method;
  reqUrl.host = req.headers.host;
  // reqUrl.headers = util.rawToHeaders(req.rawHeaders);
  const _request = req.client.ssl ? https.request : http.request;

  const tReq = _request(reqUrl, tRes => {
    setHeaders(res, tRes.rawHeaders);
    res.writeHead(tRes.statusCode, tRes.statusMessage);
    tRes.pipe(res);
  });

  setHeaders(tReq, req.rawHeaders);
  req.pipe(tReq);

  return tReq;
}

function setHeaders(msg, headers) {
  const names = {};
  const normalized = {};
  for (let i = 0, l = headers.length; i < l; i += 2) {
    let name = headers[i];
    http.IncomingMessage.prototype._addHeaderLine(name, headers[i + 1], normalized);
    names[name.toLowerCase()] = name;
  }

  Object.keys(normalized).forEach(key => {
    msg.setHeader(names[key], normalized[key]);
  });
}
