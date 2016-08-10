'use strict';

const net = require('net');
const url = require('url');
const http = require('http');
const https = require('https');

const snakeoil = require('./snakeoil');
const pkg = require('../package.json');

const defaults = {
  tls: {
    key: snakeoil.key,
    cert: snakeoil.cert
  }
};

const connectHeader = [
  'HTTP/1.1 200 Connection Established',
  `proxy-agent: ${pkg.name}/${pkg.version}`,
  '', ''
].join('\r\n');

module.exports = proxy;

function proxy(options, requestListener) {
  if (typeof options === 'function') {
    requestListener = options;
    options = {};
  }

  if (arguments.length === 0) {
    requestListener = function () {};
  }

  options = Object.assign({}, defaults, options);
  const ghostOptions = Object.assign({}, defaults.tls, options.tls || {});

  const ghost = https.createServer(ghostOptions);
  ghost.on('request', ghostOnRequest(ghost, requestListener));
  ghost.listen();

  const proxy = http.createServer();
  proxy.on('request', proxyOnRequest(proxy, requestListener));
  proxy.on('connect', proxyOnConnect(ghost));

  ghost._clients = {};
  proxy._ghost = ghost;

  return proxy;
}

function proxyOnRequest(proxy, requestListener) {
  return function proxyOnRequest_(req, res) {
    var opts = url.parse(req.url);
    opts.headers = req.headers;

    const fwd = forward(proxy, req, res, requestListener);
    const target = http.request(opts, fwd);
    req.pipe(target);
  };
}

function ghostOnRequest(ghost, requestListener) {
  return function ghostOnRequest_(req, res) {
    var opts = url.parse(req.url);
    Object.assign(opts, ghost._clients[req.socket.remotePort]);
    req.originalUrl = url.format(opts);
    opts.headers = req.headers;

    const fwd = forward(ghost, req, res, requestListener);
    const target = https.request(opts, fwd);
    req.pipe(target);
  };
}

function proxyOnConnect(ghost) {
  return function proxyOnConnect_(req, client, header) {
    const reqUrl = url.parse('https://'+ req.url);

    client.write(connectHeader);

    const target = net.connect(ghost.address());
    target.write(header);
    target.pipe(client);
    client.pipe(target);

    target.on('connect', () => {
      ghost._clients[target.localPort] = reqUrl;
    });

    client.on('end', () => {
      delete ghost._clients[target.localPort];
    });
  };
}

function forward(instance, req, res, requestListener) {
  return function forward_(tRes) {
    res.statusCode = tRes.statusCode;
    res.statusMessage = tRes.statusMessage;
    res.headers = tRes.headers;

    requestListener.call(instance, req, res);
    res.writeHead(res.statusCode, res.statusMessage, res.headers);
    tRes.pipe(res);
  };
}
