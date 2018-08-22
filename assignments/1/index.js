/**
 * Entry file
 * Author: Alabi Emmanuel
 */

const http = require(`http`);


const config = require(`./config`);
const unifiedFunc = require(`./unifiedfunc`);

// Create http Server
const server = http.createServer((req, res) => {
    unifiedFunc(req, res);
});

// Create https server

// Port
const { httpPort } = config;
server.listen(httpPort, () => console.log(`App listening on port: ${ httpPort }`));