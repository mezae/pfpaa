'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    errorHandler = require('../errors.server.controller'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    async = require('async'),
    User = mongoose.model('User'),
    Letter = mongoose.model('Article');
var https = require('https');

exports.addAdmin = function(req, res) {
    // Init Variables
    var user = new User(req.body);
    var message = null;

    // Add missing user fields
    user.password = process.env.ADMIN_PW;
    user.role = 'admin';

    // Then save the user 
    user.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {

            user.salt = undefined;
            user.password = undefined;
            user.provider = undefined;
            user.created = undefined;

            res.json(user);
        }
    });
};

/**
 * Signup
 */
exports.signup = function(req, res) {
    // For security measurement we remove the role from the req.body object
    delete req.body.role;

    // Init Variables
    var user = new User(req.body);

    // Add missing user fields
    user.password = process.env.USER_PW;

    // Then save the user 
    user.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json({
                message: user.username + ' created'
            });
        }
    });
};

exports.signups = function(req, res) {
    var rows = req.body.file;
    var headers = req.body.headers;

    User.find({}, 'username -_id').exec(function(err, users) {
        if (err) {
            console.log('something went wrong');
        } else {
            var partners = _.pluck(users, 'username');

            _.forEach(rows, function(row) {

                var record = row.split(',');

                if (!_.includes(partners, record[headers.code_col])) {
                    var newPartner = new User({
                        username: record[headers.code_col],
                        password: process.env.USER_PW
                    });
                    newPartner.save(function(err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                    partners.push(newPartner.username);
                }

            });

            if (req.body.isLast) {
                var user = req.user;
                user.status = 1;
                user.updated = Date.now();

                user.save(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        user.provider = undefined;
                        user.created = undefined;
                        user.children = undefined;
                        user.teens = undefined;
                        user.seniors = undefined;
                        user.updated = undefined;
                        user.rating = undefined;
                        res.json(user);
                    }
                });
            } else {
                res.send(200);
            }
        }
    });
};

/**
 * Signin after passport authentication
 */
exports.signin = function(req, res, next) {
    var options = {
      host: 'www.google.com',
      path: '/recaptcha/api/siteverify' + '?secret=' + process.env.RCAP_KEY + '&response=' + req.body.rcap,
      method: 'POST'
    };

    var requ = https.request(options, function(resp) {
        resp.on('data', function (chunk) {
            if (JSON.stringify(JSON.parse(chunk)) === JSON.stringify({ success: true })) {
                if (req.body.password === undefined) {
                    req.body.password = process.env.USER_PW;
                }
                passport.authenticate('local', function(err, user, info) {
                    if (err || !user) {
                        res.status(400).send(info);
                    } else {
                        // Remove sensitive data before login
                        user.provider = undefined;
                        user.password = undefined;
                        user.salt = undefined;
                        user.rating = undefined;
                        user.created = undefined;

                        req.login(user, function(err) {
                            if (err) {
                                res.status(400).send(err);
                            } else {
                                res.json(user);
                            }
                        });
                    }
                })(req, res, next);
            }
            else {
                res.status(400).send('recaptcha error');
            }
        });
    });

    requ.on('error', function(e) {
        console.log('problem with request: ' + e.message);
        res.status(400).send('whoa error');
    });

    requ.end();
   
};

/**
 * Signout
 */
exports.signout = function(req, res) {
    req.logout();
    res.redirect('/');
};