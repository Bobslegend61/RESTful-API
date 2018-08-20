/**
 * Create and export configuration variables
 */

//  Container for all the environments
const environments = {};

// Staging (default) environment
environments.staging = {
    port: 3000,
    envName: 'staging'
};

// Production environment
environments.production = {
    port: 5000,
    envName: 'production'
};

// Determine which environmentwas passed as a command line argument
let currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current encironment is one of the environment above, if not, dfault to staging
let environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// export module
module.exports = environmentToExport;