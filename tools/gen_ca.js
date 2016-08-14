'use strict';

const forge = require('node-forge');

const attrs = [{
  name: 'commonName',
  value: 'cloudberry Certificate Authority'
}];

const pki = forge.pki;

const keys = pki.rsa.generateKeyPair(2048);
const cert = pki.createCertificate();

cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date(2038, 1, 19, 3, 14, 7);

cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.setExtensions([
  {
    name: 'basicConstraints',
    cA: true
  }, {
    name: 'keyUsage',
    digitalSignature: true,
    keyCertSign: true
  }, {
    name: 'subjectKeyIdentifier'
  }
]);
cert.sign(keys.privateKey);

const prvKeyPEM = pki.privateKeyToPem(keys.privateKey);
const certPEM = pki.certificateToPem(cert);

console.log(prvKeyPEM);
console.log(certPEM);
