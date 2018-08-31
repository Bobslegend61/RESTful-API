/**
 * Helpers function file
 */

const fs = require('fs');

const helpers = {};

/**
 * Converts a stringified object to JSON object
 *
 * @param {string} str - Stringified object to be parsed
 * @returns The parsed JSON object
 */
helpers.parseToJson = (str) => {
    try {
        let parsedStr = JSON.parse(str);
        return parsedStr;
    }catch(err) {
        return {};
    }
};

/**
 * Helper to validate status code and payload to be sent to the client.
 *
 * @param { number } statusCode - status code
 * @param { object } payload - data to be sent to the client
 * @returns Object containing the status code and the payload (if non, defaluts to {})
 */
helpers.checkStatusCodeAndPayload = (statusCode, payload) => {
    statusCode = typeof(statusCode) == 'number' && statusCode.toString().length === 3 ? statusCode : 200;
    payload = typeof(payload) == 'object' ? payload : {};

    return { statusCode, payload };
};

/**
 * Check if request method is acceptable
 *
 * @param { string } method - request method
 * @returns Callback with a Boolean value 
 */
helpers.checkMethod = (method, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete', 'head'];
    let check =  (acceptedMethods.indexOf(method) > -1) ? true : false;
    return callback(check);
};

/**
 * Creating a file
 *
 * @param { String } path - Path and name of the file to be created.
 * @param { string } ext - Extension of the file to create.
 * @param { string } data - Data to write to the file
 * @param { Object } callback - Function that returns an error if any.
 */
helpers.create = (path, ext, data, callback) => {
    fs.open(path+ext, 'wx', (err, fileDescriptor) => {
        if(err) return callback('Error opening file for writing');

        fs.writeFile(fileDescriptor, data, err => {
            if(err) return callback('Error writing file');

            fs.close(fileDescriptor, err => {
                if(err) return callback('Error Closing file');

                return callback(false);
            });
        });
    });
};

/**
 * Read a file
 *
 * @param { String } path - Path and name of the file to be read.
 * @param { string } ext - Extension of the file to read.
 * @param { Object } callback - Function that returns error if any or the data
 */
helpers.read = (path, ext, callback) => {
    fs.readFile(path+ext, 'utf8', (err, data) => {
        if(err) return callback('Error reading file');

        return callback(false, JSON.parse(data));
    });
};

/**
 * Updating a file
 *
 * @param { String } path - Path and name of the file to be updated.
 * @param { string } ext - Extension of the file to update.
 * @param { string } data - Data to update to the file
 * @param { Object } callback - Function that returns an error if any.
 */
helpers.update = (path, ext, data, callback) => {
    fs.open(path+ext, 'r+', (err, fileDescriptor) => {
        if(err) return callback('Error opening file for updating');

        fs.truncate(fileDescriptor, err => {
            if(err) return callback('Error truncating file for updating');

            fs.writeFile(fileDescriptor, data, err => {
                if(err) return callback('Error writing file for update');

                fs.close(fileDescriptor, err => {
                    if(err) return callback('Error closing file after truncating for update');
    
                   return callback(false);
                });
            });
        });
    });
};

/**
 * Delete a file from the file system
 *
 * @param { String } path - Path and name of the file to be deleted.
 * @param { string } ext - Extension of the file to delete.
 * @param { Object } callback - Function that returns an error if any.
 */
helpers.delete = (path, ext, callback) => {
    fs.unlink(path+ext, err => {
        if(err) return callback('Error deleting a file');

        return callback(false);
    });
};

/**
 * Appending to a file in the file system
 *
 * @param { String } path - Path and name of the file to be appended to.
 * @param { string } ext - Extension of the file to be appended to.
 * @param { string } data - Data to append to the file.
 * @param { Object } callback - Function that returns an error if any.
 */
helpers.append = (path, ext, data, callback) => {
    fs.open(path+ext, 'a', (err, fileDescriptor) => {
        if(err) return callback('Error opening file for appending');

        fs.appendFile(fileDescriptor, data+'\n', err => {
            if(err) return callback('Error appending file');

            fs.close(fileDescriptor, err => {
                if(err) return callback('Error closing file after appending');

                return callback(false);
            });
        });
    });
};

helpers.list = () => {

};

module.exports = helpers;