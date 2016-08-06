const proxy = require('./index');
const connect = require('connect');
const morgan = require('morgan');

var app = connect();
app.use(morgan('dev'));
app.use((req, res, next) => {
  console.log(res.statusCode, res.statusMessage);
  next();
});

proxy(app).listen(8000);
