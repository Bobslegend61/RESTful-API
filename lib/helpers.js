/**
 * Helpers for various tasks
 */

// Dependencies
const crypto = require('crypto');
const https = require('https');
const config = require('./config');
const queryString = require('querystring');

//  Container for all the helpers
const helpers = {};

// Create a SHA256 hash
helpers.hash = (str) => {
    if(typeof(str) == 'string' && str.length > 0) {
        let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    }else {
        return false;
    }
};

// Parse a JSON string to an object in all cases without throwing
helpers.parseJsonToObject = (str) => {
    try {
        let obj = JSON.parse(str);
        return obj;
    }catch(err) {
        return {};
    }
}

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = (strLength) => {
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
    if(strLength) {
        // Define all the possible characters that could go into a strig
        let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

        // Start the final string
        let str = '';
        for(let i = 1; i <= strLength; i++) {
            // Get a random random character from the possibleCharacters string
            let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));

            // Append this character to the ginal string
            str+= randomCharacter;
        };

        // Return the final string
        return str;
    }else {
        return false;
    }
};

// Send an SMS message via Twilio
helpers.sendTwilioSms = (phone, msg, callback) => {
    // Validate parameters
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
    msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;
    if(phone && msg) {
        // Configure the request payload
        let payload = {
            From: config.twilio.fromPhone,
            To: '+234'+phone,
            Body: msg
        }

        // Stringify the payload
        let stringPayload = queryString.stringify(payload);

        // configure the request details
        let requestDetails =  {
            protocol: 'https:',
            hostname: 'api.twilio.com',
            path: '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
            auth: config.twilio.accountSid+':'+config.twilio.authToken,
            headers: {
                'Content-Type': 'application/x-www-from-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
            }
        };

        // instantiate request object
        let req = https.request(requestDetails, (res) => {
            // Grab the status of the sent request
            let status = res.statusCode;
            // callback successfully if the request went through
            if(status == 200 || status == 201) {
                callback(false);
            }else {
                callback('Status code returned was '+ status);
            }
        });

        // Bind to the error event so it doesnt get trown
        req.on('err', err => {
            callback(err);
        });

        // Add payload
        req.write(stringPayload);

        // End the request
        req.end();
    }else {
        callback('Given parameters were missing or invalid');
    }
};

// Export helpers
module.exports = helpers;