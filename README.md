# cloudberry

[![NPM Version](http://img.shields.io/npm/v/cloudberry.svg)](https://www.npmjs.org/package/cloudberry)

Cloudberry is HTTP/HTTPS middleware driven proxy server.

## Generate CA signing identity

Generate signing identity:

```shell
cloudberry
```

Generate signing identity and save to macOS default keychain:

```shell
cloudberry -K
```

## Usage

```js
const proxy = require('cloudberry');

const key =
`-----BEGIN RSA PRIVATE KEY-----
<...>
-----END RSA PRIVATE KEY-----`;

const cert =
`-----BEGIN CERTIFICATE-----
<...>
-----END CERTIFICATE-----`;

proxy.keychain.getDefaultIdentity((error, identity) => {
  if (error) {
    identity = { key, cert }; // if not on macOS
  }

  const ca = proxy.ca(identity);
  const server = proxy.createServer({
    SNICallback: ca.SNICallback()
  }, (req, res) => {
    console.log('>', req.url);
    proxy.request(req, res).on('error', console.error);
  });

  proxy(server).listen(8000);
});
```

## License

ISC
