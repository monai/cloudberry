const fs = require('fs');
const net = require('net');
const url = require('url');
const http = require('http');
const https = require('https');

const defaults = {
  host: '127.0.0.1',
  port: 8000
};

const cert = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

module.exports = {
  create: create
};

function create(options, requestListener) {
  options = Object.assign({}, defaults, options);

  const proxy = http.createServer();
  proxy.listen(options.port, options.host);
  proxy.on('request', proxyOnRequest(requestListener);
  proxy.on('connect', proxyOnConnect(proxy));

  const ghost = https.createServer();
  ghost.on('request', ghostOnRequest(ghost));
  ghost.listen();

  proxy._ghost = ghost;

  return proxy;
}

function proxyOnRequest(requestListener) {
  return function proxyOnRequest_(req, res) {
    var opts = url.parse(req.url);
    opts.headers = req.headers;

    const target = http.request(opts, (tRes) => {
      requestListener() // ?????

      res.writeHead(tRes.statusCode, tRes.statusMessage, tRes.headers);
      tRes.pipe(res);
    });

    req.pipe(target);
  }
}

function ghostOnRequest(instance) {
  return function ghostOnRequest_(req, res) {
    var opts = url.parse(req.url);
    Object.assign(opts, instance._ghosts[req.socket.remotePort]);
    opts.headers = req.headers;

    const target = https.request(opts, (tRes) => {
      res.writeHead(tRes.statusCode, tRes.statusMessage, tRes.headers);
      tRes.pipe(res);
    });

    req.pipe(target);
  }
}
