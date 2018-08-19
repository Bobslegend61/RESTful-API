/**
 * The Primary File For The API
 */

//  Dependencies
let http = require('http');
let url = require('url');

// The server should respond to all requests with a string
let server = http.createServer((req, res) => {
    // Get the url and parse it
    let parsedUrl = url.parse(req.url, true);
    // Get the path
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/\/+|\/+$/g, '');

    // Send the response
    res.end('Hello world\n');

    // Log the request path
    console.log(`Request is recieved on this path: ${ trimmedPath }`);
});

// Start the server, and have it listen on port 3000
server.listen(3000, () => console.log('The server is listening on port 3000'));
