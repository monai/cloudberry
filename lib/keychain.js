'use strict';

var bindings = null;

try {
  bindings = require('bindings')('keychain.node');
} catch (ex) {}

module.exports = {
  getIdentity,
  addIdentity
};

function getIdentity(label, done) {
  if (bindings) {
    return bindings.getIdentity(label, done);
  } else {
    done(Error(`Platform '${process.platform}' is not supported.`));
  }
}

function addIdentity(identity, passphrase, done) {
  if (bindings) {
    return bindings.addIdentity(identity, passphrase, done);
  } else {
    done(Error(`Platform '${process.platform}' is not supported.`));
  }
}
