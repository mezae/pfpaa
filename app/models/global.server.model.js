'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Global Schema
 */
var GlobalSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    setting_name: {
        type: String,
        default: null
    },
    setting_value: {
        type: String,
        default: null
    },
    updated: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('Global', GlobalSchema);