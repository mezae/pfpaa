'use strict';
/* global _: false */

angular.module('letters')

.controller('SummaryController', ['$scope', '$location', 'Authentication', 'Agencies', 'Articles',
    function($scope, $location, Authentication, Agencies, Articles) {
        $scope.authentication = Authentication;

        if (!$scope.authentication.user || $scope.authentication.user.role === 'user') $location.path('/').replace();

        // Articles.query(function(candidates) {

        //     Agencies.query(function(users) {

        //         var submitted = _.filter(users, {'status': 1});
        //         var ballots = _.pluck(submitted, 'ballot');
        //         var votes = _.flatten(ballots);
        //         var count = _.countBy(votes);

        //         $scope.stats = {
        //             total_ballots: submitted.length,
        //             votes_per_ballot: (votes.length / submitted.length).toFixed(1),
        //             participation: ((submitted.length / (users.length - 1)) * 100).toFixed(1)
        //         };

        //         $scope.tally = [];
        //         _.forEach(count, function(count, id) {
        //             if (id) {
        //                 $scope.tally.push({
        //                     candidateID: _.result(_.find(candidates, function(candidate) {
        //                                     return candidate._id === id;
        //                                 }), 'prep_name'),
        //                     count: count
        //                 });
        //             }
        //         });

        //     });
        // });

    }
]);