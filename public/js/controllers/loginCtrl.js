'use strict';
angular.module('absencesManager').controller('loginCtrl',["AuthService","$scope","$location", function(AuthService,$scope,$location) {
    var controller = this;
    this.login = function(user)
    {
        controller.error = false;
        AuthService.login(user.username,user.password)
        .then(function () {
            $location.path('/');
        })
        .catch(function () {
            controller.error = true;
            controller.errorMessage = "Invalid username and/or password";
        });
    };

}]);
