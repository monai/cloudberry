'use strict';

const forge = require('node-forge');
const minimist = require('minimist');

const keychain = require('../lib/keychain');
const pkg = require('../package.json');

const LABEL = 'cloudberry Certificate Authority';
const PASSPHRASE = 'cloudberry';

const pki = forge.pki;

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
    let identity = generate();
    if (argv.keychain) {
      saveToKeychain(identity);
    } else {
      console.log(pki.privateKeyToPem(identity.key));
      console.log(pki.certificateToPem(identity.cert));
    }
  }
}

function printVersion() {
  console.log(pkg.version);
}

function printUsage() {
console.log(`
usage: gen_ca [options]

options:
  -h, --help        this help text
  -v, --version     cloudberry version
  -K, --keychain    save identity to macOS default keychain
`.trim());
}

function saveToKeychain(identity) {
  try {
    keychain.getIdentity(LABEL, (_, id) => {
      if (id) {
        console.error(`Certificate '${LABEL}' already exists in default keychain.`);
        process.exit(1);
      } else {
        try {
          let p12Asn1 = forge.pkcs12.toPkcs12Asn1(identity.key, identity.cert, PASSPHRASE, {
            algorithm: '3des',
            friendlyName: LABEL
          });

          let p12Der = forge.asn1.toDer(p12Asn1).getBytes();
          let p12b64 = forge.util.encode64(p12Der);
          let p12Buffer = new Buffer(p12b64, 'base64');

          keychain.addIdentity(p12Buffer, PASSPHRASE, error => {
            if (error) {
              console.error(error);
            } else {
              console.log([
                `Certificate '${LABEL}' with password '${PASSPHRASE}' imported to default keychain.`,
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

function generate() {
  const attrs = [{
    name: 'commonName',
    value: LABEL
  }];

  const keys = pki.rsa.generateKeyPair(2048);
  const cert = pki.createCertificate();

  cert.publicKey = keys.publicKey;
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date(2038, 1, 19, 3, 14, 7);

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
