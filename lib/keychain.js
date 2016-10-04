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
    done(Error('Platform is not supported'));
  }
}

function addIdentity(done) {
  if (bindings) {
    return bindings.addIdentity(done);
  } else {
    done(Error('Platform is not supported'));
  }
}
