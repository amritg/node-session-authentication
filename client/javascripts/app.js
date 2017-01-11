(function(){
    var app = angular.module('opticalDashBoard',['ui.router']);
    app.controller('LogInCtrl',['$scope','$http','$location',function($scope,$http,$location){
        $scope.name = "This is name";
        $scope.user = {
            username: "",
            password: "",
        }
        $scope.logInUser = function(user){
            $http.post('/login', user).then(function(response){
                console.log('Success response:');
                console.log(response);
                $location.path('/home');
            }, function(response){
                console.log('Error response:');
                console.log(response);
                $scope.user = {
                    username: "",
                    password: "",
                }
                $location.path('/login');
            });
        }
        $scope.logout = function(){
            $http.get('/logout').success(function(){
                $location.path('/login');
            });
        }
    }]);
    app.config([
        '$stateProvider',
        '$urlRouterProvider',
        '$httpProvider',
        function($stateProvider,$urlRouterProvider,$httpProvider){
            $stateProvider
                .state('login',{
                    url: '/login',
                    templateUrl:'/templates/login.html',
                    controller: 'LogInCtrl',
                    
                })
                .state('home',{
                    url: '/home',
                    templateUrl: '/templates/home.html',
                    controller: 'LogInCtrl',
                    resolve: {
                        loggedIn: checkLoggedIn
                    }
                });
            // $httpProvider
            //     .interceptors
            //         .push(function($q, $location){
            //             return {
            //                 response: function(response)
            //                 { 
            //                     return response;
            //                 },
            //                 responseError: function(response)
            //                 {
            //                     if (response.status === 401)
            //                         $location.url('/login');
            //                     return $q.reject(response);
            //                 }
            //             };
            //         });
            $urlRouterProvider.otherwise('login');
        }
    ]);
    var checkLoggedIn = function($q, $http, $location, $rootScope){
        var deferred = $q.defer();
        $http.get('/loggedIn').success(function(user){
            $rootScope.errorMessage = null;
            // User is Authenticated
            if (user !== '0')
                deferred.resolve();
            // User is Not Authenticated
            else
            {
                $rootScope.errorMessage = 'You need to log in.';
                deferred.reject();
                $location.url('/login');
            }
        });
        return deferred.promise;
    };
})();