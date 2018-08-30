/**
 * Configuration file for this app.
 */

module.exports = (() => {
    /**
     * Initialization object for staging environment
     */
    const staging = {
        httpPort: 3000,
        httpsPort: 5000,
        envName: 'staging'
    };

    /**
     * Initialization object for production environment
     */
    const production = {
        httpPort: 3001,
        httpsPort: 5001,
        envName: 'production'
    };

    /** 
     * Select and return current environment 
     */
    const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' && process.env.NODE_ENV.toLowerCase() == 'production' ? production : staging;
    return currentEnvironment;
})();