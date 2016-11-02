'use strict';

const forge = require('node-forge');

module.exports = {
  identityToPkcs12,
  pkcs12ToIdentity
};

function identityToPkcs12(identity, passphrase, options) {
  const p12Asn1 = forge.pkcs12.toPkcs12Asn1(identity.key, identity.cert, passphrase, options);
  const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
  const p12b64 = forge.util.encode64(p12Der);
  return new Buffer(p12b64, 'base64');
}

function pkcs12ToIdentity(identity, passphrase) {
  const p12Asn1 = forge.asn1.fromDer(forge.util.createBuffer(identity));
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, passphrase);

  var bags, key, cert;

  bags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
  key = bags[forge.pki.oids.pkcs8ShroudedKeyBag][0];

  bags = p12.getBags({ bagType: forge.pki.oids.certBag });
  cert = bags[forge.pki.oids.certBag][0];

  return { key, cert };
}
