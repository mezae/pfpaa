'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Global = mongoose.model('Global'),
    User = mongoose.model('User'),
    async = require('async'),
    _ = require('lodash');

/**
 * Create a global
 */
exports.create = function(req, res) {
    var global = new Global(req.body);

    global.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(global);
        }
    });
};

/**
 * Show the current global
 */
exports.read = function(req, res) {
    res.json(req.global);
};

/**
 * Update a global
 */
exports.update = function(req, res) {
    var global = req.global;

    global = _.assign(global, req.body);
    global.updated = Date.now();

    global.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(global);
        }
    });
};

/**
 * Delete an global
 */
exports.delete = function(req, res) {
    var global = req.global;

    global.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            return res.status(200).send({
                message: 'Global Deleted'
            });
        }
    });
};

/**
 * List of Globals
 */
exports.index = function(req, res) {

    Global.find().exec(function(err, globals) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(globals);
        }
    });

};

exports.resetCandidates = function(req, res) {
    Global.remove({}, function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            console.log('All Globals Removed');
        }
    });
};

/**
 * Global middleware
 */
exports.globalByID = function(req, res, next, id) {
    Global.findOne({
        _id: id
    }).exec(function(err, global) {
        if (err) return next(err);
        if (!global) return next(new Error('Failed to load global ' + id));
        req.global = global;
        next();
    });
};