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
    var socket = io.connect();



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
    messagebox.innerText = "Veuillez indiquer votre position sur le schéma";
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
        messagebox.innerHTML = "Il y a " + numberOfUsers + " étudiants prêt(s). Attente de plus d'étudiants";
    });

    socket.on('room:seatTakenByYou', function(seat){
        messagebox.innerHTML = "Présence en attende de validation par un autre Etudiant"
        var seat = seats[seat];
        ctx.fillStyle = "orange";
        ctx.fillRect(seat.x,seat.y,seat.width,seat.height);
    });

    socket.on('room:seatAlreadyUsedByYou', function(){
        messagebox.innerHTML = "Vous avez déjà selectionnez ce siège, attendez qu'un Etudiant valide votre présence";
        setTimeout(function(){
            messagebox.innerHTML = "Présence en attende de validation par un autre Etudiant";
        },3000);
    });

    socket.on('room:seatAlreadyUsed', function(){
        messagebox.innerText = "Ce siège était déjà pris, veuillez en choisir un autre";
        setTimeout(function(){
            messagebox.innerHTML = "Veuillez indiquer votre position sur le schéma";
        },3000);
    });

    socket.on('room:seatTaken', function(seat){
        var seat = seats[seat];
        seat.taked = true;
        ctx.fillStyle = "blue";
        ctx.fillRect(seat.x,seat.y,seat.width,seat.height);
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
                messagebox.innerHTML = "Présence en attende de validation par un autre Etudiant";
            },3000);
    });

    socket.on('room:AllSeatTaken', function(seatTaken){
        for(var i=0,l=seatTaken.length;i<l;i++)
        {
            var seat = seats[seatTaken[i]];
            seat.taked = true;
            ctx.fillStyle = "black";
            ctx.fillRect(seat.x,seat.y,seat.width,seat.height);
        }
    });

    socket.on('room:usertocheck', function(user){
            console.log(user.seat);
            console.log(seats);
            var seat = seats[user.seat];
            ctx.fillStyle = "yellow";
            ctx.fillRect(seat.x,seat.y,seat.width,seat.height);
            messagebox.innerHTML = "Veuillez confirmer la présence de " +user.username +" avant de continuer\n<button class='btn btn-success' id='validatebtn'>YES</button><button class='btn btn-danger' id='conflictbtn'>NO</button>";
            $(".course-info .message").on("click","#validatebtn", function(e){
                controller.checkUser(true);
            });
           $(".course-info .message").on("click","#conflictbtn", function(e){
               controller.checkUser(false);
           });
    });


    this.checkUser = function(answer)
    {
        if(answer === true)
        {
            socket.emit("room:validateuser", scope.account,"yes");
            messagebox.innerHTML = "Vous avez fini ! Votre statut sera pris en compte ! Si votre statut ne correspond à la fin du timer allez voir l'intervenant";
        }
        else if (answer === false)
        {
            socket.emit("room:validateuser", scope.account,"no");
            messagebox.innerHTML = "Vous avez fini ! Votre statut sera pris en compte ! Si votre statut ne correspond à la fin du timer allez voir l'intervenant";
        }
        else
        {
            messagebox.innerHTML = "réponse non valide";
        }
    }




}])
