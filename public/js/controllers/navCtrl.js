'use strict';
angular.module('absencesManager').controller('navController',["AuthService","$scope", function(authService,$scope) {
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

    this.setFormStep = function(step,element)
    {
        if(element)
        {
            var disabled = $(element.srcElement).hasClass("disabled");
        }
        else
        {
            var disabled = false;
        }
        console.log(disabled);
        if (!disabled)
        {
            this.formStep = step;
            console.log(step);
        }
    }

    this.isFormStep = function(step)
    {
        return this.formStep === step;
    }

    socket.on("room:notcreated",function(){
        controller.setFormStep(1);
        $scope.$apply();
        $('.course-info [data-remodal-id=course-does-not-exist]').remodal().open();
    });

    socket.on("room:closed",function(){
        controller.setFormStep(1);
        $scope.$apply();
        $('.course-info [data-remodal-id=course-checkin-over]').remodal().open();
    });
}]);
