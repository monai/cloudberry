'use strict';

const forge = require('node-forge');

const key = `
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCq2QafYr0ZgX4V
ebEkB/iNWJQp+V0HQnUFgWNmafIJmY7Cl7NyjRrrlpit95hWt7a/Pg9VA0m/QaqV
R0Q5CmiISZA2jwMY3yL6SBrYnjgGD04Kn/yMxNUZkfGFzNHMb5hlNPe45i1FhweK
28WaINmFYjD/q0b85hzw5pv8N3rIc2DaC6E1CC9rxxmgx0AVbqo6pZ/7p9BkRdor
Y2c/1O7M7ogWNoBD+u/UpAJjB2FRIYXPLqoefP88NGsZde8gr6H+0IepzwG6pCHN
bWauDo8SiUmqhcz3dK1lWE7nd55PCeu+3AN0e8w2iiVpi0/1bUMv6uwtZQcAol6q
QuHyIMvHAgMBAAECggEASSLkseBb4QpNBjZ0/V6oKSHtM1a7Wzs4yyWLfrEF2tQw
h97XA8eh6Y4rR/XA8gZtJcsUVyk0LbqXopXCf8ST4RvUr3ZjNgd3errZOzfn9bgh
iWzZeQ1dyDdws/1tJl3zWAfnr/BhGu1l7iyMl6FOXMoe/aO9nM+JPhsKVVsOpbYC
9d72NnOq4cSiPpQ3Io+Sb6y+clZEFWQRuoVlolwzDgxbf/maihtpcDmT/JbOxF+b
1oDWa9kiueY4n7q2Yre3vpF1aQo4/lS0C82RXzOcduh1WH/u2Si0bpejbvk+F+lI
E39kdrSeNu5mEboDcBsmp0yBAgeJQV19jYJ1an68GQKBgQDidAtNVTMw1eEVO5F1
qN4YFaSOzNkNOjGqseDOVTBWNSWXYgAnieqR1FE8kY06ERxwrZfGP+ivyHaMENFy
jmjvlXhaTeFLRB3gIKRXiSGBcC9yrlniZZFpJxGFU7u5gcitAf2C0F/XIayc7InP
uJSil7DfA7eMAg2ZDAdvCnafOwKBgQDBI6eT6Ms1od2fQwPJ5+++c/Xn/f3s4KiC
mO9t0lzvJlcJr1tcm4hINtg7aOXvDEcuf1w1Vvf3ty8+Zh2CcaT7Cxmr7S6+71wM
35sMtcHQMPcYuLCr+NSIlhgfTN0SR28uGuNgJXH86jELZw9E2f2MiwWEMVQZYHd0
S/PdSv9U5QKBgCmVy9mIstzd+faPONgViat8lfqPTbCrJiHFhpX9eOHr4ppZKdQY
9JWRGtX3mKq4J7PdfQiwBcf6FSMFl6Dk3ApbNX3H3X6X5LCa7fMRQLDnbB8wO1ti
8YAQ55vHU6ruVW7H9ckHAQKdsXgjy+70Y380QgvCP/ubCOo5Fkhi8IOvAoGBALqN
e+IMK6wkKvMYQeKWGyY0z8NDvC8/WMS8gBft50JAIDYEoRS0TlCiWP4Zdm8NxvuM
nT4QQPeOgx2ceMh0iMzLjgJY2JwoixsMKLGAJjK3+RRx4IRblr5PbAFftvFe+m7o
HdPSl2WZt8GxzDfO727/IVbsZrUUTo2Qh36qYDJZAoGARTGz1zubkORzQeef2Yc8
YnUdqyh2a/6oK+PeUED5TK9lhLAuhbnnPBD+3Mm+RzDVlY+VWgHSxf7bI7wQJusc
Gh1LrugTGaWWYKLOLClYYOvB6cSuZMLmUDvyJPYWleGHZSDnnhOOK+K8eaSrJ7OF
+hNEvSFwFaJtHCiFV6izkiE=
-----END PRIVATE KEY-----
`.trim();

const cert = `
-----BEGIN CERTIFICATE-----
MIIDWjCCAkKgAwIBAgIBATANBgkqhkiG9w0BAQsFADBSMSkwJwYDVQQDDCBjbG91
ZGJlcnJ5IENlcnRpZmljYXRlIEF1dGhvcml0eTElMCMGCSqGSIb3DQEJARYWY2xv
dWRiZXJyeUBleGFtcGxlLm9yZzAeFw0xNjA4MTAwODExMjVaFw0xOTEyMzEwODEx
MjVaMFIxKTAnBgNVBAMMIGNsb3VkYmVycnkgQ2VydGlmaWNhdGUgQXV0aG9yaXR5
MSUwIwYJKoZIhvcNAQkBFhZjbG91ZGJlcnJ5QGV4YW1wbGUub3JnMIIBIjANBgkq
hkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqtkGn2K9GYF+FXmxJAf4jViUKfldB0J1
BYFjZmnyCZmOwpezco0a65aYrfeYVre2vz4PVQNJv0GqlUdEOQpoiEmQNo8DGN8i
+kga2J44Bg9OCp/8jMTVGZHxhczRzG+YZTT3uOYtRYcHitvFmiDZhWIw/6tG/OYc
8Oab/Dd6yHNg2guhNQgva8cZoMdAFW6qOqWf+6fQZEXaK2NnP9TuzO6IFjaAQ/rv
1KQCYwdhUSGFzy6qHnz/PDRrGXXvIK+h/tCHqc8BuqQhzW1mrg6PEolJqoXM93St
ZVhO53eeTwnrvtwDdHvMNoolaYtP9W1DL+rsLWUHAKJeqkLh8iDLxwIDAQABozsw
OTAPBgNVHRMBAf8EBTADAQH/MA4GA1UdDwEB/wQEAwIChDAWBgNVHSUBAf8EDDAK
BggrBgEFBQcDATANBgkqhkiG9w0BAQsFAAOCAQEATpHONNUexzDXNwjuqTR5pgGr
452NRitZwIZtzDIY95wEQzP0qqxYxpxtvlNhyECxhBR8ba9cgv0DYk3spkYPFqlk
g7qwORQDvQddx7C88/7uFVB/swvkcEsAdjbEkoTX/CYPdpir/LgFjMEhIqCDKnjk
2OVvd9yvcdLCh0VW/gLRGOHNRk3qrGRbPV3XyRl9G+wiMUXKV3kjTNEiAAFZOi+e
S2opDfqSahIoA8OTPGWdDu2e96iLJqGv/JO3dB04Z1c04Qfk6yDsgOk0AebPzO+z
rlW8n727EtWn1kl+3LdPL8A/BKCZKZguqoB2c1H6EbvD0gqbUlt23gloiQgCEQ==
-----END CERTIFICATE-----
`.trim();

function generateCert(host) {
  const pki = forge.pki;

  const caPrivateKey = pki.privateKeyFromPem(key);
  const caCertificate = pki.certificateFromPem(cert);

  const keys = pki.rsa.generateKeyPair(1024);
  const crt = pki.createCertificate();

  crt.publicKey = keys.publicKey;
  crt.serialNumber = Date.now() + Math.random().toString().slice(2);
  crt.validity.notBefore = new Date();
  crt.validity.notAfter = new Date();
  crt.validity.notAfter.setFullYear(crt.validity.notBefore.getFullYear() + 1);

  const attrs = [{
    name: 'commonName',
    value: '*.'+ host
  }];

  crt.setSubject(attrs);
  crt.setIssuer(caCertificate.subject.attributes);
  // crt.setIssuer(attrs);
  crt.setExtensions([
    {
      name: 'keyUsage',
      digitalSignature: true,
      keyEncipherment: true
    }, {
      name: 'extKeyUsage',
      serverAuth: true,
      clientAuth: true
    }, {
      name: 'nsCertType',
      server: true
    }, {
      name: 'subjectAltName',
      altNames: [{
        type: 2,
        value: host
      }]
    }, {
      name: 'subjectKeyIdentifier'
    }
  ]);

  crt.sign(caPrivateKey);
  // crt.sign(keys.privateKey);

  return {
    key: pki.privateKeyToPem(keys.privateKey),
    cert: pki.certificateToPem(crt)
  };
}

module.exports = {
  key,
  cert,
  generateCert
};
