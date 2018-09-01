/**
 * Router Config setup
 */

const { users, notFound, login } = require('./handlers');

module.exports = {
    users,
    notFound,
    login
};
