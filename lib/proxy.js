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

  ghost.on('error', e => proxy.emit('error', e));
  ghost._clients = {};
  ghost._sessions = {};
  ghost._snakeoil = snakeoil(options);

  proxy._ghost = ghost;

  return proxy;
}

function proxyOnRequest(proxy, requestListener) {
  return function proxyOnRequest_(req, res) {
    var opts = url.parse(req.url);
    opts.headers = req.headers;

    const fwd = forward(proxy, req, res, requestListener);
    const target = http.request(opts, fwd);
    target.on('error', error => {
      error.request = req;
      error.response = res;
      proxy.emit('error', error);
    });
    req.pipe(target);
  };
}

function ghostOnRequest(ghost, requestListener) {
  return function ghostOnRequest_(req, res) {
    var opts = url.parse(ghost._clients[req.socket.remotePort] + req.url);
    req.originalUrl = url.format(opts);
    opts.headers = req.headers;
    opts.agent = ghost._sessions[opts.hostname].agent;

    const fwd = forward(ghost, req, res, requestListener);
    const target = https.request(opts, fwd);
    target.on('error', error => {
      error.request = req;
      error.response = res;
      ghost.emit('error', error);
    });
    req.pipe(target);
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

function forward(instance, req, res, requestListener) {
  return function forward_(tRes) {
    res.statusCode = tRes.statusCode;
    res.statusMessage = tRes.statusMessage;
    res.headers = tRes.headers;

    req.transform = transform(req);
    res.transform = transform(res);

    requestListener.call(instance, req, res);
    res.writeHead(res.statusCode, res.statusMessage, res.headers);

    tRes.pipe(res);
  };
}

function transform(instance) {
  return function transform_(stream) {
    instance.once('pipe', source => {
      source.unpipe(instance);
      source.pipe(stream).pipe(instance);
    });
  };
}
