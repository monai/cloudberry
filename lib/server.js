'use strict';

const http = require('http');
const https = require('https');
const EventEmitter = require('events');

module.exports = createServer;

function createServer(options, requestListener) {
  return {
    http: http.createServer(options, requestListener),
    https: https.createServer(options, requestListener),
    certificateJar: new EventEmitter(),
  };
}
