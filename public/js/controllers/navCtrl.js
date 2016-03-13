'use strict';
angular.module('absencesManager').controller('navController',["AuthService", function(authService) {
    var controller = this;
    this.formStep = 1;
    this.showNav = function()
    {
        if(authService.isLoggedIn())
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    this.setFormStep = function(step)
    {
        this.formStep = step;
    }

    this.isFormStep = function(step)
    {
        return this.formStep === step;
    }
}]);
