'use strict';

const forge = require('node-forge');

const { pki } = forge;

module.exports = {
  identityToPkcs12,
  identityFromPkcs12,
  identityToPem,
};

function identityToPkcs12(identity, passphrase, options) {
  const p12Asn1 = forge.pkcs12.toPkcs12Asn1(identity.key, identity.cert, passphrase, options);
  const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
  const p12b64 = forge.util.encode64(p12Der);
  return Buffer.from(p12b64, 'base64');
}

function identityFromPkcs12(identity, passphrase) {
  const p12Asn1 = forge.asn1.fromDer(forge.util.createBuffer(identity));
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, passphrase);

  let bags;

  bags = p12.getBags({ bagType: pki.oids.pkcs8ShroudedKeyBag });
  const { key } = bags[pki.oids.pkcs8ShroudedKeyBag][0];

  bags = p12.getBags({ bagType: pki.oids.certBag });
  const { cert } = bags[pki.oids.certBag][0];

  return { key, cert };
}

function identityToPem(identity) {
  return {
    key: pki.privateKeyToPem(identity.key),
    cert: pki.certificateToPem(identity.cert),
  };
}
