'use strict';
angular.module('absencesManager').controller('navController',["AuthService","$rootScope","$location","$window", function(authService,$rootScope,$location,$window) {
    var controller = this;
    this.formStep = 1;
    var scope = $rootScope;
    var datebox = document.querySelector(".informations .day .date");
    var timebox = document.querySelector(".informations .day .time");
    var logo = document.querySelector("#logo");


    $(logo).on("click",function(){
         $rootScope.$apply(function() {
           $location.path("/");
         });
    });

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

    this.getData = function()
    {
        authService.getData();
    }

    this.joinList = function()
    {
            authService.getData().then(function(){
                setTimeout(function(){
                    socket.emit("readyToJoin", scope.account);
                },400);
            });
    }
        var date = new Date();
        var hour = date.getHours();
        var min = date.getMinutes();
        var day = date.getDate();
        var month = parseInt(date.getMonth())+1;
        if(month <10)
        {
            month = "0"+month;
        }
        if(min <10)
        {
            min = "0"+min;
        }
        if(hour <10)
        {
            hour = "0"+hour;
        }
        if(day <10)
        {
            day = "0"+day;
        }
        var year = date.getFullYear();
        timebox.innerHTML= hour+":"+min;
        datebox.innerHTML=day+"/"+month+"/"+year;

    setInterval(function(){
        var date = new Date();
        var hour = date.getHours();
        var min = date.getMinutes();
        var day = date.getDate();
        var month = parseInt(date.getMonth())+1;
        if(month <10)
        {
            month = "0"+month;
        }
        if(min <10)
        {
            min = "0"+min;
        }
        if(hour <10)
        {
            hour = "0"+hour;
        }
        if(day <10)
        {
            day = "0"+day;
        }
        var year = date.getFullYear();
        timebox.innerHTML= hour+":"+min;
        datebox.innerHTML=day+"/"+month+"/"+year;
    },10000);


    socket.on("room:notcreated",function(){
        $rootScope.$apply(function() {
          $location.path("/");
        });
        $('.modal [data-remodal-id=course-does-not-exist]').remodal().open();
    });

    socket.on("room:closed",function(){
        $rootScope.$apply(function() {
          $location.path("/");
        });
        $('.modal [data-remodal-id=course-checkin-over]').remodal().open();
    });

    this.homeToAppel = function()
    {
        $(".board #row1").animate({
            height:"100%",
        },300);
        $(".board #row1 .appel--content").animate({
            height:"95%"
        },300);
        $(".board #row2").animate({
            height:"0%",
            opacity:0
        },300);
        $(".board #row1 .appel--content .text").animate({
            opacity:0,
        },300);

        setTimeout(function(){
            $rootScope.$apply(function() {
              $location.path("/appel");
            });
        },300);
    }

    this.homeToJustify = function()
    {
        $(this).animate({
            border:"0px"
        })
        $(".board #row2 .planning").animate({
            width:"0%",
            opacity:0
        },100);
        $(".board #row2 .justify--content").animate({
            width:"97.5%",
            height:"95%"
        },300);

        $(".board #row1").animate({
            height:"0%",
            opacity:0
        },300);

        $(".board #row2").animate({
           height:"100%"
        });

        $(".board #row2 .justify--content .text").animate({
            opacity:0,
        },300);

        setTimeout(function(){
            $rootScope.$apply(function() {
              $location.path("/justify");
            });
        },300);
    }

    this.homeToPlanning = function()
    {
        $(".board #row2 .justify").animate({
            width:"0%",
            opacity:0
        },300);

        $(".board #row2 .planning--content").animate({
            width:"97.5%",
            height:"95%"
        },300);

        $(".board #row1").animate({
            height:"0%",
            opacity:0
        },300);

        $(".board #row2").animate({
           height:"100%"
        });


        $(".board #row2 .planning--content .text").animate({
            opacity:0,
        },300);
        setTimeout(function(){
            $rootScope.$apply(function() {
              $location.path("/planning");
            });
        },300);
    }

}]);
