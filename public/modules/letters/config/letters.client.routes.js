'use strict';

// Setting up route
angular.module('letters').config(['$stateProvider',
    function($stateProvider) {
        // Letters state routing
        $stateProvider.
        state('command', {
            url: '/ballot',
            templateUrl: 'modules/letters/views/command.html'
        }).
        state('voters', {
            url: '/voters',
            templateUrl: 'modules/letters/views/labels.html'
        }).
        state('adminSettings', {
            url: '/admin/settings',
            templateUrl: 'modules/letters/views/settings.html'
        }).
        state('manageAdmins', {
            url: '/admin/settings/manage',
            templateUrl: 'modules/letters/views/settings.manage-admins.html'
        }).
        state('email', {
            url: '/admin/email',
            templateUrl: 'modules/emails/views/emails.html'
        }).
        state('etemplate', {
            url: '/admin/email/:template',
            templateUrl: 'modules/emails/views/etemplate.html'
        }).
        state('email-success', {
            url: '/admin/emails/success',
            templateUrl: 'modules/emails/views/esent.html'
        }).
        state('thanks', {
            url: '/thanks',
            templateUrl: 'modules/letters/views/thanks.html'
        }).
        state('stats', {
            url: '/admin/stats',
            templateUrl: 'modules/letters/views/stats.html'
        });
    }
]);