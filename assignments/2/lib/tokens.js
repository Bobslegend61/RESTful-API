/**
 * Tokens CRUD.
 */
const path = require('path');

const { create: _hCreate } = require('./helpers');

module.exports = (() => {
    const baseDir = path.join(__dirname, '/../.data/tokens/');

    /**
     * Creates a token in the file system.
     * 
     * @param { string } fileName - Name of the file to store the token.
     * @param { string } data - Details of the token.
     * @param { Object } callback - function to return error if any.
     */
    const create = (fileName, data, callback) => {
        _hCreate(baseDir+fileName, '.json', data, callback);
    };


    return {
        create
    };
})();