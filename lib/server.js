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
    get: function get(target, name) {
      if (Object.prototype.hasOwnProperty.call(target, name)) {
        return target[name];
      }

      if (typeof httpsServer[name] === 'function') {
        return proxyFn(httpsServer[name]);
      }

      return httpsServer[name];
    },
  });

  function proxyFn(fn) {
    return function proxyFn_(...args) {
      fn.apply(httpServer, args);
      fn.apply(httpsServer, args);
    };
  }

  return server;
}
