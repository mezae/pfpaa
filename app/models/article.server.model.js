'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Article Schema
 */
var ArticleSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    first_name: {
        type: String,
        default: ''
    },
    last_name: {
        type: String,
        default: ''
    },
    prep_name: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    statement: {
        type: String,
        default: ''
    },
    photo: {
        type: String
    },
    submitted: {
        type: Date
    },
    updated: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('Article', ArticleSchema);