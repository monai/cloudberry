'use strict';

const tls = require('tls');
const { pki, md } = require('node-forge');

class CertificateAuthority {
  constructor(options) {
    this.key = pki.privateKeyFromPem(options.key);
    this.cert = pki.certificateFromPem(options.cert);

    this.contexts = {};
  }

  generate(host) {
    const keys = pki.rsa.generateKeyPair(1024);
    const cert = pki.createCertificate();

    cert.serialNumber = Date.now() + 'x'.repeat(16).replace(/x/g, () => Math.random() * 10 | 0);
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

    cert.setSubject([
      {
        name: 'commonName',
        value: `*.${host}`,
      },
    ]);
    cert.setExtensions([
      {
        name: 'subjectAltName',
        altNames: [{
          type: 2,
          value: host,
        }],
      },
    ]);

    cert.setIssuer(this.cert.subject.attributes);
    cert.publicKey = keys.publicKey;
    cert.sign(this.key, md.sha256.create());

    return {
      key: pki.privateKeyToPem(keys.privateKey),
      cert: pki.certificateToPem(cert),
    };
  }

  createSNICallback() {
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
