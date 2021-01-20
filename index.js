const ca = require('./lib/ca');
const createServer = require('./lib/server');
const proxy = require('./lib/proxy');

module.exports = proxy;
proxy.ca = ca;
proxy.createServer = createServer;
