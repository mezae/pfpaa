'use strict';

angular.module('letters').controller('CandidateModalCtrl', ['$http', '$window', '$state', '$scope', '$filter', '$modalInstance', 'Authentication', 'Agencies', 'candidates',
    function($http, $window, $state, $scope, $filter, $modalInstance, Authentication, Agencies, candidates) {
        $scope.user = Authentication.user;

        $scope.index = candidates.selected;
        $scope.max = candidates.all.length - 1;
        $scope.candidate = candidates.all[$scope.index];

        $scope.viewCandidate = function(direction) {
            $scope.candidate = candidates.all[$scope.index += direction];
        };

        //Allow user to delete selected partner and all associated recipients
        $scope.deleteAgency = function(selected) {
            var confirmation = $window.prompt('Please type DELETE to remove ' + selected.name + '.');
            if (confirmation === 'DELETE') {
                $http.delete('/articles/' + selected._id).success(function(response) {
                    candidates.all.splice($scope.index, 1);
                    var direction = $scope.index === 0 ? 0 : -1;
                    if (candidates.all.length > 0) {
                        $scope.viewCandidate(direction);
                        $scope.max = candidates.all.length - 1;
                    }
                    else {
                        $scope.exitModal();
                    }
                }).error(function(response) {
                    console.log(response);
                });
            }
        };

        $scope.updateBallot = function(action, selected) {
            if (action === 'add' && $scope.user.ballot.length < 6) {
                $scope.user.ballot.push(selected._id);
            }
            else {
                var ballot_index = $scope.user.ballot.indexOf(selected._id);
                $scope.user.ballot.splice(ballot_index, 1);
            }
            $http.put('/agency/' + $scope.user.username, $scope.user).success(function(response) {
                $scope.user = response;
            }).error(function(response) {
                console.log(response);
            });
        };

        $scope.exitModal = function() {
            $modalInstance.close();
        };
    }
]);