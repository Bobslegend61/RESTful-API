/**
 * Lib for files
 */
const path = require('path');

const { create, update, read, delete: helpersDelete } = require('./helpers');

module.exports = (() => {
    const baseDir = path.join(__dirname, '/../');

    /**
     * Creates a file in the file system
     *
     * @param { string } fileName - Name of the file to store the file.
     * @param { string } data - Details of the file.
     * @param { Object } callback - function to return error if any.
     */
    const createFile = (folder,fileName, data, callback) => {
        const ext = /.data/.test(folder) ? '.json' : '.log';
        create(`${ baseDir }${ folder }/${ fileName }`, ext, data, callback);
    };

    /**
     * Updates a file in the file system.
     *
     * @param { string } fileName - Name of the file file to update.
     * @param { string } data - Details of the file.
     * @param { Object } callback - function to return error if any.
     */
    const updateFile = (folder, fileName, data, callback) => {
        const ext = /.data/.test(folder) ? '.json' : '.log';
        update(`${ baseDir }${ folder }/${ fileName }`, ext, data, callback);
    };

    /**
     * Get a file from the file system
     *
     * @param { string } fileName - Name of the file file to get.
     * @param { Object } callback - function to return error if any or data.
     */
    const getFile = (folder, fileName, callback) => {
        const ext = /.data/.test(folder) ? '.json' : '.log';
        read(`${ baseDir }${ folder }/${ fileName }`, ext, callback);
    };

    /**
     * Delete a file from the file system
     *
     * @param { string } fileName - Name of the file file to delete.
     * @param { Object } callback - function to return error if any.
     */
    const deleteFile = (folder, fileName, callback) => {
        const ext = /.data/.test(folder) ? '.json' : '.log';
        helpersDelete(`${ baseDir }${ folder }/${ fileName }`, ext, callback);
    };

    return {
        createFile,
        updateFile,
        getFile,
        deleteFile
    }
})();