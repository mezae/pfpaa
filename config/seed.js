/**
 * Populate DB with seed data on server start if admin account does not exist
 */

'use strict';

var chalk = require('chalk');
var User = require('../app/models/user.server.model.js');

console.log('here');

User.count({
    'username': 'AAA'
}, function(err, exists) {
    console.log('here');
    if (!exists) {
        User.create({
            provider: 'local',
            role: 'admin',
            username: 'AAA',
            email: 'meza.elmer@gmail.com',
            password: process.env.ADMIN_PW,
            agency: 'New York Cares',
            contact: 'Elmer Meza',

        }, {
            provider: 'local',
            username: 'WWT',
            email: 'meza.elmer@test.com',
            password: 'demo2015',
            children: 5,
            teens: 0,
            seniors: 0,
            contact: 'Elmer Meza',
            agency: 'Winter Wishes Team'

        });
    }
});