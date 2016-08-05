const proxy = require('./lib/proxy');

// const fs = require('fs');
// const net = require('net');
// const url = require('url');
// const http = require('http');
// const https = require('https');
//
// var conns = {};
//
// const options = {
//   host: '127.0.0.1',
//   port: 8000
// };
//
// const proxy = http.createServer((req, res) => {
//
//   var opts = url.parse(req.url);
//   opts.headers = req.headers;
//
//   const target = http.request(opts, (tRes) => {
//     res.writeHead(tRes.statusCode, tRes.statusMessage, tRes.headers);
//     tRes.pipe(res);
//   });
//
//   req.pipe(target);
// });
//
// proxy.listen(options.port, options.host, () => {
//   console.log('Proxy is listening on %s:%s', options.host, options.port);
// });
//
// const imOptions = {
//   host: '127.0.0.1',
//   port: 8001,
// };
//
// const httpsOptions = {
//   key: fs.readFileSync('key.pem'),
//   cert: fs.readFileSync('cert.pem')
// };
//
// const im = https.createServer(httpsOptions, (req, res) => {
//   var opts = url.parse(req.url);
//   Object.assign(opts, conns[req.socket.remotePort]);
//   opts.headers = req.headers;
//
//   const target = https.request(opts, (tRes) => {
//     res.writeHead(tRes.statusCode, tRes.statusMessage, tRes.headers);
//     tRes.pipe(res);
//   });
//
//   req.pipe(target);
// });
//
// im.listen(imOptions.port, imOptions.host, () => {
//   console.log('Intermediate is listening on %s:%s', imOptions.host, imOptions.port);
// });
//
// proxy.on('connect', (req, client, header) => {
//   const resHeader = [
//     'HTTP/1.1 200 Connection Established',
//     'proxy-agent: proxy',
//     '', ''
//   ].join('\r\n');
//
//   const [host, port] = req.url.split(':');
//   const protocol = port == 443 ? 'https:' : 'http:';
//   const reqUrl = { protocol, host, port };
//
//   client.write(resHeader);
//
//   const target = net.connect(imOptions);
//   target.write(header);
//   target.pipe(client);
//   client.pipe(target);
//
//   target.on('connect', () => {
//     conns[target.localPort] = reqUrl;
//   })
//
//   client.on('end', () => {
//     delete conns[target.localPort];
//   });
// });
