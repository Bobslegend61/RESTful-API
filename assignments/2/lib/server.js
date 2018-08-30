/**
 * Server file
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const { envName, httpPort, httpsPort } = require('../config/config');
const unifiedServer = require('./unifiedFunc');

module.exports = (() => {
    const httpServer = http.createServer((req, res) => {
        unifiedServer.init(req, res);
    });

    const httpsServer = https.createServer({
        key: fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
        cert: fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
    }, (req, res) => {
        unifiedServer.init(req, res);
    });

    const init = () => {

        httpServer.listen(httpPort, () => console.log('\x1b[36m%s\x1b[0m', `The HTTP server is listening on port: ${ httpPort } and environment: ${ envName }`));

        httpsServer.listen(httpsPort, () => console.log('\x1b[35m%s\x1b[0m', `The HTTPS server is listening on port: ${ httpPort } and environment: ${ envName }`));
    }

    return {
        init
    }
})();