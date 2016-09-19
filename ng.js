'use strict';

const net = require('net');
const http = require('http');
const https = require('https');
const url = require('url');

const cert =
`-----BEGIN CERTIFICATE-----
MIIDFDCCAfygAwIBAgIBAjANBgkqhkiG9w0BAQsFADBSMSkwJwYDVQQDDCBjbG91
ZGJlcnJ5IENlcnRpZmljYXRlIEF1dGhvcml0eTElMCMGCSqGSIb3DQEJARYWY2xv
dWRiZXJyeUBleGFtcGxlLm9yZzAeFw0xNjA4MTAxMDE1MzlaFw0xNzA4MTAxMDE1
MzlaMB0xDjAMBgNVBAMMBWRlc3JhMQswCQYDVQQGEwJMVDCCASIwDQYJKoZIhvcN
AQEBBQADggEPADCCAQoCggEBAM5oQQ9xukjlHcklfh+tzdxBPdqJwfoWcbqypH3U
L7WjG1u29KOfyQnZuSZpw5r+5HRS37AQNkIbEzTUOtMYLwqQSzfGJfR+HFEhBrST
BiM4fWwmeloiDTymTDjsm+RRjWNBLp3m6Z3JeXlgadOd11oMJnSbkO72R7a4783v
ULD1F7o3LHVvn4lSWmIV5gspdIVffXQxZa5DaGoViVR48hE4HK3b16GP7nDEhwTp
vUhob9rnWTMU8YfFfOTVB+eu0X9f+14lg0X07ja7i46xy3DOZbYTOyWK7zd+tYjl
JEBIfKUcqBtQVi5DTX7R1BeHC+ZcT2BTP7DIBh904DSAti0CAwEAAaMqMCgwDgYD
VR0PAQH/BAQDAgeAMBYGA1UdJQEB/wQMMAoGCCsGAQUFBwMBMA0GCSqGSIb3DQEB
CwUAA4IBAQCUXZaqRd7UK+porS2UjU8R27e37zzq4lk93MpZgIoTpLMO17q7HsaR
o66unGJLxpl3qxvYgqPFcNCQSlglj1RTf6TE+dvGNZmeXEffGvk6sgHigv6hrFIo
qhAOhCAwVuZ8qoJAIg8M0ZgzKtMerS5eiqNHzL0y02IPit53TbA0EF5gaX+0kY8b
cJg/fbBA1AAsmvoI/GH18sjtefPBbR1ynrmiHJGu7DJSIe7xi9gmLv1X9mifxKlH
nWDe48IDI3hqmn1cCX3C1BXIN7ZhtbocPQB6PHJtlA2Af40KOmh7ZmzCMlzOEXjF
L7QRuikDuOsDADSFGFltqb2shZZ2Tffl
-----END CERTIFICATE-----`;

const key =
`-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDOaEEPcbpI5R3J
JX4frc3cQT3aicH6FnG6sqR91C+1oxtbtvSjn8kJ2bkmacOa/uR0Ut+wEDZCGxM0
1DrTGC8KkEs3xiX0fhxRIQa0kwYjOH1sJnpaIg08pkw47JvkUY1jQS6d5umdyXl5
YGnTnddaDCZ0m5Du9ke2uO/N71Cw9Re6Nyx1b5+JUlpiFeYLKXSFX310MWWuQ2hq
FYlUePIROByt29ehj+5wxIcE6b1IaG/a51kzFPGHxXzk1QfnrtF/X/teJYNF9O42
u4uOsctwzmW2Ezsliu83frWI5SRASHylHKgbUFYuQ01+0dQXhwvmXE9gUz+wyAYf
dOA0gLYtAgMBAAECggEBAIoVHqk5WPkZJcMB7Q0+VcCqeLmxfO5Ug4L1ratr/vrR
giTqEWFBLNoFKKL1EGGpcaYMJw7+2X2B5WhrLms3+4hinZ9TVOLqVwFDSdwVm36G
dQmb+DBCJX7UdZuDVor4r9Cds5T4/IKNXVGA2WszZfUcucE6rUvfwHwR3oNzPRUT
vlr1uDa/gCFylZ29bnFd0776A7xS07sROtug8MGU5UdIeuyATp8JeRQaiDMNvrbC
nfXQ6eAumZilxCsI0wUox0QR5ftOPrcTgaDU2f3ZGxC6j0ifsaSqZnD84qw5Y3Su
0AdUuVn5i8t0le9y6/X9w6MDMFi/tqzw+pTZ8OOjKPUCgYEA5e0CUhCgZX+9/I7Q
ZkV1GunrKqDY7asWFenO75EnOmZsaf+F4Y6ra9UNDaJXvDZEK0uuqWkrkzJ0UrrT
ElTT88JZsjnusYPhR+BG0UjKczRIODn7OWSyreuRYMg9yOM2upwsFYcgC8L6SY1T
QBtO/WniAjAFniIow/x40hHpeEcCgYEA5dB50pKWyxcvpiC/xdvzFvBBfaEh8ZlP
YDe+pInq+ZUxV6Ue1xcILJoee/xezx15KDVgkacqquGe45DSM55/xmgT3HJtKzc/
O+D43xb+EhTkHZ562SEQzikc6koEKILaIZ5oh/uZJKz40HFpHgajK2/4uc5yYp1S
KCvqTN85y+sCgYA4EfpU5PUYi3RbWMB9kEakj5LnzF3aZ7R1F5V9WpqEZWHe349Y
mCA5pbUPNB3NKjapkEVBzwHvXYh8fE7o04L0mNqi2fnZlF2l142tj+C/A2rxO0KG
loX0X9QOFAbtLGu2Skt93Hv2IlBDC5HXulEi/2U8P1W/YHksgi88m12iFQKBgHgS
/zO4h7VBPhIs1kZI77Ayg+ViBVw4YDLDrYZG0VDqVMeYbI6xaAH13KunZtoMajtJ
+FTh5Pc3v07jYhC6ZcSCqK3r04Ja8V0V5LKbTtCfvbiED2fXUPKGpKb9WULZa6NZ
IwC5woBZJ/+w4d1gVmzhqjFa3oUL8dsvZtIXaBlVAoGAbEWmEWDu8sPjNdCRb0+S
kmt/brwgVTl+gxkL45A/bBQ6GUNwfl1SIjsCe5eBEEY+xyoCUbndzG76kX5edy6S
+vefLuAP+XSErTKjq2+g0paE2V0THMYhDYM60fFLim0vv78PAwBZb4fhS5oPgVg6
uWEO2cTuRRqVeyOuQc7/VKY=
-----END PRIVATE KEY-----`;

const httpProxy = http.createServer((req, res) => {
  req.url = url.parse(req.url).path;
  console.log(req.url);
  res.end();
});

const httpsProxy = https.createServer({ cert, key }, (req, res) => {
  console.log(req.url);
  res.end();
});

const server = net.createServer(function (client) {
  const CONNECT = Buffer('CONNECT');
  const connectHeader = [
    'HTTP/1.1 200 Connection Established',
    `proxy-agent: cloudberry/0.0.1`,
    '', ''
  ].join('\r\n');

  client.once('readable', onReadable);

  function onReadable() {
    var buff = client.read(7);
    if (buff && buff.equals(CONNECT)) {
      while (client.read());
      client.write(connectHeader);
      httpsProxy.emit('connection', client);
    } else {
      client.unshift(buff);
      httpProxy.emit('connection', client);
    }
  }

});

server.listen(8000);
