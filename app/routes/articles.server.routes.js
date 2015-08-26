'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
    articles = require('../../app/controllers/articles.server.controller');

module.exports = function(app) {
    // Article Routes
    app.route('/articles')
        .get(users.requiresLogin, articles.index)
        .post(users.requiresLogin, articles.create);

    app.route('/articles/reset').get(users.hasAuthorization('admin'), articles.resetCandidates);

    app.route('/articles/:articleId')
        .get(users.requiresLogin, articles.read)
        .put(users.requiresLogin, articles.update)
        .delete(users.requiresLogin, articles.delete);

    // Finish by binding the article middleware
    app.param('articleId', articles.articleByID);
};