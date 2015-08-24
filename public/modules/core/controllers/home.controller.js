'use strict';

angular.module('core').controller('HomeController', ['$scope', '$location', 'Authentication',
    function($scope, $location, Authentication) {
        $scope.user = Authentication.user;

        // If user is signed in then redirect back home
        if ($scope.user) {
        	$scope.user.status === 0 ? $location.path('/ballot') : $location.path('/thanks');
        }
    }
]);