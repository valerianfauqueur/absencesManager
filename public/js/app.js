'use strict';
angular.module('absencesManager', ["ngRoute"]).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
    $routeProvider
        .when("/", {
            templateUrl:"partials/home.html",
            controller:"absenceController",
            controllerAs:"absenceCtrl",
            access: {restricted: false}
        })
        .when("/login", {
            templateUrl:"partials/loggin.html",
            controller:"loginCtrl",
            controllerAs:"loginCtrl",
            access: {restricted: false}
        })
        .when("/inscription", {
            templateUrl: "partials/registration.html",
            controller:"userCreationCtrl",
            controllerAs:"userCreation",
            access: {restricted: true}
        })
        .when("/logout", {
            controller:"logoutController",
            access: {restricted: false}
        })
  }]);


//Test if the user is still logged in on route change
angular.module("absencesManager").run(function ($rootScope, $location, $route, AuthService) {
  $rootScope.$on('$routeChangeStart',
    function (event, next, current) {
      AuthService.getUserStatus().then(function(){
          console.log(next.$$route.originalPath);
        if(next.$$route.originalPath == "/login")
        {
            $location.path('/');
        }
      }).catch(function(data){
        $location.path('/login');
      })

      //If the route is administrator restricted
      if(next.access.restricted)
      {
          //if user is not admin redirect
          AuthService.isAdmin().then(function(){
          }).catch(function(){
            $location.path('/');
          });
      }
  });
});
