const createCA = require('./lib/ca');
const createServer = require('./lib/server');
const proxy = require('./lib/proxy');
const request = require('./lib/request');

module.exports = {
  createCA,
  createServer,
  proxy,
  request,
};
