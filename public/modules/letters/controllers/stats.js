'use strict';
/* global _: false */

angular.module('letters')

.controller('SummaryController', ['$scope', '$window', '$location', '$filter', 'Authentication', 'Agencies', 'Articles',
    function($scope, $window, $location, $filter, Authentication, Agencies, Articles) {
        $scope.authentication = Authentication;

        if (!$scope.authentication.user) $location.path('/');

        Articles.query(function(candidates) {

            Agencies.query(function(users) {

                var ballots = _.pluck(users, 'ballot');
                var votes = _.flatten(ballots);
                var count = _.countBy(votes);

                $scope.tally = [];
                _.forEach(count, function(c, g) {
                    if (g) {
                        $scope.tally.push({
                            candidateID: _.result(_.find(candidates, function(chr) {
                                            return chr._id === g;
                                        }), 'prep_name'),
                            count: c
                        });
                    }
                });

            });
        });

    }
]);