'use strict';
/* global _: false */

angular.module('letters').controller('CommandController', ['$scope', '$q', '$window', '$timeout', '$interval', '$http', '$stateParams', '$location', '$modal', 'Authentication', 'Articles', 'socket',
    function($scope, $q, $window, $timeout, $interval, $http, $stateParams, $location, $modal, Authentication, Articles, socket) {
        $scope.user = Authentication.user;

        if (!$scope.user) $location.path('/').replace();

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
                socket.syncUpdates('users', $scope.partners);
            });
        };


        //Allows admin to create new accounts
        function signup(credentials) {
            $http.post('/articles', credentials).success(function(response) {
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
                size: 'md',
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

        function proccessFile(headers, rows) {
            var required_fields = ['Name', 'Contingent', 'Bio', 'Statement', 'Picture URL'];
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
                    name_col: headers.indexOf(csvheaders[0].label),
                    cono_col: headers.indexOf(csvheaders[1].label),
                    bio_col: headers.indexOf(csvheaders[2].label),
                    state_col: headers.indexOf(csvheaders[3].label),
                    pic_col: headers.indexOf(csvheaders[4].label)
                };

                $scope.alert = {
                    active: true,
                    type: 'info',
                    msg: 'Great! Your tracking forms will appear shortly...'
                };
                $scope.oldUsers = $scope.partners.length;
                $scope.newUsers = rows.length;
                var record = null;

                for (var i = 0; i < rows.length; i++) {
                    record = rows[i].split(',');

                    console.log((record[headers.pic_col].length) ? record[headers.pic_col] : 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/240px-No_image_available.svg.png');

                    signup({
                        name: record[headers.name_col],
                        contingent: record[headers.cono_col],
                        bio: record[headers.bio_col],
                        statement: record[headers.state_col],
                        picture: (record[headers.pic_col].length) ? record[headers.pic_col] : 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/240px-No_image_available.svg.png'
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
                var reader = new FileReader();
                reader.onload = function(file) {
                    var content = file.target.result;
                    var rows = content.split(/[\r\n|\n]+/);
                    var headers = rows.shift();
                    headers = headers.split(',');
                    proccessFile(headers, rows);
                };
                reader.readAsText(file);
                files[0] = undefined;
            }
        };

        //Allows user to add/update a partner
        $scope.saveAgency = function() {
            $scope.alert.active = false;
            if ($scope.isNewAgency) {
                if (_.find($scope.partners, {
                    'username': $scope.partner.username
                })) {
                    $scope.alert = {
                        active: true,
                        type: 'danger',
                        msg: $scope.partner.username + ' already exists. Please edit the existing copy to avoid duplicates.'
                    };
                } else {
                    signup($scope.partner);
                }
            } else {
                Agencies.update($scope.partner);
            }
            $scope.hideSidebar();
        };


        //Allow user to delete selected partner and all associated recipients
        $scope.deleteAgency = function(selected) {
            var confirmation = $window.prompt('Please type DELETE to remove ' + selected.agency + '.');
            if (confirmation === 'DELETE') {
                $http.delete('/agency/' + selected.username);
            }
        };

        //Show current state of partner that user wants to edit
        $scope.showSidebar = function(selected) {
            $scope.isNewAgency = selected ? false : true;
            $scope.partner = selected;
            $scope.needToUpdate = true;
            $scope.startSearch = false;
        };

        $scope.hideSidebar = function() {
            $scope.partner = null;
            $scope.needToUpdate = false;
            if ($scope.query.username || $scope.query.status) $scope.startSearch = true;
        };

        $scope.$on('$destroy', function() {
            socket.unsyncUpdates('users');
        });

    }
]);