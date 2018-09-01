/**
 * TOKENS ROUTES
 */

const _helpers = require('../../lib/helpers');
const { create } = require('../../lib/tokens'); 

module.exports = (() => {

    const post = ({ email, userId }, callback) => {
        const id = _helpers.generateId(20);
        const token = _helpers.generateId(30) + userId;
        const expiresIn = Date.now() + (1000 * 60 * 60 );

        const tokenData = JSON.stringify({ id, token, expiresIn, email, userId });
        create(id, tokenData, err => {
            let parsedTokenData = _helpers.parseToJson(tokenData);
            delete parsedTokenData.expiresIn;
            callback(err, parsedTokenData);
        });
    };


    /**
     * Tokens route
     *
     * @param { string } { email, userId, method } - Parameters needed for this route.
     * @param { Object } callback - Function to call if resolved.
     */
    const tokens = ({ email, userId, method }, callback) => {
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
                method = deleteToken;
                break;
        };
        method({ email, userId }, callback);
    };

    return tokens;
})();