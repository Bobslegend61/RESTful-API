/**
 * Server-related tasks
 */


//  Dependencies
let http = require('http');
let https = require('https');
let url = require('url');
let fs = require('fs');
let StringDecoder = require('string_decoder').StringDecoder;
const path = require('path');
const util = require('util');
let debug = util.debuglog('server');

const config = require('./config');
const handlers = require('./handlers');
const helpers = require('./helpers');

// Instantiate a server module object
let server = {};

// Instantiating HTTP server
server.httpServer = http.createServer((req, res) => {
    server.unifiedServer(req, res);
});

// Instantiate HTTPS server
server.httpsServerOptions = {
    key: fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};

server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
    server.unifiedServer(req, res);
});



// All the server login for https and https server
server.unifiedServer = (req, res) => {
    // Get the url and parse it
    let parsedUrl = url.parse(req.url, true);
    // Get the path
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/\/+|\/+$/g, '');

    // Get the query string as an object
    let queryStringObject = {
        ...parsedUrl.query
    };

    // Get the HTTP method
    let method = req.method.toLowerCase();

    // Get the headers as an object
    let headers = req.headers;

    // Get the payload if any
    let decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', data => {
        buffer += decoder.write(data);
    });
    req.on('end', () => {
        buffer += decoder.end();

        // Choose handle which request should go to, if one is not found, default to notFound handler
        let choosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

        // Construct data object to send to the handler
        let data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            'payload': helpers.parseJsonToObject(buffer)
        };

        // Route the requset to the handler specified in the router
        choosenHandler(data, (statusCode, payload) => {
            // Use the status code called back by the handle or default to a 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // Use the payload called back by the handler or default to an empty object
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert the payload to a string
            let payloadString = JSON.stringify(payload);

            // return response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);


            // if the response is 200 print green otherwise print red
            if(statusCode == 200) {
                debug('\x1b[32m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
            }else {
                debug('\x1b[31m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
            }
        }); 
    
    });
}

// Define a request router
server.router = {
    ping: handlers.ping,
    users: handlers.users,
    tokens: handlers.tokens,
    checks: handlers.checks
};


// Init script
server.init = () => {
    // Start the HTTP server
    const { httpPort, httpsPort } = config;
    server.httpServer.listen(httpPort, () =>
    console.log('\x1b[36m%s\x1b[0m', `The server is listening on port ${ httpPort }`));

    // Start the HTTPS server
    server.httpsServer.listen(httpsPort, () => 
    console.log('\x1b[35m%s\x1b[0m', `The server is listening on port ${ httpsPort }`));
}

// Export the module
module.exports = server;
