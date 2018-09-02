/**
 * Helpers function file
 */

const fs = require('fs');
const crypto = require('crypto');

const helpers = {};

/**
 * Converts a stringified object to JSON object
 *
 * @param {string} str - Stringified object to be parsed
 * @returns The parsed JSON object
 */
helpers.parseToJson = (str) => {
    try {
        const parsedStr = JSON.parse(str);
        return parsedStr;
    }catch(err) {
        return {};
    }
};

/**
 * Check if password is correct.
 *
 * @param { string } password - password.
 * @param { string } confirmPassword - compared password.
 * @returns Boolean.
 */
helpers.confirmPassword = (password, confirmPassword) => {
    return password === confirmPassword ? true : false;
};

/**
 * Function to check if a value is not a string and also invalidate the length
 *
 * @param { any } data - Value to check.
 * @param { number } len - Desired length.
 * @returns Boolean 
 */
helpers.checkIfNotStringAndLength = (data, len) => {
    return typeof(data) !== 'string' || data.trim().length <= len ? true : false;
};

/**
 * Hash a password.
 *
 * @param { string } password - Plain password to be hashed.
 * @returns The hashed password.
 */
helpers.hashPassword = (password) => {
    let hash = crypto.createHash('sha256');
    hash.update(password);
    return hash.digest('hex');
};

helpers.generateId = (len) => {
    let str = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let id = '';
    for(let i = 0; i <= len; i++) {
        id+= str[Math.floor(Math.random() * (str.length - 1))];
    }
    return id;
};

/**
 * Function to validate user info
 *
 * @param { Object } payload - Object containing user info
 * @returns Boolean
 */
helpers.validatePayload = (payload) => {
    if(typeof(payload) !== 'object') return false;
    let isValid = true;
    const keys = Object.keys(payload);

    for(let key of keys) {
   
        switch(key) {
            case 'name': 
                if(helpers.checkIfNotStringAndLength(payload[key], 0)) {
                    isValid = false;
                }
                break;
            case 'email':
                let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if(helpers.checkIfNotStringAndLength(payload[key], 0) || re.test(payload[key]) !== true) {
                    isValid = false;
                }
                break;
            case 'password': 
                if(helpers.checkIfNotStringAndLength(payload[key], 5)) {
                    isValid = false;
                }
                break;
            case 'confirmPassword':
                if(helpers.checkIfNotStringAndLength(payload[key], 5)) {
                    isValid = false;
                }
                break;
            case 'address':
                if(typeof(payload[key]) !== 'object' || Object.keys(payload[key]).length !== 5
                ) {
                    isValid = false;
                }else {
                    for(let subKey of Object.keys(payload[key])) {
                        
                        switch(subKey) {
                            case 'country':
                                if(helpers.checkIfNotStringAndLength(payload[key][subKey], 0)) {
                                    isValid = false;
                                }
                                break;
                            case 'state':
                                if(helpers.checkIfNotStringAndLength(payload[key][subKey], 0)) {
                                    isValid = false;
                                }
                                break;
                            case 'city':
                                if(helpers.checkIfNotStringAndLength(payload[key][subKey], 0)) {
                                    isValid = false;
                                }
                                break;
                            case 'street': 
                                if(helpers.checkIfNotStringAndLength(payload[key][subKey], 0)) {
                                    isValid = false;
                                }
                                break;
                            case 'no':
                                if(typeof(payload[key][subKey]) !== 'number') {
                                    isValid = false;
                                }
                                break;
                            default:
                                isValid = false;
                        };
                        if(!isValid) {
                            break;
                        }
                    };
                };
                break;
            default: 
                isValid = false;
        };
        if(!isValid) {
            break;
        }
    };
    
    return isValid;
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

helpers.list = (dir, callback) => {
    fs.readdir(dir, (err, files) => {
        if(err) return callback('Error reading files');

        callback(false, files);
    });
};

module.exports = helpers;