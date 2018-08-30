/**
 * Helpers function file
 */

const helpers = {};

/**
 * Converts a stringified object to JSON object
 *
 * @param {string} str - Stringified object to be parsed
 * @returns The parsed JSON object
 */
helpers.parseToJson = (str) => {
    try {
        let parsedStr = JSON.parse(str);
        return parsedStr;
    }catch(err) {
        return {};
    }
};

/**
 * Helper to validate status code and payload to be sent to the client.
 *
 * @param { number } statusCode - status code
 * @param { object } payload - data to be sent to the client
 * @returns Object containing the status code and the payload (if non, defaluts to {})
 */
helpers.checkStatusCodeAndPayload = (statusCode, payload) => {
    statusCode = typeof(statusCode) == 'number' && statusCode.toString().length === 3 ? statusCode : 200;
    payload = typeof(payload) == 'object' ? payload : {};

    return { statusCode, payload };
};

/**
 * Check if request method is acceptable
 *
 * @param { string } method - request method
 * @returns Callback with a Boolean value 
 */
helpers.checkMethod = (method, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete', 'head'];
    let check =  (acceptedMethods.indexOf(method) > -1) ? true : false;
    return callback(check);
};

module.exports = helpers;