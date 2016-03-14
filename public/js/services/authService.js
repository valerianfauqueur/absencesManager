'use strict';
angular.module('absencesManager').factory('AuthService', ['$q', '$rootScope', '$http',
    function ($q, $rootScope, $http) {

        // create user variable
        var user = null;
        var admin = null;

        function isLoggedIn() {
            if (user) {
                return true;
            } else {
                return false;
            }
        }

        function getUserStatus() {
            var defered = $q.defer();
            $http.get('/status')
                .success(function(data) {
                    if (data.status) {
                        user = true;
                        defered.resolve(user);
                    } else {
                        user = false;
                        defered.reject(user);
                    }
                })
                .error(function (data) {
                    user = false;
                    defered.reject(user);
                });

            return defered.promise;
        }


        function login(username, password) {

            var deferred = $q.defer();
            // send a post request to the server
            $http.post('/login', {
                    username: username,
                    password: password
                })
                // handle success
                .success(function (data, status) {
                    if (status === 200 && data.status) {
                        user = true;
                        deferred.resolve();
                    } else {
                        user = false;
                        deferred.reject();
                    }
                })
                // handle error
                .error(function (data) {
                    user = false;
                    deferred.reject();
                });

            // return promise object
            return deferred.promise;
        }


        function logout() {
            // create a new instance of deferred
            var deferred = $q.defer();

            // send a get request to the server
            $http.get('/logout')
                // handle success
                .success(function (data) {
                    user = false;
                    admin = false;
                    $rootScope.account = {};
                    deferred.resolve();
                })
                // handle error
                .error(function (data) {
                    user = false;
                    admin = false;
                    $rootScope.account = {};
                    deferred.reject();
                });

            // return promise object
            return deferred.promise;
        }


        function isAdmin() {
            var defered = $q.defer();
            if (isLoggedIn() === true) {
                $http.get("/admin")
                    .success(function (data) {
                        if (data.status === true) {
                            admin = true;
                            defered.resolve(admin);
                        } else {
                            admin = false;
                            defered.reject(admin);
                        }
                    })
                    .error(function (data) {
                        admin = false;
                        defered.reject(admin);
                    })
            }
            return defered.promise;
        }



        // return available functions for use in the controllers
        return ({
            getUserStatus: getUserStatus,
            login: login,
            logout: logout,
            isAdmin: isAdmin,
            isLoggedIn: isLoggedIn
        });

}]);
