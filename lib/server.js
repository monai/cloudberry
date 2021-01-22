'use strict';

const http = require('http');
const https = require('https');

module.exports = createServer;

function createServer(options, requestListener) {
  options = { ...options };

  if (options.proxyCA) {
    options.SNICallback = options.proxyCA.createSNICallback();
  }

  options.http = http.createServer(options, requestListener);
  options.https = https.createServer(options, requestListener);

  return options;
}
