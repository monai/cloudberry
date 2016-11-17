'use strict';

const proxy = require('.');

proxy.keychain.getDefaultIdentity((error, identity) => {
  if (error) {
    return console.error(error);
  }

  const ca = proxy.ca(identity);
  const server = proxy.createServer({
    SNICallback: ca.SNICallback()
  }, (req, res) => {
    console.log(req.headers.host, '>', req.url);

    if (req.headers.host == 'accounts.google.com') {

      // console.log(req.headers);
      // console.log(req.rawHeaders);

    }

    proxy.request(req, res).on('error', console.error);

  });

  proxy(server).listen(8000);
});
