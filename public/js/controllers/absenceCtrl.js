'use strict';
angular.module('absencesManager').controller('absenceController',["AuthService","$q","$http", function(authService, $q,$http) {

    var controller = this;
    this.promotion = undefined;
    this.currentCourse = undefined;
    this.getCurrentCourse = function()
    {
        var deferred = $q.defer();
        $http.get("/user/currentCourse")
            .success(function (data) {
                controller.currentCourse = data.course;
                deferred.resolve(data.course);
            })
            .error(function (data) {
                controller.currentCourse = "Could not get data";
                deferred.reject(data.course);
            })
        return deferred.promise;
    }()

    this.getUserPromotion = function()
    {
        var deferred = $q.defer();
        $http.get("/user/promotion")
            .success(function (data) {
                controller.promotion = data;
                deferred.resolve(data);
            })
            .error(function (data) {
                controller.promotion = "Could not get data";
                deferred.reject(data);
            })
        return deferred.promise;
    }
}])
