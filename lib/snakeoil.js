'use strict';

const forge = require('node-forge');

module.exports = snakeoil;

function snakeoil(options) {
  const instance = Object.create(options);

  instance.generate = function $generate(host) {
    return generate(instance, host);
  };

  return instance;
}

function generate(instance, host) {
  const pki = forge.pki;

  const caPrivateKey = pki.privateKeyFromPem(instance.key);
  const caCertificate = pki.certificateFromPem(instance.cert);

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

  return {
    key: pki.privateKeyToPem(keys.privateKey),
    cert: pki.certificateToPem(crt)
  };
}
