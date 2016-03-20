'use strict';
angular.module('absencesManager').controller('absenceController',["$rootScope","$q","$http", function($rootScope, $q,$http) {

    var controller = this;
    var scope = $rootScope;
    var canvas = document.querySelector("canvas");
    var messagebox = document.querySelector(".course-info .message");
    var ctx = canvas.getContext("2d");
    var seats = [];
    scope.account = {};
    var userImg = new Image();
    userImg.src = "../../img/usericon.png";
    var alreadyRedrawed = true;
    var Collide = false;
    var canvasClick;
    var canvas_size = getViewport();
    var canvas_width  = (canvas_size[0]/100)*50;
    var canvas_height = (canvas_size[0]/100)*34;
    canvas.setAttribute("width", canvas_width);
    canvas.setAttribute("height", canvas_height);

    var seatsParams = {
        height:(canvas_width/100)*8.7,
        width:(canvas_width/100)*8.7,
        middlespace: (canvas_width/100)*62
    }
    seatsParams.spaceBetweenX= seatsParams.width+(canvas_width/100)*1;
    seatsParams.spaceBetweenY= seatsParams.height+(canvas_width/100)*2;
    var voyelles = ["a","e","i","o","u","y"];



    var resizeTimer = 500;
    window.addEventListener("resize", function(){
            canvas_size = getViewport();
            canvas_width  = (canvas_size[0]/100)*50;
            canvas_height = (canvas_size[0]/100)*34;
            seatsParams.height =(canvas_width/100)*8.7;
            seatsParams.width =(canvas_width/100)*8.7;
            seatsParams.middlespace = (canvas_width/100)*62;
            seatsParams.spaceBetweenX= seatsParams.width+(canvas_width/100)*1;
            seatsParams.spaceBetweenY= seatsParams.height+(canvas_width/100)*2;
            canvas.setAttribute("width", canvas_width);
            canvas.setAttribute("height", canvas_height);
            drawSeat();
    });
    this.getData = function()
    {
        var deferred = $q.defer();
        $http.get("/data")
            .success(function (data) {
                if(data)
                {
                    scope.account.currentCourse = data.course;
                    if(data.course === false)
                    {
                      scope.currentCourse = "Pas ce cours pour le moment, met toi à l'aise !";
                    }
                    else
                    {
                        if(voyelles.indexOf(scope.account.currentCourse.substr(0,1)))
                        {
                            scope.currentCourse = "tu dois être en cours d'"+data.course+" non ?";
                        }
                        else
                        {
                            scope.currentCourse = "tu dois être en cours de "+data.course+" non ?";
                        }
                    }
                    scope.account.promotion = data.account.promotion;
                    scope.account.username = data.account.username;
                    var getname2 = data.account.username.split("@");
                    var getname = getname2[0].split(".");
                    scope.account.firstname = getname[0];
                    scope.account.lastname = getname[1];
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

    socket.on("room:start", function(){
        var numberOfSeatr1 = 36;
        var numberOfSeatr2 = 20;
        messagebox.innerText = "Veuillez indiquer votre position sur le schéma";
        var o = seatsParams, z, seatsRow,perRowr1, perRowr2;
        perRowr1 = 6;
        perRowr2 = 4;
           for(var i = 0; i < numberOfSeatr1;i++)
           {
               z = i % perRowr1;
               seatsRow = Math.floor(i/perRowr1);
               seats.push({number:i, x:(z*o.spaceBetweenX), y:(seatsRow*o.spaceBetweenY), height:o.height, width:o.width, taked:false});
               ctx.fillStyle = "grey";
               ctx.fillRect((z*o.spaceBetweenX),(seatsRow*o.spaceBetweenY),o.width,o.height);

           }

           for(var i = 0,d=36; i < numberOfSeatr2;i++,d++)
           {
               z = i % perRowr2;
               seatsRow = Math.floor(i/perRowr2);
               seats.push({number:d, x:(z*o.spaceBetweenX)+o.middlespace, y:(seatsRow*o.spaceBetweenY)+(o.spaceBetweenY), height:o.height, width:o.width, taked:false});
               ctx.fillStyle = "grey";
               ctx.fillRect((z*o.spaceBetweenX)+o.middlespace,(seatsRow*o.spaceBetweenY)+(o.spaceBetweenY),o.width,o.height);
           }
    });


    function drawSeat()
    {
        var numberOfSeatr1 = 36;
        var numberOfSeatr2 = 20;
        var o = seatsParams, z, seatsRow,perRowr1, perRowr2;
        perRowr1 = 6;
        perRowr2 = 4;
        ctx.clearRect(0,0,canvas_width,canvas_height);
            for(var i = 0; i < numberOfSeatr1;i++)
            {
                if(seats[i].taked === "me")
                {
                    ctx.fillStyle="orange";
                }
                else if (seats[i].taked === "verify")
                {
                    ctx.fillStyle="yellow";
                }
                else if(seats[i].taked === true)
                {
                     ctx.fillStyle="black";
                }
                else
                {
                    ctx.fillStyle="grey";
                }
                z = i % perRowr1;
                seatsRow = Math.floor(i/perRowr1);
                seats[i].x = (z*o.spaceBetweenX);
                seats[i].y = (seatsRow*o.spaceBetweenY);
                seats[i].height = o.height;
                seats[i].width = o.width;
                ctx.fillRect(seats[i].x,seats[i].y,seats[i].width,seats[i].height);
            }

            for(var i = 0; i < numberOfSeatr2;i++)
            {

                if(seats[i].taked === "me")
                {
                    ctx.fillStyle="orange";
                }
                else if (seats[i].taked === "verify")
                {
                    ctx.fillStyle="yellow";
                }
                else if(seats[i].taked === true)
                {
                     ctx.fillStyle="black";
                }
                else
                {
                    ctx.fillStyle="grey";
                }
                z = i % perRowr2;
                seatsRow = Math.floor(i/perRowr2);
                seats[i].x = (z*o.spaceBetweenX)+o.middlespace;
                seats[i].y = (seatsRow*o.spaceBetweenY)+o.spaceBetweenY;
                seats[i].height = o.height;
                seats[i].width = o.width;
                ctx.fillRect(seats[i].x,seats[i].y,seats[i].width,seats[i].height);
            }
        }

    socket.on("room:wait", function(numberOfUsers){
        messagebox.innerHTML = "Il y a " + numberOfUsers + " étudiants prêt(s). Attente de plus d'étudiants";
    });

    socket.on('room:seatTakenByYou', function(seat){
        messagebox.innerHTML = "Présence en attende de validation par un autre Etudiant"
        var seat = seats[seat];
        seat.taked = "me";
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
        ctx.fillStyle = "black";
        ctx.fillRect(seat.x,seat.y,seat.width,seat.height);
    });


    socket.on('room:MySeat', function(seat){
            var seat = seats[seat];
            seat.taked = "me";
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
            seat.taked = "verify";
            ctx.fillStyle = "yellow";
            ctx.fillRect(seat.x,seat.y,seat.width,seat.height);
            messagebox.innerHTML = "Veuillez confirmer la présence de " +user.firstname +" "+user.lastname.toUpperCase()+". avant de continuer\n<button class='btn btn-success' id='validatebtn'>YES</button><button class='btn btn-danger' id='conflictbtn'>NO</button>";
            $(".course-info .message").on("click","#validatebtn", function(e){
                controller.checkUser(true);
            });
           $(".course-info .message").on("click","#conflictbtn", function(e){
               controller.checkUser(false);
           });
    });

    socket.on("room:timer",function(time){
        var servTime = new Date(time);
        servTime.setMinutes(servTime.getMinutes()+5);
        console.log("here");
        $(".course-info #countdown").countdown(servTime, function(event){
            $(this).html(event.strftime('%M:%S'));
        });
    });





    function dateDiff(date1, date2){
        var diff = {}                           // Initialisation du retour
        var tmp = date2 - date1;
        tmp = Math.floor(tmp/1000);             // Nombre de secondes entre les 2 dates
        diff.sec = tmp % 60;                    // Extraction du nombre de secondes
        tmp = Math.floor((tmp-diff.sec)/60);    // Nombre de minutes (partie entière)
        diff.min = tmp % 60;                    // Extraction du nombre de minutes
        tmp = Math.floor((tmp-diff.min)/60);    // Nombre d'heures (entières)
        diff.hour = tmp % 24;                   // Extraction du nombre d'heures
        tmp = Math.floor((tmp-diff.hour)/24);   // Nombre de jours restants
        diff.day = tmp;
        return diff;
    }

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

    this.end = function()
    {
        socket.emit("end",scope.account);
    }

    function getViewport() {

     var viewPortWidth;
     var viewPortHeight;

     // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
     if (typeof window.innerWidth != 'undefined') {
       viewPortWidth = window.innerWidth,
       viewPortHeight = window.innerHeight
     }

    // IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
     else if (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth != 'undefined' && document.documentElement.clientWidth !== 0) {
        viewPortWidth = document.documentElement.clientWidth,
        viewPortHeight = document.documentElement.clientHeight
     }

     // older versions of IE
     else {
       viewPortWidth = document.getElementsByTagName('body')[0].clientWidth,
       viewPortHeight = document.getElementsByTagName('body')[0].clientHeight
     }

     return [viewPortWidth, viewPortHeight];
    }


}])
