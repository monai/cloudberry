const EventEmitter = require('events');

const remoteName = require('./remoteName');

class ProxyAgent extends EventEmitter {
  constructor() {
    super();

    this.certificates = {};

    this.on('certificate', this.addCertificate.bind(this));
  }

  addCertificate(certificate, authority, headers, socket) {
    this.certificates[remoteName(socket)] = [certificate, authority, headers, new Date()];
    socket.once('close', () => {
      delete this.certificates[remoteName(socket)];
    });
  }

  getCertificate(name) {
    return this.certificates[name];
  }
}

module.exports = ProxyAgent;
