/**
 * Request handlers
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

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
// @TODO: cleanup (delete) any other data associated with this user
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
                                callback(200);
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
}



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