'use strict';
/* global _: false */
/* global Notification: false */

angular.module('letters').controller('myController', ['$scope', '$window', '$location', '$filter', '$http', 'Authentication', 'Users', 'Agencies', 'Articles',
    function($scope, $window, $location, $filter, $http, Authentication, Users, Agencies, Articles) {
        $scope.user = Authentication.user;
        if (!$scope.user || $scope.user.role === 'user') $location.path('/').replace();

        $scope.users = Agencies.query();

        $scope.viewData = function(tab) {
            $scope.setting = tab;

            $scope.calendar = {
                startDate: null,
                endDate: null,
                opened: {},
                dateFormat: 'MM/dd/yyyy',
                dateOptions: {
                    showWeeks: false
                },
                open: function($event, calID) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.calendar.opened[calID] = true;
                }
            };
        };

        $scope.saveDueDate = function() {
            var user = new Users($scope.user);
            user.$update(function(response) {
                $scope.user = response;
            }, function(response) {
                console.log(response.data.message);
            });
        };

        $scope.viewAdmins = function() {
            $scope.setting = 'admins';
            $scope.credentials = {};
        };

        //Allows admin to create new accounts
        function signup(credentials) {
            $http.post('/auth/newadmin', credentials).success(function(response) {
                console.log('new admin added');
                $scope.newAdmin = false;
            }).error(function(response) {
                $scope.alert = {
                    active: true,
                    type: 'danger',
                    msg: response.message
                };
            });
        }

        $scope.saveAdmin = function() {
            console.log($scope.credentials);
            signup($scope.credentials);
        };

        $scope.resetAll = function() {
            var confirmation = $window.prompt('Please type FOREVER to wipe all data.');
            if (confirmation === 'FOREVER') {
                $http.get('/users/reset').success(function(response) {
                    // If successful we assign the response to the global user model
                    Authentication.user = response;
                }).error(function(response) {
                    $scope.error = response.message;
                });
            }
        };

        $scope.resetCandidates = function() {
            var confirmation = $window.prompt('Please type FOREVER to wipe all candidate data.');
            if (confirmation === 'FOREVER') {
                $http.get('/articles/reset').success(function(response) {
                    console.log('success');
                }).error(function(response) {
                    $scope.error = response.message;
                });
            }
        };
    }
]);