'use strict';
angular.module('absencesManager').controller('absenceController',["$rootScope","$q","$http", function($rootScope, $q,$http) {

    var controller = this;
    var scope = $rootScope;
    var canvas = document.querySelector("canvas");
    var messagebox = document.querySelector(".course-info .message");
    var ctx = canvas.getContext("2d");
    var seats = [];
    var seatsParams = {
        height:50,
        width:60,
        canvasOffsetX: 20,
        canvasOffsetY: 20
    }
    seatsParams.spaceBetweenX= seatsParams.width+10;
    seatsParams.spaceBetweenY= seatsParams.height+10;
    scope.account = {};
    var userImg = new Image();
    userImg.src = "../../img/usericon.png";
    var alreadyRedrawed = true;
    var Collide = false;
    var canvasClick;


    this.getData = function()
    {
        var deferred = $q.defer();
        $http.get("/data")
            .success(function (data) {
                if(data)
                {
                    scope.account.currentCourse = data.course;
                    scope.account.promotion = data.account.promotion;
                    scope.account.username = data.account.username;
                    scope.account.group = data.account.group;
                    deferred.resolve(data);
                }
            })
            .error(function (data) {
                scope.currentCourse = "Could not get data";
                scope.account.promotion = false;
                scope.account.username = false;
                scope.account.group = false;
                deferred.reject(data);
            })
        return deferred.promise;
    }

    function collide(mouse,target)
    {
        return !(
            ( mouse.y < target.y ) ||
            ( mouse.y > ( target.y + target.height ) ) ||
            ( mouse.x < target.x ) ||
            ( mouse.x > ( target.x + target.width ) )
        );
    }



    canvas.addEventListener("mousemove",displayIcon);

    function displayIcon(e)
    {
        var mouse = {
                x: e.clientX - canvas.getBoundingClientRect().left,
                y: e.clientY - canvas.getBoundingClientRect().top
        };
        var collideThisCheck = false;
        for(var i = 0, l = seats.length; i<l;i++)
        {
            if(collide(mouse,seats[i]))
            {
                if(!seats[i].taked)
                {
                    ctx.drawImage(userImg,seats[i].x+(seats[i].width/2)-24,seats[i].y+(seats[i].height/2)-24);
                    Collide = seats[i];
                    collideThisCheck = true;
                    alreadyRedrawed = false;
                }
            }
        }
        if(collideThisCheck === false && alreadyRedrawed === false)
        {
                ctx.fillStyle = "grey";
                ctx.fillRect(Collide.x,Collide.y,Collide.width,Collide.height);
                alreadyRedrawed = true;
        }
    }




    canvas.addEventListener("click",function(e){
        var mouse = {
            x: e.clientX - canvas.getBoundingClientRect().left,
            y: e.clientY - canvas.getBoundingClientRect().top
        };
        for(var i = 0, l = seats.length; i<l;i++)
        {
            if(collide(mouse,seats[i]))
            {
                if(!seats[i].taked)
                {
                    socket.emit("room:setseat",scope.account,seats[i].number);
                    canvas.removeEventListener("mousemove", displayIcon);
                }
            }
        }
    });

    this.joinList = function()
    {
        socket.emit("readyToJoin", scope.account);
    }

    socket.on("room:start", function(numberOfSeat){
    messagebox.innerText = "Veuillez indiquer votre position sur le schéma"
    var o = seatsParams, z, seatsRow,perRow;
    perRow = Math.floor(((canvas.width-o.canvasOffsetX)/o.spaceBetweenX));
       for(var i = 0; i < numberOfSeat;i++)
       {
           z = i % perRow;
           seatsRow = Math.floor(i/perRow);
           seats.push({number:i, x:(z*o.spaceBetweenX)+o.canvasOffsetX, y:(seatsRow*o.spaceBetweenY)+o.canvasOffsetY, height:o.height, width:o.width, taked:false});
           ctx.fillStyle = "grey";
           ctx.fillRect((z*o.spaceBetweenX)+o.canvasOffsetX,(seatsRow*o.spaceBetweenY)+o.canvasOffsetY,o.width,o.height);
       }
    });


    socket.on("room:wait", function(numberOfUsers){
        messagebox.innerText = "Il y a " + numberOfUsers + " étudiants prêt(s). Attente de plus d'étudiants";
    });

    socket.on('room:seatTakenByYou', function(seat){
        messagebox.innerText = "Présence en attende de validation par un autre Etudiant"
        var seat = seats[seat];
        ctx.fillStyle = "orange";
        ctx.fillRect(seat.x,seat.y,seat.width,seat.height);
    });

    socket.on('room:seatAlreadyUsedByYou', function(){
        messagebox.innerText = "Vous avez déjà selectionnez ce siège, attendez qu'un Etudiant valide votre présence";
        setTimeout(function(){
            messagebox.innerText = "Présence en attende de validation par un autre Etudiant";
        },3000);
    });

    socket.on('room:seatAlreadyUsed', function(){
        messagebox.innerText = "Ce siège était déjà pris, veuillez en choisir un autre";
        setTimeout(function(){
            messagebox.innerText = "Veuillez indiquer votre position sur le schéma";
        },3000);
    });

    socket.on('room:seatTaken', function(seat){
        var seat = seats[seat];
        seat.taked = true;
        ctx.fillStyle = "blue";
        ctx.fillRect(seat.x,seat.y,seat.width,seat.height);
    });

    socket.on('room:AllSeatTaken', function(seats){
        for(var i=0,l=seats.length;i<l;i++)
        {
            var seat = seats[seat];
            seat.taked = true;
            ctx.fillStyle = "blue";
            ctx.fillRect(seat.x,seat.y,seat.width,seat.height);
        }
    });

    socket.on('room:MySeat', function(seat){
            var seat = seats[seat];
            seat.taked = true;
            ctx.fillStyle = "orange";
            ctx.fillRect(seat.x,seat.y,seat.width,seat.height);
            canvas.removeEventListener("mousemove", displayIcon);
    });

        socket.on('room:seatAlreadySet', function(){
            messagebox.innerText = "Vous avez déjà selectionnez un autre siège, attendez qu'un Etudiant valide votre présence";
            setTimeout(function(){
                messagebox.innerText = "Présence en attende de validation par un autre Etudiant";
            },3000);
    });




}])
