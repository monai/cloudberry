'use strict';

const net = require('net');
const url = require('url');
const http = require('http');
const https = require('https');

const snakeoil = require('./snakeoil');
const pkg = require('../package.json');

const defaults = {
  key: null,
  cert: null,
  tls: {}
};

const connectHeader = [
  'HTTP/1.1 200 Connection Established',
  `proxy-agent: ${pkg.name}/${pkg.version}`,
  '', ''
].join('\r\n');

module.exports = proxy;

function proxy(options, responseCb, requestCb) {
  if (typeof requestCb !== 'function') {
    requestCb = function () {};
  }

  if (typeof responseCb !== 'function') {
    responseCb = function () {};
  }

  options = Object.assign({}, defaults, options);
  const ghostOptions = Object.assign({}, defaults.tls, options.tls || {});

  const ghost = https.createServer(ghostOptions);
  ghost.on('request', ghostOnRequest(ghost, responseCb, requestCb));
  ghost.listen();

  const proxy = http.createServer();
  proxy.on('request', proxyOnRequest(proxy, responseCb, requestCb));
  proxy.on('connect', proxyOnConnect(ghost));

  ghost.on('error', e => proxy.emit('error', e));
  ghost._clients = {};
  ghost._sessions = {};
  ghost._snakeoil = snakeoil(options);

  proxy._ghost = ghost;

  return proxy;
}

function proxyOnRequest(proxy, responseCb, requestCb) {
  return function proxyOnRequest_(req, res) {
    var opts = url.parse(req.url);
    opts.headers = req.headers;

    req.transform = transformReq(req);
    requestCb.call(proxy, req, res);

    const fwd = forward(proxy, req, res, responseCb);
    const target = http.request(opts, fwd);
    target.on('error', error => {
      error.request = req;
      error.response = res;
      proxy.emit('error', error);
    });

    if (req._transform) {
      req.pipe(req._transform).pipe(target);
    } else {
      req.pipe(target);
    }
  };
}

function ghostOnRequest(ghost, responseCb, requestCb) {
  return function ghostOnRequest_(req, res) {
    var opts = url.parse(ghost._clients[req.socket.remotePort] + req.url);
    req.originalUrl = url.format(opts);
    opts.headers = req.headers;
    opts.agent = ghost._sessions[opts.hostname].agent;

    req.transform = transformReq(req);
    requestCb.call(proxy, req, res);

    const fwd = forward(ghost, req, res, responseCb);
    const target = https.request(opts, fwd);
    target.on('error', error => {
      error.request = req;
      error.response = res;
      ghost.emit('error', error);
    });

    if (req._transform) {
      req.pipe(req._transform).pipe(target);
    } else {
      req.pipe(target);
    }
  };
}

function proxyOnConnect(ghost) {
  return function proxyOnConnect_(req, client, header) {
    const [ hostname, port ] = req.url.split(':');
    const reqUrl = 'https://'+ (port === '443' ? hostname : req.url);

    if ( ! (hostname in ghost._sessions)) {
      const keyCrt = ghost._snakeoil.generate(hostname);
      const agent = new https.Agent({ keepAlive: true });

      ghost.addContext(hostname, keyCrt);
      ghost._sessions[hostname] = { agent };
    }

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

function forward(instance, req, res, responseCb) {
  return function forward_(tRes) {
    res.statusCode = tRes.statusCode;
    res.statusMessage = tRes.statusMessage;
    res.headers = tRes.headers;
    res.transform = transformRes(res);

    responseCb.call(instance, req, res);
    res.writeHead(res.statusCode, res.statusMessage, res.headers);
    tRes.pipe(res);
  };
}

function transformRes(instance) {
  return function transformRes_(stream) {
    instance.once('pipe', source => {
      source.unpipe(instance);
      source.pipe(stream).pipe(instance);
    });
  };
}

function transformReq(instance) {
  return function transformReq_(stream) {
    instance._transform = stream;
  };
}
