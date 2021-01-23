module.exports = remoteName;

function remoteName(socket) {
  return [
    socket.remoteFamily,
    socket.remoteAddress,
    socket.remotePort,
  ].join(':');
}
