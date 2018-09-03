const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

const _helpers = require('./helpers');
const router = require('../router/router');


module.exports = (() => {
    /**
     * Unified server function (http and https)
     *
     * @param {Object} req - Object comming from the client request
     * @param {Object} res - Object for sending back a response to the client
     */
    const serve = (req, res) => {
        /**
         * Prepare request object to send to router
         */
        const parsedUrl = url.parse(req.url, true);

        const { pathname } = parsedUrl;

        const trimmedPathname = pathname.replace(/^\/|\/$/g,``);

        const queryStringObjsct = {
            ...parsedUrl.query
        };

        const { method } = req;

        const { headers } = req;

        const decoder = new StringDecoder('utf-8');
        let buffer = '';

        req.on('data', data => buffer+= decoder.write(data));

        req.on('end', () => {
            buffer+= decoder.end();

            _helpers.checkMethod(method.toLowerCase(), isValid => {
                if(!isValid) {
                    let { statusCode, payload } = _helpers.checkStatusCodeAndPayload(405);
                    res.setHeader('Content-Type', 'application/json');
                    res.writeHead(statusCode);
                    res.end(JSON.stringify(payload));
                }else {
                    
                    const choosenRouter = typeof(router[trimmedPathname]) !== 'undefined' ? router[trimmedPathname] : router.notFound;

                    let reqObject = {
                        pathname: trimmedPathname,
                        query: queryStringObjsct,
                        method: method.toLowerCase(),
                        headers,
                        payload: _helpers.parseToJson(buffer)
                    }
                    console.log(reqObject);
                    choosenRouter(reqObject, (statusCode, payload) => {
                        let { statusCode: s, payload: p } = _helpers.checkStatusCodeAndPayload(statusCode, payload);
            
                        res.setHeader('Content-Type', 'application/json');
                        res.writeHead(s);
                        res.end(JSON.stringify(p));
                    });
                };
            });
        });
    };

    return {
        init: serve
    }
})();
