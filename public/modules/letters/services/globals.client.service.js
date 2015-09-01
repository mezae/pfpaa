'use strict';

//Letters service used for communicating with the letters REST endpoints
angular.module('letters').factory('Globals', ['$resource',
    function($resource) {
        return $resource('globals/:globalId/:controller', {
            globalId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);