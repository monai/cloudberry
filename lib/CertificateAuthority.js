'use strict';

const tls = require('tls');
const forge = require('node-forge');

const { pki } = forge;

class CertificateAuthority {
  constructor(options) {
    this.key = pki.privateKeyFromPem(options.key);
    this.cert = pki.certificateFromPem(options.cert);

    this.contexts = {};
  }

  generate(host) {
    const keys = pki.rsa.generateKeyPair(1024);
    const cert = pki.createCertificate();

    cert.publicKey = keys.publicKey;
    cert.serialNumber = Date.now() + Math.random().toString().slice(2);
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

    const attrs = [{
      name: 'commonName',
      value: `*.${host}`,
    }];

    cert.setSubject(attrs);
    cert.setIssuer(this.cert.subject.attributes);
    cert.setExtensions([
      {
        name: 'keyUsage',
        digitalSignature: true,
        keyEncipherment: true,
      }, {
        name: 'extKeyUsage',
        serverAuth: true,
        clientAuth: true,
      }, {
        name: 'subjectAltName',
        altNames: [{
          type: 2,
          value: host,
        }],
      }, {
        name: 'subjectKeyIdentifier',
      },
    ]);

    cert.sign(this.key, forge.md.sha256.create());

    return {
      key: pki.privateKeyToPem(keys.privateKey),
      cert: pki.certificateToPem(cert),
    };
  }

  SNICallback() {
    return (servername, done) => {
      let ctx = this.contexts[servername];

      if (!ctx) {
        const identity = this.generate(servername);
        ctx = tls.createSecureContext(identity);
        this.contexts[servername] = ctx;
      }

      done(null, ctx);
    };
  }
}

module.exports = CertificateAuthority;
