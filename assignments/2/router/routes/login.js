/**
 * Login Route
 */
const _helpers = require('../../lib/helpers');
const { getFile } = require('../../lib/fs');
const tokens = require('./tokens');

module.exports = (() => {

    /**
     * Login route
     *
     * @param { Object } { payload, method } - Login credentials
     * @param { Object } callback Function to call to send response.
     * @returns - Response
     */
    const post = ({ payload, method }, callback) => {
        if(!_helpers.validatePayload(payload)) return callback(400, { msg: 'Invalid Credentials' });

        getFile('.data/users', payload.email, (err, { password, email, userId }) => {
            if(err) return callback(400, { msg: 'User not found' });
            let hashedPwd = _helpers.hashPassword(payload.password);
            if(!_helpers.confirmPassword(password, hashedPwd)) return callback(400, { msg: 'Email/Password incorrect' });

            tokens({ email, userId, method }, (err, tokenData) => {
                if(err) return callback(500, { msg: err });
                callback(200, tokenData);
            });
        });
    };


    const login = (data, callback) => {
        if(data.method !== 'post') return callback(400);
        post(data, (statusCode, data) => {
            callback(statusCode, data);
        });
    };

    return login;
})();