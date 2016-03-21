'use strict';
angular.module('absencesManager').controller('absenceController',["$rootScope","$q","$http", function($rootScope, $q,$http) {

    var controller = this;
    var scope = $rootScope;
    var canvas = document.querySelector("canvas");
    var messagebox = document.querySelector(".home-container .board #row1 h3");
    var statusbox = document.querySelector(".home-container .board #row1 .appel .appel--content .step2 .status");
    var refreshbox = document.querySelector(".home-container .board #row1 .appel .appel--content .step2 .refresh");
    var titlebox = document.querySelector(".home-container .board #row1 h2");
    var ctx = canvas.getContext("2d");
    var seats = [];
    var userImg = new Image();
    userImg.src = "../../img/usericon.png";
    var alreadyRedrawed = true;
    var Collide = false;
    var canvasClick;
    var canvas_size = getContainer();
    var canvas_width  = (canvas_size[0]/100)*90;
    var canvas_height = (canvas_size[0]/100)*40;
    canvas.setAttribute("width", canvas_width);
    canvas.setAttribute("height", canvas_height);
    this.formStep = 1;
    var refreshtimer;

    var seatsParams = {
        height:(canvas_width/100)*5.2,
        width:(canvas_width/100)*8.7,
        middlespace: (canvas_width/100)*62
    }
    seatsParams.spaceBetweenX= seatsParams.width+(canvas_width/100)*1;
    seatsParams.spaceBetweenY= seatsParams.height+(canvas_width/100)*2;



    var resizeTimer = 500;
    window.addEventListener("resize", function(){
            canvas_size = getContainer();
            canvas_width  = (canvas_size[0]/100)*90;
            canvas_height = (canvas_size[0]/100)*40;
            seatsParams.height =(canvas_width/100)*5.2;
            seatsParams.width =(canvas_width/100)*8.7;
            seatsParams.middlespace = (canvas_width/100)*62;
            seatsParams.spaceBetweenX= seatsParams.width+(canvas_width/100)*1;
            seatsParams.spaceBetweenY= seatsParams.height+(canvas_width/100)*2;
            canvas.setAttribute("width", canvas_width);
            canvas.setAttribute("height", canvas_height);
            drawSeat();
    });

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
                ctx.fillStyle = "#d8d8d8";
                ctx.fillRect(Collide.x,Collide.y,Collide.width,Collide.height);
                alreadyRedrawed = true;
        }
    }




    canvas.addEventListener("click",clickcanvas);


    function clickcanvas(e){
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
    }


    socket.on("room:start", function(){
        var numberOfSeatr1 = 36;
        var numberOfSeatr2 = 20;
        messagebox.innerHTML = "Veuillez indiquer votre position sur le schéma";
        var o = seatsParams, z, seatsRow,perRowr1, perRowr2;
        perRowr1 = 6;
        perRowr2 = 4;
           for(var i = 0; i < numberOfSeatr1;i++)
           {
               z = i % perRowr1;
               seatsRow = Math.floor(i/perRowr1);
               seats.push({number:i, x:(z*o.spaceBetweenX), y:(seatsRow*o.spaceBetweenY), height:o.height, width:o.width, taked:false});
               ctx.fillStyle = "#d8d8d8";
               ctx.fillRect((z*o.spaceBetweenX),(seatsRow*o.spaceBetweenY),o.width,o.height);

           }

           for(var i = 0,d=36; i < numberOfSeatr2;i++,d++)
           {
               z = i % perRowr2;
               seatsRow = Math.floor(i/perRowr2);
               seats.push({number:d, x:(z*o.spaceBetweenX)+o.middlespace, y:(seatsRow*o.spaceBetweenY)+(o.spaceBetweenY), height:o.height, width:o.width, taked:false});
               ctx.fillStyle = "#d8d8d8";
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
                    ctx.fillStyle="#3f51b5";
                }
                else if(seats[i].taked === true)
                {
                     ctx.fillStyle="#363736";
                }
                else
                {
                    ctx.fillStyle="#d8d8d8";
                }
                z = i % perRowr1;
                seatsRow = Math.floor(i/perRowr1);
                seats[i].x = (z*o.spaceBetweenX);
                seats[i].y = (seatsRow*o.spaceBetweenY);
                seats[i].height = o.height;
                seats[i].width = o.width;
                ctx.fillRect(seats[i].x,seats[i].y,seats[i].width,seats[i].height);
            }

            for(var d = 0,p =36; d < numberOfSeatr2;d++,p++)
            {

                if(seats[p].taked === "me")
                {
                    ctx.fillStyle="orange";
                }
                else if (seats[p].taked === "verify")
                {
                    ctx.fillStyle="#3f51b5";
                }
                else if(seats[p].taked === true)
                {
                     ctx.fillStyle="#363736";
                }
                else
                {
                    ctx.fillStyle="#d8d8d8";
                }
                z = d % perRowr2;
                seatsRow = Math.floor(d/perRowr2);
                seats[p].x = (z*o.spaceBetweenX)+o.middlespace;
                seats[p].y = (seatsRow*o.spaceBetweenY)+o.spaceBetweenY;
                seats[p].height = o.height;
                seats[p].width = o.width;
                ctx.fillRect(seats[p].x,seats[p].y,seats[p].width,seats[p].height);
            }
        }


    socket.on('room:seatTakenByYou', function(seat){
        messagebox.innerHTML = "Attente de la fin de la période d'enregistrement";
        var seat = seats[seat];
        seat.taked = "me";
        ctx.fillStyle = "orange";
        ctx.fillRect(seat.x,seat.y,seat.width,seat.height);
    });

    socket.on('room:seatAlreadyUsedByYou', function(){
        messagebox.innerHTML = "Vous avez déjà selectionnez ce siège, attendez qu'un Etudiant valide votre présence";
        setTimeout(function(){
            messagebox.innerHTML = "Attente de la fin de la période d'enregistrement";
        },3000);
    });

    socket.on('room:seatAlreadyUsed', function(){
        messagebox.innerHTML = "Ce siège était déjà pris, veuillez en choisir un autre";
        setTimeout(function(){
            messagebox.innerHTML = "Veuillez indiquer votre position sur le schéma";
        },3000);
    });

    socket.on('room:seatTaken', function(seat){
        var seat = seats[seat];
        seat.taked = true;
        ctx.fillStyle = "#363736";
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
            messagebox.innerHTML = "Vous avez déjà selectionnez un autre siège";
            setTimeout(function(){
                messagebox.innerHTML = "Attente de la fin de la période d'enregistrement";
            },3000);
    });

    socket.on('room:AllSeatTaken', function(seatTaken){
        for(var i=0,l=seatTaken.length;i<l;i++)
        {
            var seat = seats[seatTaken[i]];
            seat.taked = true;
            ctx.fillStyle = "#363736";
            ctx.fillRect(seat.x,seat.y,seat.width,seat.height);
        }
    });

    socket.on('room:usertocheck', function(user){
            console.log(user);
            canvas.removeEventListener("click",clickcanvas);
            var getname2 = user.username.split("@");
            var getname = getname2[0].split(".");
            var firstname = getname[0].charAt(0).toUpperCase() +getname[0].slice(1);
            var lastname = getname[1].charAt(0).toUpperCase() +getname[1].slice(1);
            var seat = seats[user.seat];
            seat.taked = "verify";
            ctx.fillStyle = "#3f51b5";
            ctx.fillRect(seat.x,seat.y,seat.width,seat.height);
            titlebox.innerHTML = "Vérification"
            messagebox.innerHTML = "Veuillez confirmer la présence de " +firstname +" "+lastname+" <button id='validatebtn'>oui</button><button id='conflictbtn'>non</button>";
            $(messagebox).on("click","#validatebtn", function(e){
                controller.checkUser(true);
            });
           $(messagebox).on("click","#conflictbtn", function(e){
               controller.checkUser(false);
           });
    });

    socket.on("room:timer",function(time){
        var servTime = new Date(time);
        servTime.setMinutes(servTime.getMinutes()+5);
        $(".home-container .board #row1 .appel .appel--content .step1 #countdown").countdown(servTime, function(event){
            $(this).html(event.strftime('%M:%S'));
        });

    });


    this.checkUser = function(answer)
    {
        if(answer === true)
        {
            console.log(scope.account);
            socket.emit("room:validateuser", scope.account,"yes");
            $(".home-container .board #row1 .appel .appel--content .step1").fadeOut(400);
            setTimeout(function(){
                $(".home-container .board #row1 .appel .appel--content .step2").fadeIn(400);
                controller.checkStatus();
                refreshtimer = setInterval(function(){
                   controller.checkStatus();
                },10000);
            },400);
        }
        else if (answer === false)
        {
            socket.emit("room:validateuser", scope.account,"no");
            $(".home-container .board #row1 .appel .appel--content .step1").fadeOut(400);
            setTimeout(function(){
                $(".home-container .board #row1 .appel .appel--content .step2").fadeIn(400);
                controller.checkStatus();
                refreshtimer = setInterval(function(){
                   controller.checkStatus();
                },10000);
            },400);

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

    this.checkStatus = function()
    {
        socket.emit("room:checkstatus",scope.account);
    }

    socket.on("room:status",function(status){
        if(status === "waitingValidation")
        {
            statusbox.innerHTML = "Personne n'a renseigné ton status pour le moment";
            var refreshTime = new Date();
            refreshTime.setSeconds(refreshTime.getSeconds()+10);
            $(refreshbox).countdown(refreshTime,function(event){
                $(this).html(event.strftime('Nouvelle vérification dans %S'));
            });
        }
        else if(status === "Conflict")
        {
            statusbox.innerHTML = "Tu as été renseigné absent";
            refreshbox.innerHTML = " ";
            clearTimeout(refreshtimer);
        }
        else if(status === "Validated")
        {
            statusbox.innerHTML = "C'est tout bon on t'as renseigné présent";
            refreshbox.innerHTML = " ";
            clearTimeout(refreshtimer);
        }

    });

    socket.on("room:notcreated",function(){
        clearTimeout(refreshtimer);
    });

    function getContainer() {

        var parent = $(".board #row1 .appel .appel--content");
        var w =parent.width();
        var h =parent.height();
        return [w, h];
    }


}])
