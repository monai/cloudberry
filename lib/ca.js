'use strict';

const tls = require('tls');
const forge = require('node-forge');
const pki = forge.pki;

module.exports = ca;

function ca(options) {
  try {
    options.key = pki.privateKeyFromPem(options.key);
  } catch (ex) {
    throw new Error('Bad CA private key');
  }

  try {
    options.cert = pki.certificateFromPem(options.cert);
  } catch (ex) {
    throw new Error('Bad CA certificate');
  }

  options._ctxs = {};
  const instance = Object.create(options);

  instance.generate = function $generate(host) {
    return generate(instance, host);
  };

  instance.SNICallback = function $SNICallback() {
    return SNICallback(instance);
  };

  return instance;
}

function SNICallback(instance) {
  return function SNICallback_(servername, done) {
    const ctxs = instance._ctxs;
    var ctx = ctxs[servername];

    if ( ! ctx) {
      const certKey = generate(instance, servername);
      ctx = tls.createSecureContext(certKey);
      ctxs[servername] = ctx;
    }

    done(null, ctx);
  };
}

function generate(instance, host) {
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
  crt.setIssuer(instance.cert.subject.attributes);
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

  crt.sign(instance.key);

  return {
    key: pki.privateKeyToPem(keys.privateKey),
    cert: pki.certificateToPem(crt)
  };
}
