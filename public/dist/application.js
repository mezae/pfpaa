'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
    // Init module configuration options
    var applicationModuleName = 'meanww';
    var applicationModuleVendorDependencies = ['ngResource', 'ngCookies', 'ngAnimate', 'ngTouch', 'ui.router', 'ui.bootstrap', 'ui.utils', 'textAngular', 'ngFileUpload', 'dndLists', 'vcRecaptcha'];

    // Add a new vertical module
    var registerModule = function(moduleName, dependencies) {
        // Create angular module
        angular.module(moduleName, dependencies || []);

        // Add the module to the AngularJS configuration file
        angular.module(applicationModuleName).requires.push(moduleName);
    };

    return {
        applicationModuleName: applicationModuleName,
        applicationModuleVendorDependencies: applicationModuleVendorDependencies,
        registerModule: registerModule
    };
})();
'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('letters');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');
'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise('/');

        // Home state routing
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'modules/core/views/home.html'
            })
            .state('login', {
                url: '/login',
                templateUrl: 'modules/users/views/authentication/signin.client.view.html'
            });
    }
]);
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

'use strict';

// Allows user to download csv file
angular.module('letters').config(['$compileProvider', function($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|blob|chrome-extension):/);
}]);
'use strict';

// Setting up route
angular.module('letters').config(['$stateProvider',
    function($stateProvider) {
        // Letters state routing
        $stateProvider.
        state('command', {
            url: '/ballot',
            templateUrl: 'modules/letters/views/command.html'
        }).
        state('voters', {
            url: '/voters',
            templateUrl: 'modules/letters/views/labels.html'
        }).
        state('adminSettings', {
            url: '/admin/settings',
            templateUrl: 'modules/letters/views/settings.html'
        }).
        state('manageAdmins', {
            url: '/admin/settings/manage',
            templateUrl: 'modules/letters/views/settings.manage-admins.html'
        }).
        state('email', {
            url: '/admin/email',
            templateUrl: 'modules/emails/views/emails.html'
        }).
        state('etemplate', {
            url: '/admin/email/:template',
            templateUrl: 'modules/emails/views/etemplate.html'
        }).
        state('email-success', {
            url: '/admin/emails/success',
            templateUrl: 'modules/emails/views/esent.html'
        }).
        state('thanks', {
            url: '/thanks',
            templateUrl: 'modules/letters/views/thanks.html'
        }).
        state('stats', {
            url: '/admin/stats',
            templateUrl: 'modules/letters/views/stats.html'
        });
    }
]);
'use strict';

angular.module('letters').controller('CandidateModalCtrl', ['$sce', '$http', '$window', '$anchorScroll', '$location', '$state', '$scope', '$filter', '$modalInstance', 'Authentication', 'Users', 'Articles', 'candidates',
    function($sce, $http, $window, $anchorScroll, $location, $state, $scope, $filter, $modalInstance, Authentication, Users, Articles, candidates) {
        $scope.user = Authentication.user;

        $scope.index = candidates.selected;
        $scope.max = candidates.all.length - 1;
        $scope.candidate = candidates.all[$scope.index];

        $scope.viewCandidate = function(direction) {
            if($scope.success) $scope.success = false;
            $scope.candidate = candidates.all[$scope.index += direction];
            $scope.gotoTop();
        };

        //Allow user to delete selected partner and all associated recipients
        $scope.deleteAgency = function(selected) {
            var confirmation = $window.prompt('Please type DELETE to remove ' + selected.first_name + ' ' + selected.last_name + '.');
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
            if (action === 'add') {
                $scope.user.ballot.push(selected._id);
            }
            else if (action === 'remove') {
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
'use strict';
/* global _: false */

angular.module('letters').controller('CommandController', ['$scope', '$q', '$window', '$timeout', '$interval', '$http', '$stateParams', '$location', '$modal', 'Authentication', 'Articles', 'Globals',
    function($scope, $q, $window, $timeout, $interval, $http, $stateParams, $location, $modal, Authentication, Articles, Globals) {
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
            Globals.query(function(settings) {
                var today = new Date();
                var due_date = _.result(_.find(settings, function(global) {
                                    return global.setting_name === 'due_date';
                                }), 'setting_value');
                due_date = new Date(due_date);
                if (today < due_date || $scope.user.role === 'admin') {
                    Articles.query(function(users) {
                        $scope.partners = users;
                    });
                }
                else {
                    $location.path('/thanks').replace();
                }
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
'use strict';

angular.module('letters').controller('MappingModalCtrl', ['$state', '$scope', '$filter', '$modalInstance', 'Authentication', 'arrays',
    function($state, $scope, $filter, $modalInstance, Authentication, arrays) {
        $scope.user = Authentication.user;
        $scope.required_fields = arrays.required_fields;
        $scope.model = {
            lists: {
                A: [],
                B: []
            }
        };

        for (var i = 0; i < arrays.headers.length; ++i) {
            var field = $scope.required_fields[i];
            var isValidColumn = arrays.headers.indexOf(field);
            if (isValidColumn > -1) {
                $scope.model.lists.B.push({label: arrays.headers[isValidColumn]});
            } else {
                $scope.model.lists.A.push({label: arrays.headers[i]});
            }
        }

        $scope.exitModal = function() {
            if ($scope.model.lists.B.length === $scope.required_fields.length) {
                $modalInstance.close($scope.model.lists.B);
            } else {
                $modalInstance.close();
            }
        };
    }
]);
'use strict';
/* global _: false */
/* global LZString: false */

angular.module('letters').controller('LabelController', ['$scope', '$window', '$interval', '$http', '$location', '$modal', '$filter', 'Authentication',
    function($scope, $window, $interval, $http, $location, $modal, $filter, Authentication) {
        $scope.user = Authentication.user;

        if (!$scope.user || $scope.user.role === 'user') $location.path('/').replace();

        $scope.fileURLs = [];
        $scope.hideDropzone = false;
        $scope.alert = {
            active: false,
            type: '',
            msg: ''
        };

        //Allows admin to create new accounts
        function signup(credentials) {
            $http.post('/auth/signup', credentials).success(function(response) {
                console.log(response.message);
            }).error(function(response) {
                $scope.alert = {
                    active: true,
                    type: 'danger',
                    msg: response.message
                };
            });
        }

        function makeid(){
            var text = '';
            var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

            for( var i=0; i < 12; i++ )
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            return text;
        }

        //Helps create a downloadable csv version of the tracking form
        function downloadCSV(vids) {
            var headers = ['VoterID'];
            var csvString = headers.join(',') + '\r\n';
            _.forEach(vids, function(vid) {
                signup({username: vid});
                csvString += vid + '\r\n';
            });

            var date = $filter('date')(new Date(), 'MM-dd');
            $scope.fileName = ('VoterIDs_' + date + '.csv');
            var blob = new Blob([csvString], {
                type: 'text/csv;charset=UTF-8'
            });
            var fileURL = $window.URL.createObjectURL(blob);
            $window.location.href = fileURL;
        }

        $scope.generateVoterIDs = function() {
            var vids = [];
            for(var i = 0; i < $scope.voters; i++) {
                var newID = makeid();
                if (vids.indexOf(newID) < 0) {
                    vids.push(newID);
                }
            }
            downloadCSV(vids);
        };

    }
]);
'use strict';

angular.module('letters').controller('BallotModalCtrl', ['$http', '$window', '$anchorScroll', '$location', '$state', '$scope', '$filter', '$modalInstance', 'Authentication', 'Users', 'candidates',
    function($http, $window, $anchorScroll, $location, $state, $scope, $filter, $modalInstance, Authentication, Users, candidates) {
        $scope.user = Authentication.user;
        $scope.candidates = candidates;

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

        $scope.updateBallot = function(selected) {
            var ballot_index = $scope.user.ballot.indexOf(selected._id);
            $scope.user.ballot.splice(ballot_index, 1);
            var user = new Users($scope.user);

            user.$update(function(response) {
                $scope.success = true;
                Authentication.user = response;
                $scope.user = Authentication.user;
            }, function(response) {
                $scope.error = response.data.message;
            });
        };

        $scope.submitBallot = function() {
            if ($scope.user.ballot.length <= 6) {
                $scope.user.status = 1;
                var user = new Users($scope.user);

                user.$update(function(response) {
                    $scope.success = true;
                    Authentication.user = response;
                    $scope.user = Authentication.user;
                    $modalInstance.close();
                    $location.path('/thanks');
                }, function(response) {
                    $scope.error = response.data.message;
                });
            }
        };

        $scope.gotoTop = function() {
            $location.hash('top');
            $anchorScroll();
        };

        $scope.exitModal = function() {
            $modalInstance.close();
        };
    }
]);
'use strict';
/* global _: false */
/* global Notification: false */

angular.module('letters').controller('myController', ['$scope', '$window', '$location', '$filter', '$http', 'Authentication', 'Users', 'Agencies', 'Articles', 'Globals',
    function($scope, $window, $location, $filter, $http, Authentication, Users, Agencies, Articles, Globals) {
        $scope.user = Authentication.user;
        if (!$scope.user || $scope.user.role === 'user') $location.path('/').replace();

        $scope.users = Agencies.query();

        $scope.viewData = function(tab) {
            if (tab === 'duedate') {
                Globals.query(function(settings) {
                    $scope.isActive = false;
                    $scope.new_global = {
                        setting_name: 'due_date',
                        setting_value: null
                    };
                    var old_global = _.find(settings, function(global) {
                                        return global.setting_name === 'due_date';
                                    });
                    if (old_global) {
                        $scope.isActive = true;
                        $scope.new_global = old_global;
                    }
                });
            }


            $scope.setting = tab;

            $scope.calendar = {
                startDate: null,
                endDate: null,
                opened: {},
                dateFormat: 'MM/dd/yyyy',
                dateOptions: {
                    showWeeks: false
                },
                open: function($event, calID) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.calendar.opened[calID] = true;
                }
            };
        };

        $scope.saveDueDate = function() {
            if(!$scope.isActive) {
                $http.post('/globals', $scope.new_global).success(function(response) {
                    console.log(response.message);
                }).error(function(response) {
                    $scope.alert = {
                        active: true,
                        type: 'danger',
                        msg: response.message
                    };
                });
            } else {
                var global = new Globals($scope.new_global);

                global.$update(function(response) {
                    console.log(response.message);
                }, function(response) {
                    $scope.error = response.data.message;
                });
            }
        };

        $scope.viewAdmins = function() {
            $scope.setting = 'admins';
            $scope.credentials = {};
        };

        //Allows admin to create new accounts
        function signup(credentials) {
            $http.post('/auth/newadmin', credentials).success(function(response) {
                console.log('new admin added');
                $scope.newAdmin = false;
            }).error(function(response) {
                $scope.alert = {
                    active: true,
                    type: 'danger',
                    msg: response.message
                };
            });
        }

        $scope.saveAdmin = function() {
            console.log($scope.credentials);
            signup($scope.credentials);
        };

        $scope.resetAll = function() {
            var confirmation = $window.prompt('Please type FOREVER to wipe all data.');
            if (confirmation === 'FOREVER') {
                $http.get('/users/reset').success(function(response) {
                    // If successful we assign the response to the global user model
                    Authentication.user = response;
                }).error(function(response) {
                    $scope.error = response.message;
                });
            }
        };

        $scope.resetCandidates = function() {
            var confirmation = $window.prompt('Please type FOREVER to wipe all candidate data.');
            if (confirmation === 'FOREVER') {
                $http.get('/articles/reset').success(function(response) {
                    console.log('success');
                }).error(function(response) {
                    $scope.error = response.message;
                });
            }
        };
    }
]);
'use strict';
/* global _: false */
/* global Notification: false */

angular.module('letters').controller('ManageAdminsController', ['$scope', '$window', '$location', '$http', 'Authentication', 'Users', 'Agencies',
    function($scope, $window, $location, $http, Authentication, Users, Agencies) {
        $scope.user = Authentication.user;
        if (!$scope.user || $scope.user.role === 'user') $location.path('/').replace();

        $scope.find = function() {
            $scope.credentials = {};
            $scope.alert = {
                active: false,
                type: '',
                msg: ''
            };
            $http.get('/agency/admin').success(function(response) {
                $scope.users = response;
            }).error(function(response) {
                $scope.alert = {
                    active: true,
                    type: 'danger',
                    msg: response.message
                };
            });    
        };

        //Allows admin to create new accounts
        $scope.addAdmin = function() {
            $http.post('/auth/newadmin', $scope.credentials).success(function(response) {
                $scope.users.push(response);
                if ($scope.alert.active) $scope.alert.active = false;
                $scope.credentials = null;
            }).error(function(response) {
                $scope.alert = {
                    active: true,
                    type: 'danger',
                    msg: response.message
                };
            });
        };

        //Allow admin to delete other accounts as long as there is at least one left
        $scope.removeAdmin = function(selected) {
            if ($scope.users.length > 1) {
                var confirmation = $window.prompt('Type DELETE to remove ' + selected.username + '\'s account');
                if (confirmation === 'DELETE') {
                    var oldAdmin = selected;
                    $http.delete('/agency/' + selected._id).success(function(response) {
                        $scope.users.splice(_.findIndex($scope.users, oldAdmin), 1);
                    }).error(function(response) {
                        console.log(response);
                    });
                }
            }
        };
    }
    ]);
'use strict';
/* global _: false */

angular.module('letters')

.controller('SummaryController', ['$scope', '$location', 'Authentication', 'Agencies', 'Articles',
    function($scope, $location, Authentication, Agencies, Articles) {
        $scope.authentication = Authentication;

        if (!$scope.authentication.user || $scope.authentication.user.role === 'user') $location.path('/').replace();

        Articles.query(function(candidates) {

            Agencies.query(function(users) {
                console.log(users);

                var submitted = _.filter(users, {'status': 1});
                
                var ballots = _.pluck(submitted, 'ballot');
                var votes = _.flatten(ballots);
                var count = _.countBy(votes);

                $scope.stats = {
                    total_ballots: submitted.length,
                    votes_per_ballot: (votes.length / submitted.length).toFixed(1),
                    participation: (submitted.length / users.length).toFixed(1)
                };

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
'use strict';

//Letters service used for communicating with the agencies REST endpoints
angular.module('letters').factory('Agencies', ['$resource',
    function($resource) {
        return $resource('agency/:agencyId', {
            agencyId: '@username'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);


// angular.module('2meanApp')
//     .factory('User', function($resource) {
//         return $resource('/api/users/:id/:controller', {
//             id: '@_id'
//         }, {
//             changePassword: {
//                 method: 'PUT',
//                 params: {
//                     controller: 'password'
//                 }
//             },
//             updateProfile: {
//                 method: 'PUT',
//                 params: {
//                     controller: 'profile'
//                 }
//             },
//             get: {
//                 method: 'GET',
//                 params: {
//                     id: 'me'
//                 }
//             }
//         });
//     });
'use strict';

//Letters service used for communicating with the letters REST endpoints
angular.module('letters').factory('Globals', ['$resource',
    function($resource) {
        return $resource('globals/:globalId/:controller', {
            globalId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
'use strict';

//Letters service used for communicating with the letters REST endpoints
angular.module('letters').factory('Articles', ['$resource',
    function($resource) {
        return $resource('articles/:articleId/:controller', {
            articleId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
    function($httpProvider) {
        // Set the httpProvider "not authorized" interceptor
        //         $httpProvider.interceptors.push(['$rootScope', '$q', '$cookieStore', '$location',
        //             function($rootScope, $q, $cookieStore, $location) {
        //                 return {
        //                     // Add authorization token to headers
        //                     request: function(config) {
        //                         config.headers = config.headers || {};
        //                         if ($cookieStore.get('token')) {
        //                             config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
        //                         }
        //                         return config;
        //                     },

        //                     // Intercept 401s and redirect you to login
        //                     responseError: function(response) {
        //                         if (response.status === 401) {
        //                             $location.path('/login');
        //                             // remove any stale tokens
        //                             $cookieStore.remove('token');
        //                             return $q.reject(response);
        //                         } else {
        //                             return $q.reject(response);
        //                         }
        //                     }
        //                 };
        //             }
        //         ]);
        //     }
        // ]);

        // Set the httpProvider "not authorized" interceptor
        $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
            function($q, $location, Authentication) {
                return {
                    responseError: function(rejection) {
                        switch (rejection.status) {
                            case 401:
                                // Deauthenticate the global user
                                Authentication.user = null;

                                // Redirect to signin page
                                $location.path('signin');
                                break;
                            case 403:
                                // Add unauthorized behaviour 
                                break;
                        }

                        return $q.reject(rejection);
                    }
                };
            }
        ]);
    }
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
    function($stateProvider) {
        // Users state routing
        $stateProvider.
        state('profile', {
            url: '/settings/profile/edit',
            templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
        }).
        state('password', {
            url: '/settings/password',
            templateUrl: 'modules/users/views/settings/change-password.client.view.html'
        }).
        state('signin', {
            url: '/signin',
            templateUrl: 'modules/users/views/authentication/signin.client.view.html'
        }).
        state('forgot', {
            url: '/password/forgot',
            templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
        }).
        state('reset-invalid', {
            url: '/password/reset/invalid',
            templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
        }).
        state('reset-success', {
            url: '/password/reset/success',
            templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
        }).
        state('reset', {
            url: '/password/reset/:token',
            templateUrl: 'modules/users/views/password/reset-password.client.view.html'
        });
    }
]);
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$state', 'Authentication', 'vcRecaptchaService',
    function($scope, $http, $state, Authentication, vcRecaptchaService) {
        $scope.user = Authentication.user;

        // If user is signed in, then redirect to appropriate page
        if ($scope.user) $state.go('command');

        $scope.signin = function(form) {
            $scope.credentials.rcap = vcRecaptchaService.getResponse();
            if ($scope.credentials.rcap) {
                $http.post('/auth/signin', $scope.credentials).success(function(response) {
                    // If successful we assign the response to the global user model
                    Authentication.user = response;
                    $scope.user = Authentication.user;
                    // And redirect to appropriate page
                    $scope.user.status === 0 ? $state.go('command') : $state.go('thanks');
                }).error(function(response) {
                    grecaptcha.reset();
                    $scope.error = response.message;
                });
            }
        };

    }
]);
'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
    function($scope, $http, $location, Users, Authentication) {
        $scope.user = Authentication.user;

        // If user is not signed in then redirect back home
        if (!$scope.user) $location.path('/');

        // Update a user profile
        $scope.updateUserProfile = function(isValid) {
            if (isValid) {
                $scope.success = $scope.error = null;
                var user = new Users($scope.user);

                user.$update(function(response) {
                    $scope.success = true;
                    Authentication.user = response;
                    var newPage = $scope.isFirstLogin ? '/settings/profile' : '/';
                    $location.path(newPage);
                }, function(response) {
                    $scope.error = response.data.message;
                });
            } else {
                $scope.submitted = true;
            }
        };

        // Change user password
        $scope.changeUserPassword = function() {
            $scope.success = $scope.error = null;

            $http.post('/users/password', $scope.passwordDetails).success(function(response) {
                // If successful show success message and clear form
                $scope.success = true;
                $scope.passwordDetails = null;
            }).error(function(response) {
                $scope.error = response.message;
            });
        };
    }
]);
'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [

    function() {
        var _this = this;

        _this._data = {
            user: window.user
        };

        return _this._data;

        //     var currentUser = {};
        //     //if ($cookieStore.get('token')) {
        //     currentUser = Users.get();
        //     //}

        //     return {

        //         /**
        //          * Authenticate user and save token
        //          *
        //          * @param  {Object}   user     - login info
        //          * @param  {Function} callback - optional
        //          * @return {Promise}
        //          */
        //         login: function(user, callback) {
        //             console.log(user);
        //             var cb = callback || angular.noop;
        //             var deferred = $q.defer();

        //             $http.post('/auth/signin', user).
        //             success(function(data) {
        //                 console.log(data);
        //                 //$cookieStore.put('token', data.token);
        //                 currentUser = Users.get();
        //                 deferred.resolve(data);
        //                 return cb();
        //             }).
        //             error(function(err) {
        //                 this.logout();
        //                 deferred.reject(err);
        //                 return cb(err);
        //             }.bind(this));

        //             return deferred.promise;
        //         },

        //         /**
        //          * Delete access token and user info
        //          *
        //          * @param  {Function}
        //          */
        //         logout: function() {
        //             //$cookieStore.remove('token');
        //             currentUser = {};
        //         },

        //         /**
        //          * Create a new user
        //          *
        //          * @param  {Object}   user     - user info
        //          * @param  {Function} callback - optional
        //          * @return {Promise}
        //          */
        //         createUser: function(user) {
        //             //                var cb = callback || angular.noop;

        //             return Users.save(user).$promise;
        //         },

        //         /**
        //          * Change password
        //          *
        //          * @param  {String}   oldPassword
        //          * @param  {String}   newPassword
        //          * @param  {Function} callback    - optional
        //          * @return {Promise}
        //          */
        //         changePassword: function(oldPassword, newPassword, callback) {
        //             var cb = callback || angular.noop;

        //             return Users.changePassword({
        //                 id: currentUser._id
        //             }, {
        //                 oldPassword: oldPassword,
        //                 newPassword: newPassword
        //             }, function(user) {
        //                 return cb(user);
        //             }, function(err) {
        //                 return cb(err);
        //             }).$promise;
        //         },

        //         updateProfile: function(user, callback) {
        //             var cb = callback || angular.noop;

        //             return Users.updateProfile({
        //                 id: user._id
        //             }, function(user) {
        //                 return cb(user);
        //             }, function(err) {
        //                 return cb(err);
        //             }).$promise;
        //         },

        //         /**
        //          * Gets all available info on authenticated user
        //          *
        //          * @return {Object} user
        //          */
        //         getCurrentUser: function() {
        //             return currentUser;
        //         },

        //         /**
        //          * Check if a user is logged in
        //          *
        //          * @return {Boolean}
        //          */
        //         isLoggedIn: function() {
        //             return currentUser.hasOwnProperty('role');
        //         },

        //         /**
        //          * Waits for currentUser to resolve before checking if user is logged in
        //          */
        //         isLoggedInAsync: function(cb) {
        //             if (currentUser.hasOwnProperty('$promise')) {
        //                 currentUser.$promise.then(function() {
        //                     cb(true);
        //                 }).catch(function() {
        //                     cb(false);
        //                 });
        //             } else if (currentUser.hasOwnProperty('role')) {
        //                 cb(true);
        //             } else {
        //                 cb(false);
        //             }
        //         },

        //         /**
        //          * Check if a user is an admin
        //          *
        //          * @return {Boolean}
        //          */
        //         isAdmin: function() {
        //             return currentUser.role === 'admin';
        //         },

        //         /**
        //          * Get auth token
        //          */
        //         // getToken: function() {
        //         //     return $cookieStore.get('token');
        //         // }
        //     };
        // }
    }
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);