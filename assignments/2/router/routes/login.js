/**
 * Login Route
 */
const _helpers = require('../../lib/helpers');
const { getUser } = require('../../lib/users');

module.exports = (() => {

    const post = ({ payload }, callback) => {
        if(!_helpers.validatePayload(payload)) return callback(400, { msg: 'Invalid Credentials' });

        getUser(payload.email, (err, { password }) => {
            if(err) return callback(400, { msg: 'User not found' });
            let hashedPwd = _helpers.hashPassword(payload.password);
            if(!_helpers.confirmPassword(password, payload.password)) return callback(400, { msg: 'Email/Password incorrect' });


        });
    };


    const login = (data, callback) => {
        if(data.method !== 'post') return callback(400);
        post(data, callback);
    };

    return login;
})();