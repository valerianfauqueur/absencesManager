'use strict';
angular.module('absencesManager').controller('loginCtrl',["AuthService","$scope","$location", function(AuthService,$scope,$location) {
    var controller = this;
    this.login = function(user)
    {
        if(user.username && user.password)
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
        }
        else
        {
            if(user.username)
            {
                if(!user.password)
                {
                    controller.error = true;
                    controller.errorMessage = "vous n'avez pas entré de mot de passe";
                }
            }
            else
            {
                if(!user.password)
                {
                    controller.error = true;
                    controller.errorMessage = "vous n'avez pas entré de mot de passe ni de nom d'utilisateur";
                }
                else
                {
                    controller.error = true;
                    controller.errorMessage = "vous n'avez pas entré de nom d'utilisateur";
                }
            }
        }
    }

}]);
