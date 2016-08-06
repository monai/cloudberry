# proxy

[![NPM Version](http://img.shields.io/npm/v/cloudberry.svg)](https://www.npmjs.org/package/cloudberry)

Cloudberry is HTTP/HTTPS middleware driven proxy server.

## Usage

```js
const proxy = require('cloudberry');
const connect = require('connect');
const morgan = require('morgan');

var app = connect();
app.use(morgan('dev'));
app.use((req, res, next) => {
  console.log(res.statusCode, res.statusMessage);
  next();
});

proxy(app).listen(8000);
```

## License

ISC
