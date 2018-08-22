const url = require(`url`);
const StringDecoder = require('string_decoder').StringDecoder;

const router = require('./router/routers');


module.exports = (req, res) => {
    // Parse url
    const parsedUrl = url.parse(req.url, true);

    // path
    const { pathname } = parsedUrl;
    
    // trim path
    const trimmedPathname = pathname.replace(/^\/|\/$/g,``);
    
    // Get query
    const { query } = parsedUrl;

    // Get method
    const { method } = req;
    
    // Get headers
    const { headers } = req;

    // Get Payload
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', data => buffer += decoder.write(data));
    req.on('end', () => {
        buffer += decoder.end();

        // Construct request Data
        const requestData = {
            trimmedPathname,
            query,
            method: method.toUpperCase(),
            headers,
            payload: buffer
        }

        // select Handler
        const selectHandler = trimmedPathname in router ? router[trimmedPathname] : router.notFound;
        
        // call handler
        selectHandler(requestData, (statusCode, payload) => {
            payload = (payload && typeof(payload) == 'object') ? payload : {};

            res.setHeader(`Content-Type`, `application/json`);
            res.writeHead(statusCode);   
            res.end(JSON.stringify(payload));
        });
    });
}