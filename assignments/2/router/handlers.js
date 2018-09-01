/**
 * Router handlers
 */

const users = require('./routes/users');
const notFound = require('./routes/not-found');
const login = require('./routes/login');

module.exports = { users, notFound, login };
