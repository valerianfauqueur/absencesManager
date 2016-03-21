var express = require('express'),
  routes = require('./routes/index');
var bodyParser = require('body-parser');
var app = module.exports = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var rooms_manager = require("./src/rooms.js");
var database_manager = require("./src/database.js");
var CronJob = require('cron').CronJob;

//Authentification using passport
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


//bind arguments without this

Function.prototype.arg = function() {
    if (typeof this !== "function")
        throw new TypeError("Function.prototype.arg needs to be called on a function");
    var slice = Array.prototype.slice,
        args = slice.call(arguments),
        fn = this,
        partial = function() {
            return fn.apply(this, args.concat(slice.call(arguments)));
        };
    partial.prototype = Object.create(this.prototype);
    return partial;
};

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));


//Settings passport
var Account = require('./models/account_model');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());
//mongodb://heroku_mfth0m01:doiu6n1ep3fmd4cjdr6l0t6vt8@ds031952.mlab.com:31952/heroku_mfth0m01
//mongodb://localhost/absencesApp
//db connection
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/absencesApp', function(err) {
    if(err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
    }
});

//Real time communication
io.on('connection',function(socket){



    socket.on("readyToJoin", function(user){
        var group = user.group.substr(0,2);
        var roomName = user.promotion + group;
        var roomExist = rooms_manager.roomExist(roomName);
        if(roomExist === false)
        {
            console.log("la room existe "+roomExist);
            socket.emit("room:notcreated")
        }
        else
        {
            var roomState = rooms_manager.getRoomState(roomName);
            socket.join(roomName);
            var checkIfExist = rooms_manager.userAlreadyInRoom(roomName,user.username);
            if(checkIfExist === true)
            {
                rooms_manager.userResetSocket(roomName,user.username,socket.id);
                var userToValidate = rooms_manager.getTheUserToValidate(roomName,user.username);
                if(userToValidate !== false)
                {
                    userToValidate = rooms_manager.getUser(roomName,userToValidate);
                }
            }
            else if(checkIfExist === false && roomState === "step2")
            {
                socket.emit("room:closed");
            }
            else
            {
                if(roomState === "step1")
                {
                    rooms_manager.addUserToRoom(roomName, user,socket.id);
                }
            }
            var accounts = database_manager.getAccounts(user.group,user.promotion);
            accounts.then(function(data){
                socket.emit('room:start',data.length);
                socket.emit("room:timer", rooms_manager.getTimer(roomName));
                if(rooms_manager.getRoomsTakenSeats(roomName,user.username) !== "none")
                {
                    var seatsInfo = rooms_manager.getRoomsTakenSeats(roomName,user.username);
                    socket.emit("room:AllSeatTaken",seatsInfo);
                }
                if(rooms_manager.userSeatIsAlreadySet(roomName,user.username) !== false)
                {
                    socket.emit("room:MySeat",rooms_manager.userSeatIsAlreadySet(roomName,user.username));
                }
                if(userToValidate)
                {
                    socket.emit("room:usertocheck",userToValidate);
                }
            });
        }
    });

    socket.on("room:setseat", function(user,seat){
        var group = user.group.substr(0,2);
        var roomName = user.promotion + group;
        var roomExist = rooms_manager.roomExist(roomName);
        if(roomExist)
        {
            var roomState = rooms_manager.getRoomState(roomName);
            if(roomState === "step1")
            {
                var isFree = rooms_manager.isRoomSeatFree(roomName,user.username,seat);
                if(isFree === true)
                {
                    rooms_manager.roomTakeSeat(roomName,user.username,seat);
                    rooms_manager.setUserState(roomName,user.username,"toValidate");
                    socket.broadcast.to(roomName).emit('room:seatTaken', seat);
                    socket.emit("room:seatTakenByYou", seat);
                }
                else if (isFree === "Youtookit")
                {
                    socket.emit("room:seatAlreadyUsedByYou");
                }
                else if (isFree === "alreadyHave")
                {
                    socket.emit("room:seatAlreadySet")
                }
                else
                {
                    socket.emit("room:seatAlreadyUsed");
                }
            }
            else
            {
                socket.emit("room:closed");
            }
        }
        else
        {
            socket.emit("room:notcreated");
        }

    });


    socket.on("room:validateuser", function(user,answer){
        var group = user.group.substr(0,2);
        var roomName = user.promotion + group;
        var roomExist = rooms_manager.roomExist(roomName);
        if(roomExist)
        {
            var roomState = rooms_manager.getRoomState(roomName);
            if(roomState === "step2")
            {
                var userHeHasToValidate = rooms_manager.getTheUserToValidate(roomName,user.username);
                rooms_manager.hasValidatedUser(roomName,user.username);
                if(answer === "yes")
                {
                    rooms_manager.setUserState(roomName,userHeHasToValidate,"Validated");
                }
                else if(answer === "no")
                {
                    rooms_manager.setUserState(roomName,userHeHasToValidate,"Conflict");
                }
            }
            else
            {
                socket.emit("room:verifover");
            }
        }
        else
        {
            socket.emit("room:notcreated");
        }
    });

    socket.on("room:checkstatus",function(user){
        var group = user.group.substr(0,2);
        var roomName = user.promotion + group;
        var roomExist = rooms_manager.roomExist(roomName);
        if(roomExist)
        {
            var getuser = rooms_manager.getUser(roomName,user.username);
            socket.emit("room:status",getuser.state);
        }
        else
        {
            socket.emit("room:notcreated");
        }
    });
});


var registerTimedFunction = function()
{
    var promotion,group,startHour,step;
       var shedule = database_manager.getSheduleInfo();
        shedule.then(function(shedule){
            var day = database_manager.getDay(new Date());
            console.log(shedule.length);
            for(var promo = 0, l = shedule.length;promo<l;promo++)
            {
                promotion = shedule[promo].promotion;
                group = shedule[promo].group;
                for(var course = 0, v = shedule[promo][day].length;course<v;course++)
                {
                    startHour = shedule[promo][day][course].start;
                    step = shedule[promo][day][course].step;
                    var date = new Date();
                    console.log(date);
                    date.setHours(7);
                    date.setMinutes(51);
                    date.setSeconds(0)
                    console.log(date);
                    new CronJob({
                        cronTime: date,
                        onTick: function(group,promotion){
                            var roomName = promotion + group;
                            console.log(roomName);
                            rooms_manager.createRoom(roomName);
                            rooms_manager.setTimer(roomName,new Date());
                            rooms_manager.setRoomState(roomName, "step1");
                            this.stop();
                        }.arg(group,promotion),
                        start: true,
                        timeZone: 'Europe/Paris'
                    });
                    date.setSeconds(30);
                    new CronJob({
                        cronTime: date,
                        onTick: function(group,promotion){
                            var roomName = promotion + group;
                            var numberOfUserToValidate = rooms_manager.getUsersToValidate(roomName);
                            for(var i =0, k = numberOfUserToValidate.length; i <k ;i++)
                            {
                                var rUserToValidate = rooms_manager.getRandomUserToValidate(roomName);
                                console.log("utilisateur "+rUserToValidate.username+" attribuer à "+numberOfUserToValidate[i].username);
                                rooms_manager.setUserToValidate(roomName,numberOfUserToValidate[i].username,rUserToValidate);
                            }

                            for(var d =0, l = numberOfUserToValidate.length; d < l ;d++)
                            {
                                var myUserToValidate = rooms_manager.getTheUserToValidate(roomName,numberOfUserToValidate[d].username);
                                console.log("my user to validate "+ myUserToValidate);
                                if(myUserToValidate === numberOfUserToValidate[d].username)
                                {
                                    var backupUser;
                                    do
                                    {
                                        backupUser = rooms_manager.getRandomUserToValidate(roomName);
                                        console.log("backup user "+backupUser.username);
                                        if(backupUser.username !== numberOfUserToValidate[d].username)
                                        {
                                            rooms_manager.setUserToValidate(roomName,numberOfUserToValidate[d].username,backupUser);
                                            rooms_manager.setUserToValidate(roomName,backupUser.username,numberOfUserToValidate[d]);
                                        }
                                    }
                                    while(backupUser.username === numberOfUserToValidate[d].username)
                                }
                            }

                            for(var p = 0, m = numberOfUserToValidate.length; p < m ;p++)
                            {
                               var sendUserToValidate = rooms_manager.getTheUserToValidate(roomName,numberOfUserToValidate[p].username);
                               console.log("send this "+sendUserToValidate);
                               console.log("à "+numberOfUserToValidate[p].username);
                               var userToSend = rooms_manager.getUser(roomName, sendUserToValidate);
                               rooms_manager.setUserState(roomName,sendUserToValidate,"waitingValidation");
                               io.to(numberOfUserToValidate[p].socketid).emit("room:usertocheck",userToSend);
                            }
                            rooms_manager.setRoomState(roomName, "step2");
                            rooms_manager.setTimer(roomName,new Date());
                            io.in(roomName).emit("room:timer", rooms_manager.getTimer(roomName));
                            this.stop();
                        }.arg(group,promotion),
                        start: true,
                        timeZone: 'Europe/Paris'
                    });
                    date.setSeconds(59);
                    new CronJob({
                        cronTime: date,
                        onTick: function(group,promotion){

                            var roomName = promotion + group;
                            var users = rooms_manager.getUsers(roomName);
                            console.log(users[0]);
                            database_manager.registerUsersCheckIn(users,group,promotion);
                            this.stop();
                        }.arg(group,promotion),
                        onComplete: function(){
                            var roomName = promotion + group;
                            rooms_manager.deleteRoom(roomName);
                        }.arg(group,promotion),
                        start: true,
                        timeZone: 'Europe/Paris'
                    });

                }
            }
        });

}

registerTimedFunction();



// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//routes

app.use('/', routes);
app.use('/partials/:name', routes);


app.use('*', routes);

http.listen(process.env.PORT || 3000, function(){
  console.log("Listening on port 3000");
});
