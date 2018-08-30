/**
 * /users routes
 */

const _helpers = require('../../lib/helpers');

const users = {};

/**
 * Method to handle GET request
 *
 * @param { Object } data - All information needed to handle the request
 * @param { Object } callback - Response from the request (statusCode, payload)
 */
users.get = (data, callback) => {
    callback(200, { GET: 'Working' });
};

/**
 * Method to handle HEAD request
 *
 * @param { Object } data - All information needed to handle the request
 * @param { Object } callback - Response from the request (statusCode, payload)
 */
users.head = (data, callback) => {
    callback(200);
};

/**
 * Method to handle POST request
 *
 * @param { Object } data - All information needed to handle the request
 * @param { Object } callback - Response from the request (statusCode, payload)
 */
users.post = (data, callback) => {

};

/**
 * Method to handle PUT request
 *
 * @param { Object } data - All information needed to handle the request
 * @param { Object } callback - Response from the request (statusCode, payload)
 */
users.put = (data, callback) => {

};

/**
 * Method to handle DELETE request
 *
 * @param { Object } data - All information needed to handle the request
 * @param { Object } callback - Response from the request (statusCode, payload)
 */
users.delete = (data, callback) => {
    
}

/**
 * Method to handle incoming request
 *
 * @param { Object } data - All information needed to handle the request
 * @param { Object } callback - Response from the request (statusCode, payload)
 */
module.exports = (data, callback) => {
    let { method } = data;
    users[method](data, (statusCode, payload) => {
        callback(statusCode, payload);
    });
};
