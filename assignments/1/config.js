/**
 * Configuration File
 */

const environments = {};

// setting up staging environment 
environments.staging = {
    httpPort: 3000,
    httpsPort: 3001,
    envName: `staging`,
};

// setting up production environment
environments.production = {
    httpPort: 5000,
    httpsPort: process.env.PORT || 5001,
    envName: `production`
}

const currentEnvironment = process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase() : ``;

module.exports = typeof(environments[currentEnvironment]) == `object` ? environments[currentEnvironment] : environments.staging;

