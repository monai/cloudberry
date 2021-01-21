/* eslint-disable no-console */

'use strict';

const fs = require('fs/promises');

const {
  createCA, createServer, proxy, request,
} = require('.');

main();

async function main() {
  try {
    const key = await fs.readFile('./tls/rootCAKey.pem');
    const cert = await fs.readFile('./tls/rootCACert.pem');

    launch(key, cert);
  } catch (ex) {
    console.error(ex);
  }
}

function launch(key, cert) {
  const ca = createCA({ key, cert });
  const server = createServer({
    SNICallback: ca.SNICallback(),
  }, (req, res) => {
    console.log(req.headers.host, '>', req.url);

    const res2 = request(ca)(req, res);
    console.log(res2);
    res2.on('error', console.error);
  });

  proxy(server)
    .listen(8000, () => {
      console.log('Listening on 0.0.0.0:8000');
    });
}
