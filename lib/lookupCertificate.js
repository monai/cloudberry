const tls = require('tls');

module.exports = lookupCertificate;

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
