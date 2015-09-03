'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Letter = mongoose.model('Article'),
    User = mongoose.model('User'),
    async = require('async'),
    _ = require('lodash');

/**
 * Create a letter
 */
exports.create = function(req, res) {
    var letter = new Letter(req.body);

    letter.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(letter);
        }
    });
};

/**
 * Show the current article
 */
exports.read = function(req, res) {
    res.json(req.article);
};

/**
 * Update a article
 */
exports.update = function(req, res) {
    var article = req.article;

    article = _.assign(article, req.body);
    article.updated = article.name ? Date.now() : '';

    article.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(article);
        }
    });
};

/**
 * Delete an article
 */
exports.delete = function(req, res) {
    var article = req.article;

    article.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            return res.status(200).send({
                message: 'Candidate Deleted'
            });
        }
    });
};

/**
 * List of Letters
 */
exports.index = function(req, res) {

    var random_num = Math.floor(Math.random() * 100);
    
    var possible_sort = ['submitted', '-submitted', 'photo', '-photo', 'last_name', '-last_name', 'bio', '-bio', 'statement', '-statement'];
    var sortBy = possible_sort[random_num % 10];

    Letter.find({}, '-__v -created -updated').sort(sortBy).exec(function(err, letters) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(letters);
        }
    });

};

exports.resetCandidates = function(req, res) {
    Letter.remove({}, function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            console.log('All Candidates Removed');
        }
    });
};

/**
 * Letter middleware
 */
exports.articleByID = function(req, res, next, id) {
    Letter.findOne({
        _id: id
    }, '-created').exec(function(err, article) {
        if (err) return next(err);
        if (!article) return next(new Error('Failed to load article ' + id));
        req.article = article;
        next();
    });
};