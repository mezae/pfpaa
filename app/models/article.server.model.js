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
    name: {
        type: String,
        default: ''
    },
    contingent: {
        type: Number,
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
    picture: {
        type: String,
        default: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/240px-No_image_available.svg.png'
    },
    updated: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('Article', ArticleSchema);