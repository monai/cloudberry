'use strict';

const http = require('http');
const https = require('https');

module.exports = createServer;

function createServer(options, requestListener) {
  options.server = http.createServer(options, requestListener);
  options.secureServer = https.createServer(options);

  return options;
}
