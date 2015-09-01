'use strict';
/* global _: false */
/* global Notification: false */

angular.module('letters').controller('myController', ['$scope', '$window', '$location', '$filter', '$http', 'Authentication', 'Users', 'Agencies', 'Articles', 'Globals',
    function($scope, $window, $location, $filter, $http, Authentication, Users, Agencies, Articles, Globals) {
        $scope.user = Authentication.user;
        if (!$scope.user || $scope.user.role === 'user') $location.path('/').replace();

        $scope.users = Agencies.query();

        $scope.viewData = function(tab) {
            if (tab === 'duedate') {
                Globals.query(function(settings) {
                    $scope.isActive = false;
                    $scope.new_global = {
                        setting_name: 'due_date',
                        setting_value: null
                    };
                    var old_global = _.find(settings, function(global) {
                                        return global.setting_name === 'due_date';
                                    });
                    if (old_global) {
                        $scope.isActive = true;
                        $scope.new_global = old_global;
                    }
                });
            }


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
            if(!$scope.isActive) {
                $http.post('/globals', $scope.new_global).success(function(response) {
                    console.log(response.message);
                }).error(function(response) {
                    $scope.alert = {
                        active: true,
                        type: 'danger',
                        msg: response.message
                    };
                });
            } else {
                var global = new Globals($scope.new_global);

                global.$update(function(response) {
                    console.log(response.message);
                }, function(response) {
                    $scope.error = response.data.message;
                });
            }
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