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
// @TODO: Only let authenticated users access their object, don't let them access anyone else's object
handlers._users.get = (data, callback) => {
    // Check that the phone number provided is valid
    let { phone } = data.queryStringObject;
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone : false;
    if(phone) {
        _data.read('users', phone, (err, data) => {
            if(!err && data) {
                // Remove hashed password
                delete data.hashedPassword;
                callback(200, data);
            }else {
                callback(404);
            }
        })
    }else {
        callback(400, { Error: 'Missing required field' });
    }
}
// Users - PUT
// Required data: phone
// Optional data: firstName, lastName and password (at least one must be specified)
// @TODO: Only let an authenticated user update their own object
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
            callback(400, { Error: 'Missing fields to update' })
        }
    }else {
        callback(400, { Error: 'Missing required field' });
    }
}
// Users - DELETE
// Required fiield: phone
// @TODO: Only let an authenticated user delete their own object
// @TODO: cleanup (delete) any other data associated with this user
handlers._users.delete = (data, callback) => {
    // Check that the phone number is valid 
    let { phone } = data.queryStringObject;
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone : false;
    if(phone) {
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
        })
    }else {
        callback(400, { Error: 'Missing required field' });
    }
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