'use strict';
/* global _: false */

angular.module('letters').controller('CommandController', ['$scope', '$q', '$window', '$timeout', '$interval', '$http', '$stateParams', '$location', '$modal', 'Authentication', 'Articles',
    function($scope, $q, $window, $timeout, $interval, $http, $stateParams, $location, $modal, Authentication, Articles) {
        $scope.user = Authentication.user;

        if (!$scope.user) $location.path('/').replace();
        $scope.adminView = $scope.user.role !== 'user';
        $scope.userView = $scope.user.role === 'user';

        $scope.needToUpdate = false; //helps hide sidebar when it's not needed
        $scope.alert = {
            active: false,
            type: '',
            msg: ''
        };

        $scope.find = function() {
            $scope.partners = [{
                username: 'Loading...',
                role: 'user'
            }];
            
            Articles.query(function(users) {
                $scope.partners = users;
            });
        };


        //Allows admin to create new accounts
        function signup(credentials) {
            $http.post('/articles', credentials).success(function(response) {
                $scope.partners.push(response);
                console.log(response.message);
            }).error(function(response) {
                $scope.alert = {
                    active: true,
                    type: 'danger',
                    msg: response.message
                };
            });
        }

        //Allows admin to create multiple new accounts
        function signups(file) {
            $http.post('/auth/signups', file).success(function(response) {
                if (response !== 'OK') {
                    $scope.user = response;
                    $scope.fileDone = true;
                }
                $scope.alert.active = false;
            }).error(function(response) {
                $scope.alert = {
                    active: true,
                    type: 'danger',
                    msg: response.message
                };
            });
        }

        function processBatch(rows, headers) {
            var rowCount = rows.length;
            if (rowCount > 0) {
                var batchQuantity = rowCount > 50 ? 50 : rowCount;
                var batch = rows.splice(0, batchQuantity);

                signups({
                    headers: headers,
                    file: batch,
                    isLast: rows.length === 0
                });
            }
            return rows;
        }

        $scope.showCandidate = function(selected) {
            var modal = $modal.open({
                templateUrl: 'modules/letters/views/candidate.modal.html',
                controller: 'CandidateModalCtrl',
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    candidates: function() {
                        return {
                            all: $scope.partners,
                            selected: selected
                        };
                    }
                }
            });
        }

        function proccessFile(data) {
            var headers = data.shift();
            var rows = data;
            var required_fields = ['Timestamp', 'First Name', 'Last Name', 'Prep Formatted Name', 'Bio', 'Statement', 'Photo URL'];
            var modal = $modal.open({
                templateUrl: 'modules/letters/views/fileuploadmodal.html',
                controller: 'MappingModalCtrl',
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    arrays: function() {
                        return {
                            type: 'Candidate',
                            required_fields: required_fields,
                            headers: headers
                        };
                    }
                }
            });

            modal.result.then(function(csvheaders) {

                headers = {
                    sdate_col: headers.indexOf(csvheaders[0].label),
                    fname_col: headers.indexOf(csvheaders[1].label),
                    lname_col: headers.indexOf(csvheaders[2].label),
                    pname_col: headers.indexOf(csvheaders[3].label),
                    bio_col: headers.indexOf(csvheaders[4].label),
                    state_col: headers.indexOf(csvheaders[5].label),
                    pic_col: headers.indexOf(csvheaders[6].label)
                };

                $scope.alert = {
                    active: true,
                    type: 'info',
                    msg: 'Great! Your tracking forms will appear shortly...'
                };

                var record = null;

                for (var i = 0; i < rows.length; i++) {
                    record = rows[i];
                    signup({
                        submitted: record[headers.sdate_col],
                        first_name: record[headers.fname_col],
                        last_name: record[headers.lname_col],
                        prep_name: record[headers.pname_col],
                        bio: record[headers.bio_col],
                        statement: record[headers.state_col],
                        photo: (record[headers.pic_col].length) ? record[headers.pic_col] : 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/240px-No_image_available.svg.png'
                    });
                }
            });
        }

        //Allow user to upload file to add accounts in bulk
        //Makes sure CSV file includes required fields, otherwise lets user which fields are missing
        $scope.handleFileSelect = function(files) {
            if (files.length === 0) {
                $scope.alert = {
                    active: true,
                    type: 'danger',
                    msg: 'Must be a csv file!'
                };
            } else {
                var file = files[0];
                Papa.parse(file, {
                    complete: function(results) {
                        proccessFile(results.data);
                        files[0] = undefined;
                    }
                });
            }
        };

        $scope.reviewBallot = function() {
            var modal = $modal.open({
                templateUrl: 'modules/letters/views/myBallot.modal.html',
                controller: 'BallotModalCtrl',
                backdrop: 'static',
                resolve: {
                    candidates: function() {
                        return $scope.partners;
                    }
                }
            });
        };
    }
]);