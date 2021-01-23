'use strict';

const EventEmitter = require('events');

const tls = require('tls');
const forge = require('node-forge');

const remoteName = require('./remoteName');

const { pki } = forge;

class CertificateAuthority extends EventEmitter {
  constructor(options) {
    super();

    this.key = pki.privateKeyFromPem(options.key);
    this.cert = pki.certificateFromPem(options.cert);

    this.contexts = {};

    this.agent = options.agent;
  }

  generate(host, upstreamCertificate) {
    const keys = pki.rsa.generateKeyPair(1024);
    let cert;

    if (upstreamCertificate) {
      const raw = forge.asn1.fromDer(upstreamCertificate.toString('binary'));
      cert = pki.certificateFromAsn1(raw);
    } else {
      cert = pki.createCertificate();

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
    }

    cert.setIssuer(this.cert.subject.attributes);
    cert.publicKey = keys.publicKey;
    cert.sign(this.key, forge.md.sha256.create());

    return {
      key: pki.privateKeyToPem(keys.privateKey),
      cert: pki.certificateToPem(cert),
    };
  }

  createSNICallback() {
    const $this = this;
    return function SNICallback(servername, done) {
      let ctx = $this.contexts[servername];
      const name = remoteName(this);
      const certificate = $this.agent.getCertificate(name)?.[0];

      if (!ctx) {
        const identity = $this.generate(servername, certificate?.raw);
        ctx = tls.createSecureContext(identity);
        $this.contexts[servername] = ctx;
      }

      done(null, ctx);
    };
  }
}

module.exports = CertificateAuthority;
