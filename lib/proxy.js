const fs = require('fs');
const net = require('net');
const url = require('url');
const http = require('http');
const https = require('https');

const defaults = {
  host: '127.0.0.1',
  port: 8000,
  tls: {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
  }
};

module.exports = {
  create: create
};

function create(options, requestListener) {
  options = Object.assign({}, defaults, options);
  const ghostOptions = Object.assign({}, defaults.tls, options.tls || {});

  const ghost = https.createServer(ghostOptions);
  ghost.on('request', ghostOnRequest(ghost, requestListener));
  ghost.listen();

  const proxy = http.createServer();
  proxy.listen(options.port, options.host);
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

    const target = http.request(opts, (tRes) => {
      res.writeHead(tRes.statusCode, tRes.statusMessage, tRes.headers);
      requestListener.call(proxy, req, res);
      tRes.pipe(res);
    });

    req.pipe(target);
  }
}

function ghostOnRequest(ghost, requestListener) {
  return function ghostOnRequest_(req, res) {
    var opts = url.parse(req.url);
    Object.assign(opts, ghost._clients[req.socket.remotePort]);
    opts.headers = req.headers;

    const target = https.request(opts, (tRes) => {
      res.writeHead(tRes.statusCode, tRes.statusMessage, tRes.headers);
      requestListener.call(ghost, req, res);
      tRes.pipe(res);
    });

    req.pipe(target);
  }
}

function proxyOnConnect(ghost) {
  return function proxyOnConnect_(req, client, header) {
    const resHeader = [
      'HTTP/1.1 200 Connection Established',
      'proxy-agent: proxy',
      '', ''
    ].join('\r\n');

    const [host, port] = req.url.split(':');
    const protocol = port == 443 ? 'https:' : 'http:';
    const reqUrl = { protocol, host, port };

    client.write(resHeader);

    const target = net.connect(ghost.address());
    target.write(header);
    target.pipe(client);
    client.pipe(target);

    target.on('connect', () => {
      ghost._clients[target.localPort] = reqUrl;
    })

    client.on('end', () => {
      delete ghost._clients[target.localPort];
    });
  }
}
