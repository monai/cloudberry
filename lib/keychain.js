'use strict';

const ca = require('./ca');
const util = require('./util');
const bindings = require('./bindings');

module.exports = {
  getIdentity,
  addIdentity,
  getDefaultIdentity
};

function getIdentity(subject, done) {
  return bindings.getIdentity(subject, (error, identity) => {
    if (error) {
      done(error);
    } else {
      done(null, util.identityFromPkcs12(identity));
    }
  });
}

function addIdentity(identity, passphrase, options, done) {
  return bindings.addIdentity(util.identityToPkcs12(identity, passphrase, options), passphrase, done);
}

function getDefaultIdentity(done) {
  return getIdentity(ca.defaults.commonName, done);
}
