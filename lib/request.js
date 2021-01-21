const tls = require('tls');
const url = require('url');
const http = require('http');
const https = require('https');

module.exports = request;

const PROTOCOL = {
  http,
  https,
};

function request(ca) {
  return (req, res) => {
    const protocol = Object.keys(PROTOCOL)[+!!req.client.ssl];
    const base = `${protocol}://${req.headers.host}`;

    const upstreamUrl = new url.URL(req.url, base);
    upstreamUrl.method = req.method;
    const { request: protocolRequest } = PROTOCOL[protocol];

    const ctx = tls.createSecureContext();
    ctx.context.addRootCerts();
    ctx.context.addCACert(ca.cert);
    upstreamUrl.secureContext = ctx;

    const upstreamReq = protocolRequest(upstreamUrl, (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode, upstreamRes.statusMessage, upstreamRes.headers);
      upstreamRes.pipe(res);
    });

    Object.keys(req.headers).forEach((h) => {
      upstreamReq.setHeader(h, req.headers[h]);
    });

    req.pipe(upstreamReq);

    return upstreamReq;
  };
}
