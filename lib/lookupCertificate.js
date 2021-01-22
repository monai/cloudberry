const tls = require('tls');

module.exports = lookupCertificate;

function lookupCertificate(req, done) {
  const [host, port] = req.url.split(':');
  const socket = tls.connect({
    port,
    host,
    servername: host,
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
