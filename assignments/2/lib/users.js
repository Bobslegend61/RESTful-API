/**
 * Lib for users
 */
const path = require('path');

const { create, update, read, delete: helpersDelete } = require('./helpers');

module.exports = (() => {
    const baseDir = path.join(__dirname, '/../.data/users/');

    /**
     * Creates a user in the file system
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

    /**
     * Get a user from the file system
     *
     * @param { string } fileName - Name of the user file to get.
     * @param { Object } callback - function to return error if any or data.
     */
    const getUser = (fileName, callback) => {
        read(baseDir+fileName, '.json', callback);
    };

    /**
     * Delete a user from the file system
     *
     * @param { string } fileName - Name of the user file to delete.
     * @param { Object } callback - function to return error if any.
     */
    const deleteUser = (fileName, callback) => {
        helpersDelete(baseDir+fileName, '.json', callback);
    };

    return {
        createUser,
        updateUser,
        getUser,
        deleteUser
    }
})();