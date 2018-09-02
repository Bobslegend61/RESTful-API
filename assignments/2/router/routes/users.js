/**
 * /users routes
 */

const _helpers = require('../../lib/helpers');
const { createFile, getFile, updateFile } = require('../../lib/fs');

module.exports = (() => {

    /**
     * Method to handle GET request
     *
     * @param { Object } data - All information needed to handle the request
     * @param { Object } callback - Response from the request (statusCode, payload)
     */
    const get = ({ headers: { id, token } }, callback) => {
        if(_helpers.checkIfNotStringAndLength(id, 20) || _helpers.checkIfNotStringAndLength(token, 51)) return callback(401);

        getFile('.data/tokens', id, (err, originalToken) => {
            if(err) return callback(401);
            if(token !== originalToken.token || Date.now() > originalToken.expiresIn) return callback(403);

            getFile('.data/users', originalToken.email, (err, userData) => {
                if(err) return callback(500);
                
                originalToken.expiresIn = Date.now() + (1000 * 60 * 60);
                updateFile('.data/tokens', originalToken.id, JSON.stringify(originalToken), err => {
                    if(err) return callback(500);

                    delete userData.password;
                    callback(200, userData);
                });
            });
        });
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
    
        createFile('.data/users', payload.email, payloadString, err => {
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
    const put = ({ headers: { id, token } , payload }, callback) => {
        if(_helpers.checkIfNotStringAndLength(id, 20) || _helpers.checkIfNotStringAndLength(token, 51)) return callback(401);

        getFile('.data/tokens', id, (err, originalToken) => {
            if(err) return callback(401);
            if(token !== originalToken.token || Date.now() > originalToken.expiresIn) return callback(403);


            if(!_helpers.validatePayload(payload)) return callback(400, { msg: 'Invalid Credentials' });
            if(!payload.email) return callback(400, { msg: 'Invalid Credentials' });
            if(payload.password) {
                if(!payload.confirmPassword) return callback(400, { msg: 'Invalid Credentials' });
                if(!_helpers.confirmPassword(payload.password, payload.confirmPassword)) return callback(400, { msg: 'Invalid Credentials' });
    
                delete payload.confirmPassword;
                payload.password = _helpers.hashPassword(payload.password);
            }

            getFile('.data/users', payload.email, (err, userData) => {
                if(err) return callback(403);

                delete payload.email;
                if(payload.id) delete payload.userId;
                Object.keys(payload).forEach(key => {
                    if(key === 'address') {
                        Object.keys(payload[key]).forEach(subkey => {
                            userData[key][subkey] = payload[key][subkey];
                        });
                    }

                    userData[key] = payload[key];
                });

                updateFile('.data/users', userData.email, JSON.stringify(userData), err => {
                    if(err) return callback(500);

                    originalToken.expiresIn = Date.now() + (1000 * 60 * 60);
                    updateFile('.data/tokens', originalToken.id, JSON.stringify(originalToken), err => {
                        if(err) return callback(500); 

                        callback(200);
                    });
                });
            });
        });

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
        
        method(data, callback);
    };

    return users;
})();



