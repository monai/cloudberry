'use strict';

const dezalgo = require('dezalgo');

var bindings = null;

try {
  bindings = require('bindings')('keychain.node');
} catch (ex) {}

module.exports = {
  getIdentity,
  addIdentity
};

function getIdentity(subject, done) {
  if (bindings) {
    return bindings.getIdentity(subject, done);
  } else {
    dezalgo(done)(Error(`Platform '${process.platform}' is not supported.`));
  }
}

function addIdentity(identity, passphrase, done) {
  if (bindings) {
    return bindings.addIdentity(identity, passphrase, done);
  } else {
    dezalgo(done)(Error(`Platform '${process.platform}' is not supported.`));
  }
}
