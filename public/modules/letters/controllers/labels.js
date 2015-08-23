'use strict';
/* global _: false */
/* global LZString: false */

angular.module('letters').controller('LabelController', ['$scope', '$window', '$interval', '$http', '$location', '$modal', '$filter', 'Authentication',
    function($scope, $window, $interval, $http, $location, $modal, $filter, Authentication) {
        $scope.user = Authentication.user;

        if (!$scope.user || $scope.user.role === 'user') $location.path('/').replace();

        $scope.fileURLs = [];
        $scope.hideDropzone = false;
        $scope.alert = {
            active: false,
            type: '',
            msg: ''
        };

        //Allows admin to create new accounts
        function signup(credentials) {
            $http.post('/auth/signup', credentials).success(function(response) {
                console.log(response.message);
            }).error(function(response) {
                $scope.alert = {
                    active: true,
                    type: 'danger',
                    msg: response.message
                };
            });
        }

        function makeid(){
            var text = '';
            var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

            for( var i=0; i < 12; i++ )
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            return text;
        }

        //Helps create a downloadable csv version of the tracking form
        function downloadCSV(vids) {
            var headers = ['VoterID'];
            var csvString = headers.join(',') + '\r\n';
            _.forEach(vids, function(vid) {
                signup({username: vid});
                csvString += vid + '\r\n';
            });

            var date = $filter('date')(new Date(), 'MM-dd');
            $scope.fileName = ('VoterIDs_' + date + '.csv');
            var blob = new Blob([csvString], {
                type: 'text/csv;charset=UTF-8'
            });
            var fileURL = $window.URL.createObjectURL(blob);
            $window.location.href = fileURL;
        }

        $scope.generateVoterIDs = function() {
            var vids = [];
            for(var i = 0; i < $scope.voters; i++) {
                var newID = makeid();
                if (vids.indexOf(newID) < 0) {
                    vids.push(newID);
                }
            }
            downloadCSV(vids);
        };

    }
]);