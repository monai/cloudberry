'use strict';

const tls = require('tls');
const forge = require('node-forge');
const pki = forge.pki;

const defaults = {
  commonName: 'cloudberry Certificate Authority',
  passphrase: 'cloudberry'
};

module.exports = ca;
ca.defaults = defaults;
ca.generateRoot = generateRoot;

function ca(options) {
  options._key = pki.privateKeyFromPem(options.key);
  options._cert = pki.certificateFromPem(options.cert);

  const instance = Object.create(options);
  instance._ctxs = {};

  instance.generate = function $generate(host) {
    return generate(instance, host);
  };

  instance.SNICallback = function $SNICallback() {
    return SNICallback(instance);
  };

  return instance;
}

function generate(instance, host) {
  const keys = pki.rsa.generateKeyPair(1024);
  const cert = pki.createCertificate();

  cert.publicKey = keys.publicKey;
  cert.serialNumber = Date.now() + Math.random().toString().slice(2);
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  const attrs = [{
    name: 'commonName',
    value: '*.'+ host
  }];

  cert.setSubject(attrs);
  cert.setIssuer(instance._cert.subject.attributes);
  cert.setExtensions([
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

  cert.sign(instance._key, forge.md.sha256.create());

  return {
    key: pki.privateKeyToPem(keys.privateKey),
    cert: pki.certificateToPem(cert)
  };
}

function SNICallback(instance) {
  return function SNICallback_(servername, done) {
    const ctxs = instance._ctxs;
    var ctx = ctxs[servername];

    if ( ! ctx) {
      const identity = generate(instance, servername);
      ctx = tls.createSecureContext(identity);
      ctxs[servername] = ctx;
    }

    done(null, ctx);
  };
}

function generateRoot(options) {
  options = Object.assign({}, defaults, options);

  const keys = pki.rsa.generateKeyPair(2048);
  const cert = pki.createCertificate();

  cert.publicKey = keys.publicKey;
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date(2038, 1, 19, 3, 14, 7);

  const attrs = [{
    name: 'commonName',
    value: options.commonName
  }];

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
  cert.sign(keys.privateKey, forge.md.sha256.create());

  return {
    key: keys.privateKey,
    cert: cert
  };
}
