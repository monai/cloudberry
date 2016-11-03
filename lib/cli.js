'use strict';

const minimist = require('minimist');

const ca = require('../lib/ca');
const util = require('../lib/util');
const keychain = require('../lib/keychain');
const pkg = require('../package.json');

module.exports = main;

if (module === require.main) {
  main(process.argv.slice(2));
}

function main(argv) {
  argv = minimist(argv, {
    alias: {
      'h': 'help',
      'v': 'version',
      'K': 'keychain'
    },
    boolean: [ 'K' ]
  });

  if (argv.version) {
    printVersion();
  } else if (argv.help) {
    printUsage();
  } else {
    let identity = ca.generateRoot();
    if (argv.keychain) {
      saveToKeychain(identity);
    } else {
      identity = util.identityToPem(identity);
      console.log(identity.key);
      console.log(identity.cert);
    }
  }
}

function printVersion() {
  console.log(pkg.version);
}

function printUsage() {
console.log(`
usage: cloudberry [options]

options:
  -h, --help        this help text
  -v, --version     cloudberry version
  -K, --keychain    save identity to macOS default keychain
`.trim());
}

function saveToKeychain(identity) {
  const c = ca.defaults;

  try {
    keychain.getIdentity(c.commonName, (_, id) => {
      if (id) {
        console.error(`Certificate '${c.commonName}' already exists in default keychain.`);
        process.exit(1);
      } else {
        identity = util.identityToPkcs12(identity, c.passphrase, {
          algorithm: '3des',
          friendlyName: c.commonName
        });

        try {
          keychain.addIdentity(identity, c.passphrase, error => {
            if (error) {
              console.error(error);
            } else {
              console.log([
                `Certificate '${c.commonName}' with password '${c.passphrase}' imported to default keychain.`,
                'Go to /Applications/Utilities/Keychain Access.app to make the certificate trusted.'
              ].join('\n'));
            }
          });
        } catch (ex) {
          console.error(ex);
          process.exit(2);
        }
      }
    });
  } catch (ex) {
    console.error(`Platform ${process.platform} is not supported.`);
    process.exit(1);
  }
}
