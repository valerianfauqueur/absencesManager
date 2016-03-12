'use strict';
angular.module('absencesManager').controller('userCreationCtrl',["$http","$q", function($http,$q) {

this.addUser = function(user)
{
    var deferred = $q.defer();
    $http.post('/register',user)
    // handle success
    .success(function (data, status) {
        if(status === 200 && data.status){
            deferred.resolve();
        } else {
            deferred.reject();
        }
    })
    // handle error
    .error(function (data) {
        deferred.reject();
    });
}

}]);
