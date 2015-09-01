'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
    globals = require('../../app/controllers/globals.server.controller');

module.exports = function(app) {
    // Article Routes
    app.route('/globals')
        .get(users.requiresLogin, globals.index)
        .post(users.hasAuthorization('admin'), globals.create);

    // app.route('/globals/reset').get(users.hasAuthorization('admin'), globals.resetCandidates);

    app.route('/globals/:globalId')
        .get(users.requiresLogin, globals.read)
        .put(users.hasAuthorization('admin'), globals.update)
        .delete(users.hasAuthorization('admin'), globals.delete);

    // Finish by binding the global middleware
    app.param('globalId', globals.globalByID);
};