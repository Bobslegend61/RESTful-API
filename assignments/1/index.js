/**
 * Entry file
 * Author: Alabi Emmanuel
 */

const http = require(`http`);
const https = require('https');
const fs = require('fs');


const config = require(`./config`);
const unifiedFunc = require(`./unifiedfunc`);

// Create http Server
const httpServer = http.createServer((req, res) => unifiedFunc(req, res));

// Create https server
const serverConfig = {
    key: fs.readFileSync('./https/key.pem'),
    cert: fs.readFileSync('./https/cert.pem')
};
const httpsServer = https.createServer(serverConfig, (req, res) => unifiedFunc(req, res));

// http Port
const { httpPort } = config;
httpServer.listen(httpPort, () => console.log(`App listening on port: ${ httpPort }`));

// https port
const { httpsPort } = config;
httpsServer.listen(httpsPort, () => console.log(`App listening on port: ${ httpsPort }`))