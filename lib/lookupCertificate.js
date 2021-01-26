const tls = require('tls');

module.exports = {
  createCallback,
  lookupCertificate,
};

function createCallback(obj) {
  return (req, res, done) => {
    lookupCertificate(req.url, (error, certificate) => {
      if (error) {
        done(error);
      } else {
        obj.emit('certificate', certificate, req, res);
        done();
      }
    });
  };
}

function lookupCertificate(host, done) {
  const [hostname, port] = host.split(':');
  const socket = tls.connect({
    port,
    host: hostname,
    servername: hostname,
  });

  let isDone = false;

  socket.on('secureConnect', () => {
    if (!isDone) {
      done(null, socket.getPeerCertificate());
      socket.end();
      isDone = true;
    }
  });

  socket.on('error', (error) => {
    if (!isDone) {
      done(error);
      isDone = true;
    }
  });
}
