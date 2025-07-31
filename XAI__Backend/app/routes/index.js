
const UserRoutes = require('./user.routes');
const AuthRoutes = require('./auth.routes');
module.exports = [
    new UserRoutes(),
    new AuthRoutes(),
]