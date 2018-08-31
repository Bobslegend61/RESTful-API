/**
 * Lib for users
 */
const path = require('path');

const { create, update } = require('./helpers');

const users = (() => {
    const baseDir = path.join(__dirname, '/../.data/users/');

    /**
     * Creates a user in the file syatem
     *
     * @param { string } fileName - Name of the file to store the user.
     * @param { string } data - Details of the user.
     * @param { Object } callback - function to return error if any.
     */
    const createUser = (fileName, data, callback) => {
        create(baseDir+fileName, '.json', data, callback);
    };

    /**
     * Updates a user in the file system.
     *
     * @param { string } fileName - Name of the user file to update.
     * @param { string } data - Details of the user.
     * @param { Object } callback - function to return error if any.
     */
    const updateUser = (fileName, data, callback) => {
        update(baseDir+fileName, '.json', data, callback);
    };

    return {
        createUser,
        updateUser
    }
})();