/**
 * Request handlers
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config');

// Define handlers
let handlers = {};

// Users handlers
handlers.users = (data, callback) => {
    const acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    }else {
        callback(405);
    }
};

// Container for the users submethods
handlers._users = {};

// Users - POST
// Required data: firstName, lastName, phone, password, tosAgreement
handlers._users.post = (data, callback) => {
    // Check that all required fields are filled out
    let { firstName, lastName, phone, password, tosAgreement } = data.payload;
    firstName = typeof(firstName) == 'string' && firstName.trim().length > 0 ? firstName.trim() : false;
    lastName = typeof(lastName) == 'string' && lastName.trim().length > 0 ? lastName.trim() : false;
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
    password = typeof(password) == 'string' && password.trim().length > 0 ? password.trim() : false;
    tosAgreement = typeof(tosAgreement) == 'boolean' && tosAgreement == true > 0 ? true : false;

    if(firstName && lastName && phone && tosAgreement) {
        // Make sure that the user doesn't already exist
        _data.read('users', phone, (err, data) => {
            if(err) {
                // Hash the password
                let hashedPassword = helpers.hash(password);

                // Create the user object
                if(hashedPassword) {

                    let userObject = {
                        firstName,
                        lastName,
                        phone,
                        hashedPassword,
                        tosAgreement
                    };
    
                    // Store the user
                    _data.create('users', phone, userObject, (err) => {
                        if(!err){
                            callback(200);
                        }else {
                            console.log(err);
                            callback(500, { Error: 'Could not create a user' });
                        }
                    });
                }else {
                    callback(500, { Error: 'Could not hash the user\'s password' });
                }
            }else {
                // User already exist
                callback(400, { Error: 'A user with that phone number already exists' });
            }
        });
    }else {
        callback(400, { Error: 'Missing required fields' })
    }

}

// Users - GET
// Required data: phone
// Optional data: none
handlers._users.get = (data, callback) => {
    // Check that the phone number provided is valid
    let { phone } = data.queryStringObject;
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone : false;
    if(phone) {
        // Get the token from the headers
        let { token } = data.headers;
        token = typeof(token) == 'string' && token.trim().length == 20 ? token : false

        // verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, isValid => {
            if(isValid) {
                _data.read('users', phone, (err, data) => {
                    if(!err && data) {
                        // Remove hashed password
                        delete data.hashedPassword;
                        callback(200, data);
                    }else {
                        callback(404);
                    }
                });
            }else {
                callback(403, { Error: 'Missing required token in header or token is invalid' });
            }
        });
    }else {
        callback(400, { Error: 'Missing required field' });
    }
}
// Users - PUT
// Required data: phone
// Optional data: firstName, lastName and password (at least one must be specified)
handlers._users.put = (data, callback) => {
    // Check that the phone number provided is valid
    let { firstName, lastName, phone, password } = data.payload;
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone : false;

    // check for optional field
    firstName = typeof(firstName) == 'string' && firstName.trim().length > 0 ? firstName.trim() : false;
    lastName = typeof(lastName) == 'string' && lastName.trim().length > 0 ? lastName.trim() : false;
    password = typeof(password) == 'string' && password.trim().length > 0 ? password.trim() : false;

    // Error if the phone is invalid
    if(phone) {
        // Error if nothing is sent to update
        if(firstName || lastName || password) {
            // Get the token from the headers
            let { token } = data.headers;
            token = typeof(token) == 'string' && token.trim().length == 20 ? token : false

            // verify that the given token is valid for the phone number
            handlers._tokens.verifyToken(token, phone, isValid => {
                if(isValid) {
                    // Lookup the user
                    _data.read('users', phone, (err, data) => {
                        if(!err && data) {
                            // Update neccessary fields
                            if(firstName) {
                                data.firstName = firstName
                            }
                            if(lastName) {
                                data.lastName = lastName
                            }
                            if(password) {
                                data.hashedPassword = helpers.hash(password);
                            }
        
                            // Store the update
                            _data.update('users', phone, data, err => {
                                if(!err) {
                                    callback(200);
                                }else {
                                    console.log(err);
                                    callback(500, { Error: 'Could not update the user' });
                                }
                            })
                        }else {
                            callback(400, { Error: 'The specified user does not exist' })
                        }
                    });
                }else {
                    callback(403, { Error: 'Missing required token in header or token is invalid' });
                }
            });
        }else {
            callback(400, { Error: 'Missing fields to update' })
        }
    }else {
        callback(400, { Error: 'Missing required field' });
    }
}
// Users - DELETE
// Required fiield: phone
handlers._users.delete = (data, callback) => {
    // Check that the phone number is valid 
    let { phone } = data.queryStringObject;
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone : false;
    if(phone) {
        // Get the token from the headers
        let { token } = data.headers;
        token = typeof(token) == 'string' && token.trim().length == 20 ? token : false

        // verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, isValid => {
            if(isValid) {
                _data.read('users', phone, (err, data) => {
                    if(!err && data) {
                        _data.delete('users', phone, err => {
                            if(!err) {
                                // Delete each of the checks associated with the user
                                let userChecks  = data.checks;
                                userChecks = typeof(userChecks) == 'object' && userChecks instanceof Array ? userChecks : [];
                                let checksToDelete = userChecks.length;
                                if(checksToDelete > 0) {
                                    let checkDeleted = 0;
                                    let deletionErrors = false;

                                    // Loop through the checks
                                    userChecks.forEach(checkId => {
                                        // Delete the check
                                        _data.delete('checks', checkId, err => {
                                            if(err) { 
                                                deletionErrors = true;
                                            }

                                            checkDeleted++;
                                            if(checkDeleted == checkDeleted) {
                                                if(!deletionErrors) {
                                                    callback(200);
                                                }else {
                                                    callback(500, { Errors: 'Errors ecountered while attempting to delete all of the users checks. All of the checks may not have been deleted from the system' });
                                                }
                                            }
                                        });
                                    });
                                }else {
                                    callback(200);
                                }
                            }else {
                                callback(500, { Error: 'Could not delete the specified user' });
                            }
                        })
                    }else {
                        callback(400, { Error: 'Could not find the specified user' });
                    }
                });
            }else {
                callback(403, { Error: 'Missing required token in header or token is invalid' });
            }
        });
    }else {
        callback(400, { Error: 'Missing required field' });
    }
}


// Tokens handlers
handlers.tokens = (data, callback) => {
    const acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    }else {
        callback(405);
    }
};

// Container for all the tokens methods
handlers._tokens = {};

// Tokens - post
// Required data: phone, password
// optional data: none 
handlers._tokens.post = (data, callback) => {
    let {  phone, password } = data.payload;
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone : false;
    password = typeof(password) == 'string' && password.trim().length > 0 ? password.trim() : false;
    if(phone && password) {
        // Lookup the user who matches the phone number
        _data.read('users', phone, (err, data) => {
            if(!err && data) {
                // Hash the sent password and compare it to the password sent
                let hashedPassword = helpers.hash(password);
                if(hashedPassword == data.hashedPassword) {
                    // If valid, create a new token with a random name, set expiration date 1 hour in
                    let tokenId = helpers.createRandomString(20);
                    let expires = Date.now() + (1000 * 60 * 60);
                    let tokenObject = {
                        phone,
                        id: tokenId,
                        expires
                    };

                    // Store the token
                    _data.create('tokens', tokenId, tokenObject, err => {
                        if(!err) {
                            callback(200, tokenObject);
                        }else {
                            callback(500, { Error: 'Could not create the new token' });
                        }
                    });
                }else {
                    callback(400, { Error: 'Password did not match the specified user\'s stored password' });
                }
            }else {
                callback(400, { Error: 'Could not find the specified user' });
            }
        });
    }else {
        callback(400, { Error: 'Missing rquired field(S)' });
    }
}

// Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = (data, callback) => {
    // Check that id is valid
    let { id } = data.queryStringObject;
    id = typeof(id) == 'string' && id.trim().length == 20 ? id : false;
    if(id) {
        _data.read('tokens', id, (err, data) => {
            if(!err && data) {
                callback(200, data);
            }else {
                callback(404);
            }
        })
    }else {
        callback(400, { Error: 'Missing required field' });
    }

}

// Tokens - put
// Required data: id, extend
// Optional data: none
handlers._tokens.put = (data, callback) => {
    let { id, extend } = data.payload;
    id = typeof(id) == 'string' && id.trim().length == 20 ? id : false;
    extend = typeof(extend) == 'boolean' && extend == true ? true : false;
    if(id && extend) {
        // Lookup the token
        _data.read('tokens', id, (err, data) => {
            if(!err && data) {
                // Check if token hasn't expire
                if(data.expires > Date.now()) {
                    // Set expiration an hour from now
                    data.expires = Date.now() + (1000 * 60 * 60);

                    // Store new update
                    _data.update('tokens', id, data, err => {
                        if(!err) {
                            callback(200);
                        }else {
                            callback(500, { Error: 'Could not update the token\'s expiration' });
                        }
                    });
                }else {
                    callback(400, { Error: 'The token has already expire, cannot be extended' });
                }
            }else {
                callback(400, { Error: 'Specified token does not exist' });
            }
        });
    }else {
        callback(400, { Error: 'Missing required field(s) or invalid' });
    }

}

// Tokens - post
// Required data: id
// Optional data: none

handlers._tokens.delete = (data, callback) => {
    // Check that the id is valid 
    let { id } = data.queryStringObject;
    id = typeof(id) == 'string' && id.trim().length == 20 ? id : false;
    if(id) {
        _data.read('tokens', id, (err, data) => {
            if(!err && data) {
                _data.delete('tokens', id, err => {
                    if(!err) {
                        callback(200);
                    }else {
                        callback(500, { Error: 'Could not delete the specified token' });
                    }
                })
            }else {
                callback(400, { Error: 'Could not find the specified token' });
            }
        })
    }else {
        callback(400, { Error: 'Missing required field' });
    }
};


// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = (id, phone, callback) => {
    // Lookup token
    _data.read('tokens', id, (err, data) => {
        if(!err && data) {
            // check that the token is for the given user and has not expired
            if(data.phone == phone && data.expires > Date.now()) {
                callback(true);
            }else {
                callback(false);
            }
        }else {
            callback(false);
        }
    });
};

// Checks handlers
handlers.checks = (data, callback) => {
    const acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._checks[data.method](data, callback);
    }else {
        callback(405);
    }
};

// Container for all the checks methods
handlers._checks = {};

// Checks - POST
// Required data: protocol, url, method, successCodes, timeoutSeconds
// Optional data: none
handlers._checks.post = (data, callback) => {
    // Validate inputs
    let { protocol, url, method, successCodes, timeoutSeconds  } = data.payload;
    protocol = typeof(protocol) == 'string' && ['https', 'http'].indexOf(protocol) > -1 ? protocol : false;
    url = typeof(url) == 'string' && url.trim().length > 0 ? url : false;
    method = typeof(method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(method) > -1 ? method : false;
    successCodes = typeof(successCodes) == 'object' && successCodes instanceof Array && successCodes.length > 0 ? successCodes : false;
    timeoutSeconds = typeof(timeoutSeconds) == 'number' && timeoutSeconds % 1 === 0 && timeoutSeconds >= 1 && timeoutSeconds <= 5 ? timeoutSeconds : false;

    if(protocol && url && method && successCodes && timeoutSeconds) {
        // Get token from the headers
        let { token } = data.headers;
        token = typeof(token) == 'string' ? token : false;

        // Lookup the user by  reading the token
        _data.read('tokens', token, (err, tokenData) => {
            if(!err && tokenData) {
                const userPhone = tokenData.phone;

                // Lookup the user data
                _data.read('users', userPhone, (err, userData) => {
                    if(!err && userData) {
                        let userChecks  = userData.checks;
                        userChecks = typeof(userChecks) == 'object' && userChecks instanceof Array ? userChecks : [];

                        // Verify that the user has less than the number of max checks per user
                        if(userChecks.length < config.maxChecks) {
                            // Create a random id for the check
                            let checkId = helpers.createRandomString(20);

                            // Create check object and include the users phone
                            let checkObjset = {
                                id: checkId,
                                userPhone,
                                protocol,
                                url,
                                method,
                                successCodes,
                                timeoutSeconds
                            }

                            // Store the checks
                            _data.create('checks', checkId, checkObjset, err => {
                                if(!err) {
                                    // Add check id to the users object
                                    userData.checks = userChecks;
                                    userData.checks.push(checkId);

                                    // Save the new user data
                                    _data.update('users', userPhone, userData, err => {
                                        if(!err) {
                                            callback(200, checkObjset);
                                        }else {
                                            callback(500, { Error: 'Could not update the users with a new check' });
                                        }
                                    });
                                }else {
                                    callback(500, { Error: 'Could not create the new check' });
                                }
                            });
                        }else {
                            callback(400, { Error: `The user already has the maximun number of checks (${ config.maxChecks })` });
                        }
                    }else {
                        callback(403);
                    }
                });

            }else {
                callback(403);
            }
        })
    }else {
        callback(400, { Error: 'Missing required inputs or inputs are invalid' });
    }
};

// Checks - get
// Required data: id
// Optional data: none
handlers._checks.get = (data, callback) => {
    // Check that the id provided is valid
    let { id } = data.queryStringObject;
    id = typeof(id) == 'string' && id.trim().length == 20 ? id : false;
    if(id) {
        // Lookup check
        _data.read('checks', id, (err, checkData) => {
            if(!err && checkData) {

                // Get the token from the headers
                let { token } = data.headers;
                token = typeof(token) == 'string' && token.trim().length == 20 ? token : false
        
                // verify that the given token is valid and belongs to the users who created it
                handlers._tokens.verifyToken(token, checkData.userPhone, isValid => {
                    if(isValid) {
                        // Return the check data
                        callback(200, checkData);
                    }else {
                        callback(403);
                    }
                });
            }else {
                callback(404);
            }
        });

    }else {
        callback(400, { Error: 'Missing required field' });
    }
};

// Check - put
// Required data: id
// Optional data: protocol, url, method, successCodes, timeoutSeconds
handlers._checks.put = (data, callback) => {
    // Check that the phone number provided is valid
    let { id } = data.payload;
    id = typeof(id) == 'string' && id.trim().length == 20 ? id : false;

   // Validate inputs
   let { protocol, url, method, successCodes, timeoutSeconds  } = data.payload;
   protocol = typeof(protocol) == 'string' && ['https', 'http'].indexOf(protocol) > -1 ? protocol : false;
   url = typeof(url) == 'string' && url.trim().length > 0 ? url : false;
   method = typeof(method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(method) > -1 ? method : false;
   successCodes = typeof(successCodes) == 'object' && successCodes instanceof Array && successCodes.length > 0 ? successCodes : false;
   timeoutSeconds = typeof(timeoutSeconds) == 'number' && timeoutSeconds % 1 === 0 && timeoutSeconds >= 1 && timeoutSeconds <= 5 ? timeoutSeconds : false;

   // Check to make sure id is valid
   if(id) {
    // check to make sure one or more optional fields has been sent
    if(protocol || url || method || successCodes || timeoutSeconds) {
        // Look up check
        _data.read('checks', id, (err, checkData) => {
            if(!err && checkData) {
                // Get the token from the headers
                let { token } = data.headers;
                token = typeof(token) == 'string' && token.trim().length == 20 ? token : false;

                // verify that the given token is valid and belongs to the users who created it
                handlers._tokens.verifyToken(token, checkData.userPhone, isValid => {
                    if(isValid) {
                        // update the check where neccessary
                        if(protocol) {
                            checkData.protocol = protocol;
                        }
                        if(url) {
                            checkData.url = url;
                        }
                        if(method) {
                            checkData.method = method;
                        }
                        if(successCodes) {
                            checkData.successCodes = successCodes;
                        }
                        if(timeoutSeconds) {
                            checkData.timeoutSeconds = timeoutSeconds;
                        }

                        // Store the updates
                        _data.update('checks', id, checkData, err => {
                            if(!err) {
                                callback(200);
                            }else {
                                callback(500, { Error: 'Could not update the check' });
                            }
                        })
                    }else {
                        callback(403);
                    }
                });
            }else {
                callback(400, { Error: 'Check id did not exist' });
            }
        })
    }else {
        callback(400, { Error: 'Missing field to update' });
    }
        
   }else {
       callback(400, { Error: 'Missing Required field(s)' })
   }
};

// Checks - delete
// Required data: id
// Optional data: none
handlers._checks.delete = (data, callback) => {
    // Check that the phone number is valid 
    let { id } = data.queryStringObject;
    id = typeof(id) == 'string' && id.trim().length == 20 ? id : false;
    if(id) {
        // lookup check
        _data.read('checks', id, (err, checkData) => {
            if(!err && checkData) {
                // Get the token from the headers
                let { token } = data.headers;
                token = typeof(token) == 'string' && token.trim().length == 20 ? token : false

                // verify that the given token is valid for the phone number
                handlers._tokens.verifyToken(token, checkData.userPhone, isValid => {
                    if(isValid) {

                        // Delete the check data
                        _data.delete('checks', id, err => {
                            if(!err) {
                                // Lookup the user
                                _data.read('users', checkData.userPhone, (err, userData) => {
                                    if(!err && userData) {
                                        let userChecks  = userData.checks;
                                        userChecks = typeof(userChecks) == 'object' && userChecks instanceof Array ? userChecks : [];

                                        // Remove the deleted check from the lists of checkes
                                        let checkPosition = userChecks.indexOf(id);
                                        if(checkPosition > -1) {
                                            userChecks.splice(checkPosition, 1);

                                            // Re-save the users data
                                            _data.update('users', checkData.userPhone, userData, err => {
                                                if(!err) {
                                                    callback(200);
                                                }else {
                                                    console.log(err);
                                                    callback(500, { Error: 'Could not update the user' });
                                                }
                                            })
                                        }else {
                                            callback(500, { Error: 'Could not find the check on the users object' });
                                        }
                                    }else {
                                        callback(500, { Error: 'Could not find the user who created the check' });
                                    }
                                });
                            }else {
                                callback(500, { Error: 'Could not delete the check data' });
                            }
                        });
                    }else {
                        callback(403);
                    }
                });
            }else {
                callback(400, { Error: 'The specified check ID does not exist' });
            }
        });
    }else {
        callback(400, { Error: 'Missing required field' });
    }
};

// ping handler
handlers.ping = (data, callback) => {
    callback(200);
}

// not found handler
handlers.notFound = (data, callback) => {
    callback(404);
}

// Export handlers
module.exports = handlers;