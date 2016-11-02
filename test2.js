'use strict';

// const url = require('url');
// const http = require('http');
// const https = require('https');

const proxy = require('.');

const cert =
`-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIBATANBgkqhkiG9w0BAQUFADArMSkwJwYDVQQDEyBjbG91
ZGJlcnJ5IENlcnRpZmljYXRlIEF1dGhvcml0eTAeFw0xNjA5MDkxNDIxMDFaFw0z
ODAyMTkwMTE0MDdaMCsxKTAnBgNVBAMTIGNsb3VkYmVycnkgQ2VydGlmaWNhdGUg
QXV0aG9yaXR5MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAj27if7N5
XVdDZAImMoAclSzV76tc9a1oPxHbS71dYfTRUkgzTWW6ifIZ9YAx6/MDT88A8H25
VhN1YmlAszkDb+ESfT+sjiSIZqqSCMOXBuhlQupMHnqJ7ehzDcsXjhX3REsajqM0
IrE6zz3qiCjvFdeaI7gg8MMQSOLlLmfABASXjIDyBzyegTLPd2qhUZQQ3ltq+lPb
U6DzCkZN9rbuedykuE/XgPg/SfAAE8a4XKa76Z6PXRmlXccZdT+eVRLjaulLDVaq
E3NVG445JdEbv3ooJEPsnZDzlTLrVOtrr724NLXEStX8zPdRSSqLXc67AUGpBEkf
LwyRHG8BpJ53XQIDAQABozwwOjAMBgNVHRMEBTADAQH/MAsGA1UdDwQEAwIChDAd
BgNVHQ4EFgQUXWkF8DbXnKQi7AVpxOk6qlEs5yUwDQYJKoZIhvcNAQEFBQADggEB
AHKbuYj2hGvMSudKbDF7rjNdccJRD24rDTv+RA7IB7rwJN7oS1LvuJb1LzA9sz8T
9mSlc8afFixrQtbac0uMMa7dO93axWPDtz1Tphy2O1pR1N01jXo7wUOXLiHVUeXb
m7MM7pLrELwoTtCiwQoDsismzUIDq1bZK/MfZCplO1swKWYtPMOq3GC6SqxChTPn
xk0+gN/iH36ncu10t7wIYihnTM9s0bh5eQy3lNEWum4jA2TnripnD73hneyGYccL
xgX+vYOIC4mIJdfPei7XaQTCOp7hLunkooEnzTsJrWeHvQbHtxiCG7qsdPo1ceNP
ioe7sFiBPNzPDZrK9kE3V4w=
-----END CERTIFICATE-----`;

const key =
`-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAj27if7N5XVdDZAImMoAclSzV76tc9a1oPxHbS71dYfTRUkgz
TWW6ifIZ9YAx6/MDT88A8H25VhN1YmlAszkDb+ESfT+sjiSIZqqSCMOXBuhlQupM
HnqJ7ehzDcsXjhX3REsajqM0IrE6zz3qiCjvFdeaI7gg8MMQSOLlLmfABASXjIDy
BzyegTLPd2qhUZQQ3ltq+lPbU6DzCkZN9rbuedykuE/XgPg/SfAAE8a4XKa76Z6P
XRmlXccZdT+eVRLjaulLDVaqE3NVG445JdEbv3ooJEPsnZDzlTLrVOtrr724NLXE
StX8zPdRSSqLXc67AUGpBEkfLwyRHG8BpJ53XQIDAQABAoIBAAff4JN+OPWE6vA8
pfgzzF3sPjqQP+RFBuofgtifptbP6AYKbLadFSapof82cIcxqkbhaH3LiTdOji0+
9gxg3u1vf+Jcco7DNrHcP3Q3uLzqWVTZJCCwPY5QKrDhK4PjdNXNAcI+94fIDyB9
l7it9qJOWeoIG9bb/rLhsg9gJsyRlt1CULWn2Dj14PZHTlx1iBI9OL+5qVdjT7X8
aSYdZxA/IEP//ivFke5iN8/muMkooA+ltX6jTJ/Mwoeohfi7d1blDeLxKcOkYJE4
3pPpAyVfeqw2CWLraTJ37V370zUwP6WicvY201sRU3HvF5qCiyxB23arL82hMM2M
G+t9VcECgYEAz1go9RyRholH+rqeb79QDAkG8YKxw7iYE6PJ8viu1Sm60Su9pnzs
y4RThs8LkXxWgQQidrd7HF9FlArCJSCxfKP5btGs/+1keBtUWhXJ1BODJqvrQlVZ
+fXGVBEQ//Zx7+je0BQmEhbh7xErUlO+Aca9Lj1zUNrzwaiHgSEwTGkCgYEAsRdf
Y811Bx6dtY/0IoEODIiuDdH3HMvMLJPfCCK0xM+e32wbpHBavDThVWZrITFTIbCQ
phHao4a7ahB7FKaLzVnDjItrSVOVm5If/JsWARAZuVhrnrAJtwjKGDJD7G8yG9Xd
dRdlYa7HFNwIOH+YgGS1Kp+n842ogP4DksGrRNUCgYB0b7qYYxGp7n/YYmJEuLe3
+n3GtDEliw0Dwm/PHS35ELUTb6/RxceoRkgtpSmG6r8dNngwGLtu5GWLTDtYZDKn
nuGdBOxU0DgiZp6I9EFh8g8tcU/s8UdU4lscrHTSeM/k/O3bBeWXNPhtq0ObuOEz
2Co2xFV0q3BFaWGm9z9LOQKBgQCQKw/sJvIz1pfbnJLKmDfAunDALYO4PK0+SS+T
5vU1GDUlfFRQnWswtvgO1y81uXsM/Tn1CKnu4JuocDxTBnbfuUj6HPI9or80BFTo
B7V1Lg9TFYmfiX6PNKeZ5SnozGmFwajlTyOoz2mhMLO8kxuqwtG+HnXTUCqywJhW
HDZ69QKBgHlTgUjps4KokAjJkdXN/bQx/7Zx27Rm1z/hzRAp85YfcxmnJ5+4Znls
zvJxPDlvGWgO+sf/Cd3tt7iZZCs4nZgAMPEEp4/gz4WW16QroLC37n+M3G9+saeX
ydQY8o5uR/G4AJBX3wUXFbXYMhY2Tj17+NK5qy3KBMm5L9IDrUyW
-----END RSA PRIVATE KEY-----`;

proxy.keychain.getIdentity((error, identity) => {
  const ca = proxy.ca(identity);

  const server = proxy.createServer({
    SNICallback: ca.SNICallback()
  }, (req, res) => {
    console.log('~', req.url);
    // res.end();
    proxy.request(req, res).on('error', console.error);
  });

  // console.log(server);

  server.on('request', (req, res) => {
    console.log('req', req.url);
  });

  proxy(server).listen(8000);
});


// const httpProxy = http.createServer((req, res) => {
//   // req.url = url.parse(req.url).path;
//   console.log(req.url);
//   // res.end();
//   proxy.request(req, res);
// });
//
// const httpsProxy = https.createServer({
//   SNICallback: ca.SNICallback()
// }, (req, res) => {
//   console.log('~', req.url);
//   // res.end();
//   proxy.request(req, res).on('error', console.error);
// });


// const server = proxy({
//   http: httpProxy,
//   https: httpsProxy
// });
// server.listen(8000);
