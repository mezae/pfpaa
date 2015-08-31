'use strict';
/* global _: false */

angular.module('letters')

.controller('SummaryController', ['$scope', '$location', 'Authentication', 'Agencies', 'Articles',
    function($scope, $location, Authentication, Agencies, Articles) {
        $scope.authentication = Authentication;

        if (!$scope.authentication.user || $scope.authentication.user.role === 'user') $location.path('/').replace();

        Articles.query(function(candidates) {

            Agencies.query(function(users) {

                var ballots = _.pluck(users, 'ballot');
                var votes = _.flatten(ballots);
                var count = _.countBy(votes);

                $scope.tally = [];
                _.forEach(count, function(count, id) {
                    if (id) {
                        $scope.tally.push({
                            candidateID: _.result(_.find(candidates, function(candidate) {
                                            return candidate._id === id;
                                        }), 'prep_name'),
                            count: count
                        });
                    }
                });

            });
        });

    }
]);