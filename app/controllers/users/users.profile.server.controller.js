'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    errorHandler = require('../errors.server.controller.js'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    User = mongoose.model('User'),
    Article = mongoose.model('Article');

//Allows admin access to all submitted ballots
exports.list = function(req, res) {
    User.find({status: 1}, '-_id ballot').exec(function(err, users) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(users);
        }
    });
};

exports.adminList = function(req, res) {
    User.find({role: 'admin'}, '-ballot').exec(function(err, users) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(users);
        }
    });
};

//Allows admin access to individual community partner accounts
exports.agencyByID = function(req, res, next, id) {
    var fields = '-salt -password -provider';
    User.findOne({
        _id: id
    }, fields).exec(function(err, agency) {
        if (err) return next(err);
        if (!agency) return next(new Error('Failed to load user ' + id));
        req.user = agency;
        next();
    });
};

//Shows admin selected community partner account
exports.read = function(req, res) {
    res.json(req.user);
};

//Allows admin to update a community partner account;
//Allows community partner to update their profile info
exports.update = function(req, res) {
    // Init Variables
    var user = req.user;
    var message = null;

    // For security measurement we remove the roles from the req.body object
    delete req.body.role;

    // Merge existing user
    user = _.assign(user, req.body);
    user.updated = Date.now();

    user.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            user.provider = undefined;
            user.created = undefined;
            user.password = undefined;
            user.salt = undefined;
            res.json(user);
        }
    });
};

//Delete a community partner's account
exports.delete = function(req, res) {
    var user = req.user;
    user.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(user);
        }
    });
};

//Send User
exports.me = function(req, res) {
    res.json(req.user || null);
};

exports.resetData = function(req, res) {
    var user = req.user;
    User.remove({
        'role': {
            $ne: 'admin'
        }
    }, function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            Article.remove({}, function() {
                console.log('Deleted all Candidates');
            });
            res.json(user);
        }
    });
};

