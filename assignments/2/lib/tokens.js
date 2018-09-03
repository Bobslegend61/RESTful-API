/**
 * TOKENS ROUTES
 */

const _helpers = require('./helpers');
const { createFile } = require('./fs');

module.exports = (() => {

    const post = ({ email, userId }, callback) => {
        const id = _helpers.generateId(20);
        const token = _helpers.generateId(30) + userId;
        const expiresIn = Date.now() + (1000 * 60 * 60 );

        const tokenData = JSON.stringify({ id, token, expiresIn, email, userId });
        createFile('.data/tokens', id, tokenData, err => {
            if(err) return callback(500);
            
            let parsedTokenData = _helpers.parseToJson(tokenData);
            delete parsedTokenData.expiresIn;
            callback(err, parsedTokenData);
        });
    };


    return {
        post
    };
})();