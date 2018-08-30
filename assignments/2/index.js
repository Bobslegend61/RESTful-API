/**
 * Entry file for this app.
 */

const server = require('./lib/server');

const app = {};
app.init = () => {
    server.init();
}

app.init();