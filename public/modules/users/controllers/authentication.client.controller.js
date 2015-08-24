'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$state', 'Authentication',
    function($scope, $http, $state, Authentication) {
        $scope.user = Authentication.user;

        // If user is signed in, then redirect to appropriate page
        if ($scope.user) $state.go('command');

        $scope.signin = function(form) {
            $http.post('/auth/signin', $scope.credentials).success(function(response) {
                // If successful we assign the response to the global user model
                Authentication.user = response;
                $scope.user = Authentication.user;
                // And redirect to appropriate page
                $scope.user.status === 0 ? $state.go('command') : $state.go('thanks');
            }).error(function(response) {
                $scope.error = response.message;
            });
        };

    }
]);