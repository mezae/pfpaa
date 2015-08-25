'use strict';

angular.module('letters').controller('CandidateModalCtrl', ['$http', '$window', '$anchorScroll', '$location', '$state', '$scope', '$filter', '$modalInstance', 'Authentication', 'Users', 'Articles', 'candidates',
    function($http, $window, $anchorScroll, $location, $state, $scope, $filter, $modalInstance, Authentication, Users, Articles, candidates) {
        $scope.user = Authentication.user;

        $scope.index = candidates.selected;
        $scope.max = candidates.all.length - 1;
        $scope.candidate = candidates.all[$scope.index];

        $scope.viewCandidate = function(direction) {
            $scope.candidate = candidates.all[$scope.index += direction];
            $scope.gotoTop();
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
            else if (action === 'remove' && $scope.user.ballot.length <= 6) {
                var ballot_index = $scope.user.ballot.indexOf(selected._id);
                $scope.user.ballot.splice(ballot_index, 1);
            }
            var user = new Users($scope.user);

            user.$update(function(response) {
                $scope.success = true;
                Authentication.user = response;
                $scope.user = Authentication.user;
            }, function(response) {
                $scope.error = response.data.message;
            });
        };

        $scope.updateCandidate = function(selected) {
            var candidate = new Articles(selected);

            candidate.$update(function(response) {
                candidates.all[$scope.index] = response;
                $scope.editCandidate = false;
            }, function(response) {
                $scope.error = response.data.message;
            });
        };

        $scope.gotoTop = function() {
          // set the location.hash to the id of
          // the element you wish to scroll to.
          $location.hash('top');
          $anchorScroll();
        };

        $scope.exitModal = function() {
            $modalInstance.close();
        };
    }
]);