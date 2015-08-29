'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', '$location', '$modal', 'Authentication',
    function($scope, $state, $location, $modal, Authentication) {
        $scope.authentication = Authentication;

        $scope.isAdmin = function() {
            return $scope.authentication.user.role === 'admin';
        };

        $scope.isActive = function(route) {
            return route.indexOf($location.path()) > -1;
        };

        $scope.menuOpened = false;

        $scope.toggleMenu = function(event) {
            $scope.menuOpened = !($scope.menuOpened);

            // Important part in the implementation
            // Stopping event propagation means window.onclick won't get called when someone clicks
            // on the menu div. Without this, menu will be hidden immediately
            event.stopPropagation();
        };

        window.onclick = function() {
            if ($scope.menuOpened) {
                $scope.menuOpened = false;

                // You should let angular know about the update that you have made, so that it can refresh the UI
                $scope.$apply();
            }
        };

        // $scope.$on('$stateChangeSuccess', function() {
        //     if ($scope.authentication.user.status === 0) $scope.showTutorial();
        // });

        $scope.needTutorial = function() {
            var needTutorial = ['command', 'tracking', 'agTracking', 'email', 'etemplate'];
            var page = $state.current.name;
            return needTutorial.indexOf(page) >= 0;
        };

        $scope.showTutorial = function() {
            var page = $state.current.name;
            if (page === 'command') {
                $modal.open({
                    templateUrl: 'modules/core/views/adminTutorial.html',
                    controller: 'ModalInstanceCtrl',
                    backdrop: 'static'
                });
            }
        };

    }
])

.controller('ModalInstanceCtrl', ['$state', '$scope', '$filter', '$modalInstance', 'Authentication', 'Agencies',
    function($state, $scope, $filter, $modalInstance, Authentication, Agencies) {
        $scope.user = Authentication.user;
        if ($state.current.name === 'agTracking') {
            Agencies.get({
                agencyId: $scope.user.username
            }, function(tf) {
                $scope.dueDate = $filter('date')(tf.due, 'fullDate');
            });
        }

        $scope.ok = function() {
            $modalInstance.close();
        };
    }
]);