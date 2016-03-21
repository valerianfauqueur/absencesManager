'use strict';
angular.module('absencesManager').controller('justifyController',["$http","$q", function($http,$q) {
var controller = this;



this.getAbs = function()
{
    var deferred = $q.defer();
    $http.get("/myabsences")
        .success(function(data){
         var array = [];
            for(var d=0,l=data.absences.length;d<l;d++)
            {
                if(data.absences[d].state === "Absent")
                {
                    data.absences[d].motif = "Tu n'as pas validé ta présence";
                }
                else if(data.absences[d].state === "waitingValidation")
                {
                    data.absences[d].motif = "Personne n'a validé ta présence";
                }
                else if(data.absences[d].state === "Conflict")
                {
                    data.absences[d].motif = "La personne qui t'as vérifié t'as a signalé absent";
                }

                if(data.absences[d].hasConfirmedSomeone !== undefined)
                {
                    if(data.absences[d].hasConfirmedSomeone === false)
                    {
                        data.absences[d].motif = "Tu n'as pas validé quelqu'un";
                    }
                }
                array.push(data.absences[d]);
            }
            deferred.resolve(array);
        })
        .error(function(err){
        console.log(err);
        deferred.reject();
        })
    return deferred.promise;
}

var dataAbs = this.getAbs();

dataAbs.then(function(data){
    controller.createTable(data);
});

this.createTable = function(array)
{
    for(var i =0, l=array.length;i<l;i++)
    {
        $("<tr><td>"+array[i].date+"</td><td>"+array[i].course+"</td><td>"+array[i].motif+"</td>").appendTo($("#absences"));
    }
}


}]);
