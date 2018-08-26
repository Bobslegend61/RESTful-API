/**
 * These are worker related tasks
 */


//  Dependencies
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const url = require('url');

const _data = require('./data');
const helpers = require('./helpers');

// Instantiate the worker object
const workers = {};

// Lookup all the checks, get their data, send to a validator
workers.gatherAllChecks = () => {
    // Get all the checks that exist in the system
    _data.list('checks', (err, checks) => {
        if(!err && checks && checks.length > 0) {
            checks.forEach(check => {
                // Read in the check data
                _data.read('checks', check, (err, originalCheckData) => {
                    if(!err && originalCheckData) {
                        // pass it to the check validator, and let that function continue or log errors as needed
                        workers.validateCheckData(originalCheckData);
                    }else {
                        console.log('Error reading one of the check\'s data');
                    }
                });
            });
        }else {
            console.log('Error: Could not find any checks to process');
        }
    })
};

// Sanity-check the check-data
workers.validateCheckData = (originalCheckData) => {
    originalCheckData = typeof(originalCheckData) == 'object' && originalCheckData !== null ? originalCheckData : {};

    originalCheckData.id = typeof(originalCheckData.id) == 'string' && originalCheckData.id.trim().length == 20 ? originalCheckData.id : false;
    originalCheckData.userPhone = typeof(originalCheckData.userPhone) == 'string' && originalCheckData.userPhone.trim().length == 10 ? originalCheckData.userPhone : false;
    originalCheckData.protocol = typeof(originalCheckData.protocol) == 'string' && ['http', 'https'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false;
    originalCheckData.url = typeof(originalCheckData.url) == 'string' && originalCheckData.url.trim().length > 0 ? originalCheckData.url : false;
    originalCheckData.method = typeof(originalCheckData.method) == 'string' && ['get', 'post', 'put', 'delete'].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false;
    originalCheckData.successCodes = typeof(originalCheckData.successCodes) == 'object' && originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ? originalCheckData.successCodes : false;
    originalCheckData.timeoutSeconds = typeof(originalCheckData.timeoutSeconds) === 'number' && originalCheckData.timeoutSeconds % 1 == 0 && originalCheckData.timeoutSeconds >= 1 && originalCheckData.timeoutSeconds <= 5 ? originalCheckData.timeoutSeconds : false;

    // Set the keys that may not be set if the workers have never seen this check before
    originalCheckData.state = typeof(originalCheckData.state) == 'string' && ['up', 'down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';
    originalCheckData.lastChecked = typeof(originalCheckData.lastChecked) === 'number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false;
    
    // if all the checks passed, pass the data along to the next step in the process
    if(originalCheckData.id &&
    originalCheckData.userPhone &&
    originalCheckData.protocol &&
    originalCheckData.url &&
    originalCheckData.method &&
    originalCheckData.successCodes &&
    originalCheckData.timeoutSeconds
    ) {
        workers.performCheck(originalCheckData);
    }else {
        console.log('Error: One of the checks is not properly formatted. Skipping it..');
    }

};

// Perform the check, send the originalCheckData and the outcome to the next step in the process
workers.performCheck = (originalCheckData) => {
    // Prepare the initial check outcome
    let checkOutcome = {
        error: false,
        responseCode: false,
    };

    // Mark that the outcome has not been sent yet
    let outcomeSent = false;

    // Parse the hosename and the path out of the original check data
    let parsedUrl = url.parse(originalCheckData.protocol+'://'+originalCheckData.url, true);
    let hostName = parsedUrl.hostname;
    let path = parsedUrl.path;  // Using path because we want the query string

    // Construct the request
    let requestDetails = {
        protocol: originalCheckData.protocol+':',
        hostname: hostName,
        method: originalCheckData.method.toUpperCase(),
        path,
        timeout: originalCheckData.timeoutSeconds * 1000
    };

    // Instantiate the request object using either the http or https module
    let _moduleToUse = originalCheckData.protocol == 'http' ? http : https;

    let req = _moduleToUse.request(requestDetails, (res) => {
        // Grab the status of the sent request
        let status = res.stateCode;

        // Update the checkOutcome and pass the data along
        checkOutcome.responseCode = status;
        if(!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });

    // Bind to the error event so it doesn't get thrown
    req.on('error', err => {
        // Update the checkOutcome and pass the data along
        checkOutcome.error = { error: true, value: err };
        if(!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });

    // Bind to the timeout event
    req.on('timeout', err => {
        // Update the checkOutcome and pass the data along
        checkOutcome.error = { error: true, value: 'timeout' };
        if(!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });

    // End the request
    req.end();
};

// Process the check outcome and update the check data as needed, trigger an alert if needed
// Special logic for accommodating a check that has never been tested before (don't need an alert)
workers.processCheckOutcome = (originalCheckData, checkOutcome) => {
    // Decide if the check is considered up or down
    let state = !checkOutcome.error && checkOutcome.responseCode && originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';
    
    // Decide if an alert is warranted
    let alertWanrranted = originalCheckData.lastChecked && originalCheckData.state !== state ? true : false;

    // update the check data
    let newCheckData = originalCheckData;
    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    // Save the update
    _data.update('checks', newCheckData.id, newCheckData, err => {
        if(!err) {
            // Send the newCheckData to the next phase in the process
            if(alertWanrranted) {
                workers.alertUserToStatusChanged(newCheckData);
            }else {
                console.log('Check outcome has not changed, no alert needed');
            }
        }else {
            console.log('Error trying to save updates to one of the check');
        }
    })

};

// Alert the user as to a change  in their check status
workers.alertUserToStatusChanged = (newCheckData) => {
    let msg = 'Alert: Your check for '+newCheckData.method.toUpperCase()+ ' '+ newCheckData.protocol+'://'+newCheckData
    .url+' is currently '+newCheckData.state;
    helpers.sendTwilioSms(newCheckData.userPhone, msg, err => {
        if(!err) {
            console.log('Success: User was alerted to a status change in the check via sms:', msg);
        }else {
            console.log('Error: Could not send sms alert to user who had a state change in their check');
        }
    })
};

// Timer to execute the worker-process once per minute
workers.loop = () => {
    setInterval(() => workers.gatherAllChecks(), 1000 * 60)
}

// init script
workers.init = () => {
    // Excute all the checks immediately
    workers.gatherAllChecks();

    // Call the loop so the checks will execute later on
    workers.loop();

}

// Export the module
module.exports = workers;