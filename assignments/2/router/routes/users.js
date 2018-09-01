/**
 * /users routes
 */

const _helpers = require('../../lib/helpers');
const { createUser } = require('../../lib/users');

module.exports = (() => {

    /**
     * Method to handle GET request
     *
     * @param { Object } data - All information needed to handle the request
     * @param { Object } callback - Response from the request (statusCode, payload)
     */
    const get = (data, callback) => {
        callback(200, { GET: 'Working' });
    };

    /**
     * Method to handle HEAD request
     *
     * @param { Object } data - All information needed to handle the request
     * @param { Object } callback - Response from the request (statusCode, payload)
     */
    const head = (data, callback) => {
        callback(200);
    };

    /**
     * Method to handle POST request
     *
     * @param { Object } data - All information needed to handle the request
     * @param { Object } callback - Response from the request (statusCode, payload)
     */
    const post = ({ payload }, callback) => {
        if(!_helpers.validatePayload(payload)) return callback(400, { msg: 'Invalid Credentials' });

        let { password, confirmPassword } = payload;
        if(!_helpers.confirmPassword(password, confirmPassword)) return callback(400, { msg: 'Password did not match' });

        let hashedPassword = _helpers.hashPassword(password);
        let userId = _helpers.generateId(20);

        payload.password = hashedPassword;
        payload.userId = userId;
        delete payload.confirmPassword;
        
        let payloadString = JSON.stringify(payload);
    
        createUser(payload.email, payloadString, err => {
            if(err) return callback(400, { msg: err });
            callback(201);
        });
    };

    /**
     * Method to handle PUT request
     *
     * @param { Object } data - All information needed to handle the request
     * @param { Object } callback - Response from the request (statusCode, payload)
     */
    const put = (data, callback) => {

    };

    /**
     * Method to handle DELETE request
     *
     * @param { Object } data - All information needed to handle the request
     * @param { Object } callback - Response from the request (statusCode, payload)
     */
    const deleteUser = (data, callback) => {
        
    }

    /**
     * Method to handle incoming request
     *
     * @param { Object } data - All information needed to handle the request
     * @param { Object } callback - Response from the request (statusCode, payload)
     */
    const users = (data, callback) => {
        let { method } = data;
        switch(method) {
            case 'post':
                method = post;
                break;
            case 'put':
                method = put;
                break;
            case 'get':
                method = get;
                break;
            case 'head':
                method = head;
                break;
            case 'delete':
                method = deleteUser;
                break;
        };
        
        method(data, (statusCode, payload) => {
            callback(statusCode, payload);
        });
    };

    return users;
})();



