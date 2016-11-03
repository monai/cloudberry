'use strict';

// const url = require('url');
// const http = require('http');
// const https = require('https');

const proxy = require('.');

proxy.keychain.getDefaultIdentity((error, identity) => {
  if (error) {
    return console.error(error);
  }

  const ca = proxy.ca(identity);
  const server = proxy.createServer({
    SNICallback: ca.SNICallback()
  }, (req, res) => {
    console.log('>', req.url);
    // res.end();
    proxy.request(req, res).on('error', console.error);
  });

  // server.on('request', (req, res) => {
  //   console.log('req', req.url);
  // });

  proxy(server).listen(8000);
});


// const httpProxy = http.createServer((req, res) => {
//   // req.url = url.parse(req.url).path;
//   console.log(req.url);
//   // res.end();
//   proxy.request(req, res);
// });
//
// const httpsProxy = https.createServer({
//   SNICallback: ca.SNICallback()
// }, (req, res) => {
//   console.log('~', req.url);
//   // res.end();
//   proxy.request(req, res).on('error', console.error);
// });


// const server = proxy({
//   http: httpProxy,
//   https: httpsProxy
// });
// server.listen(8000);
