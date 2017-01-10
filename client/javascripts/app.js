(function(){
    var app = angular.module('opticalDashBoard',['ui.router']);
    app.controller('LogInCtrl',['$scope','$http',function($scope,$http){
        $scope.name = "This is name";
        $scope.user = {
            username: "",
            password: "",
        }
        $scope.logInUser = function(user){
            $http.post('/logIn', user).success(function(response){
                console.log(response);
            });
        }
    }]);
    app.config([
        '$stateProvider',
        '$urlRouterProvider',
        function($stateProvider,$urlRouterProvider){
            $stateProvider
                .state('login',{
                    url: '/login',
                    templateUrl:'/templates/login.html',
                    controller: 'LogInCtrl'
                })
                .state('home',{
                    url: '/home',
                    templateUrl: '/templates/home.html',
                    controller: ''
                });
                
            $urlRouterProvider.otherwise('login');
        }
    ]);
})();