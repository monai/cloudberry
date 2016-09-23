'use strict';

const http = require('http');
const https = require('https');

module.exports = createServer;

function createServer(options, requestListener) {
  const httpServer = http.createServer(requestListener);
  const httpsServer = https.createServer(options, requestListener);

  const instance = Object.create(options);
  instance.http = httpServer;
  instance.https = httpsServer;

  const server = new Proxy(instance, {
    get: function (target, name) {
      if (target.hasOwnProperty(name)) {
        return target[name];
      } else {
        if (typeof httpsServer[name] === 'function') {
          return proxyFn(httpsServer[name]);
        } else {
          return httpsServer[name];
        }
      }
    }
  });

  function proxyFn(fn) {
    return function (...args) {
      fn.apply(httpServer, args);
      fn.apply(httpsServer, args);
    };
  }

  return server;
}
