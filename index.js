/**
 * The Primary File For The API
 */

//  Dependencies
let http = require('http');
let url = require('url');
let StringDecoder = require('string_decoder').StringDecoder;

const config = require('./config');

// The server should respond to all requests with a string
let server = http.createServer((req, res) => {
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
        let choosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct data object to send to the handler
        let data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            'payload': buffer
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
            // Log the request path
            console.log(`Returning this response: ${ statusCode }, ${ payload }`);
        }); 
    
    });

});

// Start the server
const { port, envName } = config;
server.listen(port, () => console.log(`The server is listening on port ${ port } in ${ envName } mode`));

// Define handlers
let handlers = {};

// sample handler
handlers.sample = (data, callback) => {
    // callback a http status code and a payload object
    callback(406, { 'name': 'sample handler' });
}

// not found handler
handlers.notFound = (data, callback) => {
    callback(404);
}

// Define a request router
let router = {
    'sample': handlers.sample
};
